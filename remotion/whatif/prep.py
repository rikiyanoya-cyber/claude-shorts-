#!/usr/bin/env python3
"""Prepare media + timeline for the WhatIfLong composition.

Reads a config JSON (see whatif/config.example.json), then for each part:
  - trims the vertical episode at the "You decide." line and scales it to 608x1080
  - grabs the last frame (for the vote-result freeze)
  - builds a reversed, sped-up tail clip with tape-rewind audio (into THE OTHER PATH)
Writes everything to remotion/public/whatif/ plus timeline.json for the composition.

Usage: python3 whatif/prep.py whatif/config.json
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "whatif")
FPS = 30


def ff(*a):
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", *a], check=True)


def dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def snap(x):
    return round(x * FPS) / FPS


def main(cfg_path):
    cfg = json.load(open(cfg_path))
    os.makedirs(OUT, exist_ok=True)
    segs = [{"kind": "opening", "dur": cfg.get("openingDur", 14), "voice": cfg.get("openingVoice")}]
    if segs[0]["voice"]:
        segs[0]["dur"] = snap(max(segs[0]["dur"], dur(cfg["openingVoice"]) + 3.5))
        ff("-i", cfg["openingVoice"], "-c:a", "aac", "-b:a", "192k", os.path.join(OUT, "opening_voice.m4a"))
        segs[0]["voice"] = "whatif/opening_voice.m4a"
    for i, p in enumerate(cfg["parts"], 1):
        cut = snap(p["cut"])
        pv = os.path.join(OUT, f"p{i}.mp4")
        if not os.path.exists(pv) or cfg.get("force"):
            ff("-i", p["src"], "-t", f"{cut}", "-vf", "scale=608:1080:flags=lanczos,fps=30",
               "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", pv)
            ff("-sseof", "-0.1", "-i", pv, "-frames:v", "1", "-update", "1", os.path.join(OUT, f"p{i}_last.jpg"))
            # 2.4s of tail played backwards at 2x -> 1.2s, with reversed + pitched-up audio (tape rewind)
            ff("-ss", f"{cut - 2.4}", "-i", pv, "-t", "2.4",
               "-filter_complex", "[0:v]reverse,setpts=PTS/2[v];[0:a]areverse,asetrate=88200,aresample=44100,volume=0.7[a]",
               "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
               "-c:a", "aac", os.path.join(OUT, f"p{i}_rev.mp4"))
        segs.append({"kind": "part", "n": i, "src": f"whatif/p{i}.mp4", "dur": snap(dur(pv)),
                     "chapter": p["chapter"]})
        segs.append({"kind": "result", "n": i, "img": f"whatif/p{i}_last.jpg", "dur": 3.0})
        segs.append({"kind": "rewind", "n": i, "src": f"whatif/p{i}_rev.mp4", "dur": 1.2})
        segs.append({"kind": "title", "n": i, "dur": 1.8})
        o = p.get("other")
        if o and os.path.exists(o):
            ov = os.path.join(OUT, f"o{i}.mp4")
            ff("-i", o, "-vf", "scale=608:1080:flags=lanczos,fps=30", "-c:v", "libx264", "-crf", "18",
               "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", ov)
            segs.append({"kind": "other", "n": i, "src": f"whatif/o{i}.mp4", "dur": snap(dur(ov))})
        else:
            segs.append({"kind": "other", "n": i, "src": None, "dur": p.get("otherDur", 6)})
        segs.append({"kind": "ending", "n": i, "dur": 3.2})
        if i < len(cfg["parts"]):
            segs.append({"kind": "back", "n": i, "dur": 1.6})
    segs.append({"kind": "outro", "dur": 9, "tease": "whatif/tease.mp4" if cfg.get("tease") else None})
    if cfg.get("tease"):
        t = cfg["tease"]
        ff("-ss", str(t["from"]), "-i", t["src"], "-t", str(t["len"]), "-vf", "scale=608:1080:flags=lanczos,fps=30",
           "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", os.path.join(OUT, "tease.mp4"))
    t = 0.0
    for s in segs:
        s["from"] = round(t * FPS)
        s["frames"] = round(s["dur"] * FPS)
        t += s["frames"] / FPS
    tl = {"choices": cfg["choices"], "endings": cfg["endings"], "segments": segs,
          "totalFrames": round(t * FPS)}
    json.dump(tl, open(os.path.join(OUT, "timeline.json"), "w"), indent=1)
    print(f"timeline: {len(segs)} segments, {t/60:.1f} min")


if __name__ == "__main__":
    main(sys.argv[1])
