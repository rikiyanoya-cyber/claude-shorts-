#!/usr/bin/env python3
"""Prepare media + timeline for the AltPathLong composition.

Config (see whatif/config.example.json):
  realParts   : [{src, cut}]  voted episodes, fast-forwarded in the opening
  bridgeVoice : narration over the freeze after the fast-forward
  ep1         : {src, keep: [[a, b], ...]}  episode 1, condensed to the kept ranges
  episodes    : [{src, title}]  alternate-path episodes 2..N (finished vertical videos)
  labels      : on-screen names (brand, series, alt, continuesAfter, realWhere, handle)
  realChoices / altChoices : [{a, b}]  for the path map
Writes trimmed/scaled media into remotion/public/whatif/ and timeline.json.

Usage: python3 whatif/prep.py config.json [--force]
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "whatif")
FPS = 30
V = "scale=608:1080:flags=lanczos,fps=30"
ENC = ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p"]


def ff(*a):
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", *a], check=True)


def dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def need(path, force):
    return force or not os.path.exists(path)


def main(cfg_path, force=False):
    cfg = json.load(open(cfg_path))
    os.makedirs(OUT, exist_ok=True)
    o = lambda n: os.path.join(OUT, n)
    speed = cfg.get("ffSpeed", 24)

    # 1. fast-forward through the voted story (video only) + its reverse for the rewind
    if need(o("ff.mp4"), force):
        ins, parts = [], []
        for i, p in enumerate(cfg["realParts"]):
            ins += ["-t", str(p["cut"]), "-i", p["src"]]
            parts.append(f"[{i}:v]{V},setsar=1[v{i}]")
        n = len(cfg["realParts"])
        fc = ";".join(parts) + ";" + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,setpts=PTS/{speed},fps=30[v]"
        ff(*ins, "-filter_complex", fc, "-map", "[v]", *ENC, o("ff.mp4"))
        ff("-sseof", "-0.1", "-i", o("ff.mp4"), "-frames:v", "1", "-update", "1", o("ff_last.jpg"))
        ff("-i", o("ff.mp4"), "-vf", "reverse,setpts=PTS/6,fps=30", *ENC, o("ff_rev.mp4"))
    if cfg.get("bridgeVoice") and need(o("bridge.m4a"), force):
        ff("-i", cfg["bridgeVoice"], "-c:a", "aac", "-b:a", "192k", o("bridge.m4a"))

    # 2. episode 1, condensed to the kept line ranges (short audio fades at each join)
    e1 = cfg["ep1"]
    if need(o("ep1.mp4"), force):
        fc, labels = [], ""
        for i, (a, b) in enumerate(e1["keep"]):
            fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,{V}[v{i}]")
            fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={b-a-0.06:.3f}:d=0.06[a{i}]")
            labels += f"[v{i}][a{i}]"
        fc.append(f"{labels}concat=n={len(e1['keep'])}:v=1:a=1[v][a]")
        ff("-i", e1["src"], "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]", *ENC,
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", o("ep1.mp4"))
    # 3. alternate-path episodes
    eps = [{"src": "whatif/ep1.mp4", "title": e1.get("title", "The Transfer"), "n": 1}]
    for i, e in enumerate(cfg["episodes"], 2):
        name = f"ep{i}.mp4"
        if os.path.exists(e["src"]) and need(o(name), force):
            ff("-i", e["src"], "-vf", V, *ENC, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", o(name))
        eps.append({"src": f"whatif/{name}" if os.path.exists(o(name)) else None, "title": e["title"], "n": i,
                    "dur": e.get("dur", 6)})
    for e in eps:
        p = os.path.join(ROOT, "public", e["src"]) if e["src"] else None
        if p:
            last = o(f"ep{e['n']}_last.jpg")
            if need(last, force):
                ff("-sseof", "-0.1", "-i", p, "-frames:v", "1", "-update", "1", last)
            e["dur"] = dur(p)
            e["last"] = f"whatif/ep{e['n']}_last.jpg"

    # 4. timeline
    segs = [{"kind": "ff", "src": "whatif/ff.mp4", "dur": dur(o("ff.mp4"))},
            {"kind": "bridge", "img": "whatif/ff_last.jpg", "voice": "whatif/bridge.m4a" if cfg.get("bridgeVoice") else None,
             "dur": (dur(cfg["bridgeVoice"]) if cfg.get("bridgeVoice") else 5) + 1.2},
            {"kind": "rewind", "src": "whatif/ff_rev.mp4", "dur": dur(o("ff_rev.mp4"))},
            {"kind": "title", "dur": 2.4}]
    for k, e in enumerate(eps):
        if k:
            segs.append({"kind": "eptitle", "n": e["n"], "title": e["title"], "dur": 1.8})
        segs.append({"kind": "ep", "n": e["n"], "src": e["src"], "title": e["title"], "dur": e["dur"]})
        if k < len(eps) - 1:
            segs.append({"kind": "awins", "n": e["n"], "img": e.get("last"), "dur": 2.8})
    segs.append({"kind": "outro", "dur": 8})
    t = 0
    for s in segs:
        s["from"] = t
        s["frames"] = round(s.pop("dur") * FPS)
        t += s["frames"]
    tl = {"labels": cfg["labels"], "realChoices": cfg["realChoices"], "altChoices": cfg["altChoices"], "segments": segs, "totalFrames": t}
    json.dump(tl, open(o("timeline.json"), "w"), indent=1)
    print(f"timeline: {len(segs)} segments, {t / FPS / 60:.1f} min")


if __name__ == "__main__":
    main(sys.argv[1], "--force" in sys.argv)
