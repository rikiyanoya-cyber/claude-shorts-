# Quiz Shorts, all categories (2026-11-27). Same look and timing rules as the 難読地名 format (nandoku_short.py):
# jingle + "?" -> "あなたはわかるかな" + category box -> N questions (seal, question, prompt, clock) -> outro. No answers on screen.
# Question kinds: "kanji" (one big word, e.g. 海驢), "text" (a sentence, wrapped), "choice" (a word + numbered options).
# usage: python3 quiz_short.py episode.json out.mp4      (writes out_events.json for quiz_mix.py)
# episode.json: {"cat": "難読漢字", "box": ["難読漢字", "クイズ"], "part": 1, "think": 5, "prompt": "なんと読む？",
#                "items": [{"q": "海驢"}, {"q": "日本の国鳥は？", "kind": "text"}, {"q": "馬耳東風", "opts": [...]} ...],
#                "voiceB": "<category line mp3>", "voiceC": "<outro line mp3 or null = いくつ読めましたか>"}
import sys, subprocess, math, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
EP = json.load(open(sys.argv[1])); OUT = sys.argv[2]
W, H, FPS = 1080, 1920, 30
CREAM, INK, RED, PAPER2 = (246, 238, 220), (43, 38, 32), (158, 42, 36), (233, 222, 198)
SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-%s.ttc"
F = lambda w, s: ImageFont.truetype(SERIF % w, s, index=0)
ITEMS = EP["items"]; NQ = len(ITEMS); TN = EP["think"]; T0 = 1.0
dur = lambda p: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
VA, VB = .7, 2.5
HOOK = max(4.1, VB + dur(EP["voiceB"]) + .5)
QD = T0 + TN + .8
VC, VD, OUTRO = .15, 1.75, 4.75
END = HOOK + NQ * QD + OUTRO
NUM = "一二三四五六七八九十"
ease = lambda s: 1 - (1 - min(1, max(0, s))) ** 3
def back(s):
    s = min(1, max(0, s)); k = 1.6; return 1 + (k + 1) * (s - 1) ** 3 + k * (s - 1) ** 2

# ---- background: owner's washi paper + double ink frame + crimson corners
im = Image.open("/home/user/quiz_jp/assets/bg_washi.jpg").convert("RGB"); sc = max(W / im.width, H / im.height)
im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
BG = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H)).convert("RGBA")
d = ImageDraw.Draw(BG)
d.rectangle([44, 44, W - 44, H - 44], outline=INK, width=8); d.rectangle([62, 62, W - 62, H - 62], outline=INK, width=2)
for cx, cy in ((44, 44), (W - 44, 44), (44, H - 44), (W - 44, H - 44)): d.rectangle([cx - 16, cy - 16, cx + 16, cy + 16], fill=RED)

def text_c(dr, xy, s, font, fill, **kw): dr.text(xy, s, font=font, fill=fill, anchor="mm", **kw)
def fit(s, maxw, start, weight="Black", low=60):
    size = start
    while size > low:
        f = F(weight, size)
        if f.getlength(s) <= maxw: return f
        size -= 4
    return F(weight, low)
KINSOKU = "、。，．？！）」』ー…・々ぁぃぅぇぉっゃゅょァィゥェォッャュョ"
import re
def wrap(s, font, maxw):
    if "\n" in s: return [l for part in s.split("\n") for l in wrap(part, font, maxw)]   # hand breaks win
    """break at phrase ends (、。？！) first; inside a phrase never split a number/latin run or a short 「…」 quote"""
    phrases = [p for p in re.split(r"(?<=[、。？！])(?!」)", s) if p]
    lines, cur = [], ""
    for ph in phrases:
        if font.getlength(cur + ph) <= maxw: cur += ph; continue
        if cur: lines.append(cur); cur = ""
        for tok in re.findall(r"「[^」]{0,14}」|[0-9A-Za-z,.■□ ]+|.", ph):
            if font.getlength(cur + tok) > maxw and cur and tok[0] not in KINSOKU: lines.append(cur); cur = tok
            else: cur += tok
    if cur: lines.append(cur)
    return lines
def block(s, maxw, size, maxlines, weight="Black"):
    """largest size (<= size) at which s wraps into <= maxlines lines; hand-broken text keeps its lines exactly"""
    if "\n" in s:
        ls = s.split("\n")
        while size > 44 and max(F(weight, size).getlength(l) for l in ls) > maxw: size -= 2
        return F(weight, size), ls
    while size > 44:
        f = F(weight, size); ls = wrap(s, f, maxw)
        if len(ls) <= maxlines: return f, ls
        size -= 4
    f = F(weight, 44); return f, wrap(s, f, maxw)

TITLE = EP["cat"] + "クイズ" if not EP["cat"].endswith("なぞ") else EP["cat"]
def header(dr):
    dr.rectangle([62, 150, W - 62, 290], fill=INK)
    s = f"{TITLE}　パート{EP['part']}"; text_c(dr, (W / 2, 220), s, fit(s, 900, 70, low=40), CREAM)

def hook_layer(k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l)
    q = back(k / .3) * (1 - ease((k - VA + .1) / .3))
    if q > .01:
        t = Image.new("RGBA", (600, 600), (0, 0, 0, 0)); td = ImageDraw.Draw(t); text_c(td, (300, 300), "？", F("Black", 460), RED)
        t = t.resize((max(1, int(600 * max(q, .05))), max(1, int(600 * max(q, .05)))), Image.BILINEAR); l.alpha_composite(t, (int(W / 2 - t.width / 2), int(900 - t.height / 2)))
    a = ease((k - VA) / .35)
    text_c(dr, (W / 2, 700 - 30 * (1 - a)), "あなたはわかるかな？？", F("Black", 86), INK + (int(255 * a),))
    s = back((k - VB) / .4) if k > VB else 0
    if s > 0:
        t = Image.new("RGBA", (W, 520), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
        td.rounded_rectangle([110, 60, W - 110, 460], 30, fill=RED); td.rounded_rectangle([132, 82, W - 132, 438], 22, outline=CREAM, width=4)
        main, sub = EP["box"][0], (EP["box"][1] if len(EP["box"]) > 1 else "")
        if sub: text_c(td, (W / 2, 215), main, fit(main, 760, 168), CREAM); text_c(td, (W / 2, 370), sub, fit(sub, 760, 96), CREAM)
        else: text_c(td, (W / 2, 262), main, fit(main, 760, 168), CREAM)
        t = t.resize((max(1, int(W * s)), max(1, int(520 * s))), Image.BILINEAR); l.alpha_composite(t, (int(W / 2 - t.width / 2), int(1060 - t.height / 2)))
    if k > VB + .3:
        a = ease((k - VB - .3) / .3); text_c(dr, (W / 2, 1400), f"パート{EP['part']}", F("Black", 96), INK + (int(255 * a),))
    return l

def question(dr, it, a, y0=900):
    """draws the question; returns nothing. a = fade-in 0..1"""
    col = INK + (int(255 * a),); sh = PAPER2 + (int(255 * a),); dy = 40 * (1 - a)
    kind = it.get("kind", "choice" if "opts" in it else EP.get("kind", "kanji"))
    if kind == "kanji" and (len(it["q"]) <= 6 or F("Black", 96).getlength(it["q"]) <= 860):
        f = fit(it["q"], 860 if len(it["q"]) > 6 else 800, 330, low=90); dr.text((W / 2 + 6, y0 + dy + 8), it["q"], font=f, fill=sh, anchor="mm"); dr.text((W / 2, y0 + dy), it["q"], font=f, fill=col, anchor="mm")
    elif kind == "choice":
        f = fit(it["q"], 760, 160); dr.text((W / 2, 610 + dy), it["q"], font=f, fill=col, anchor="mm")
        for size in range(72, 42, -2):   # the three options must fit between y=830 and the clock (top ~1250)
            fo = F("Bold", size); wr = [wrap(o, fo, 740) for o in it["opts"]]
            if sum(len(w) for w in wr) * (size + 10) + 3 * 40 <= 400: break
        y = 870
        for j, ls in enumerate(wr):
            dr.rounded_rectangle([120, y - 34 + dy, 186, y + 32 + dy], 12, fill=RED + (int(255 * a),))
            dr.text((153, y - 2 + dy), f"{j + 1}", font=F("Black", 54), fill=CREAM + (int(255 * a),), anchor="mm")
            for li, line in enumerate(ls): dr.text((210, y + dy + li * (fo.size + 10)), line, font=fo, fill=col, anchor="lm")
            y += len(ls) * (fo.size + 10) + 40
    else:   # text: wrap into up to 4 lines, centred on y0
        big = kind == "kanji"
        f, ls = block(it["q"], 880, 140 if big else 92, 2 if big else 6)
        lh = f.size * 1.32; top = y0 - lh * (len(ls) - 1) / 2
        for li, line in enumerate(ls): dr.text((W / 2, top + li * lh + dy), line, font=f, fill=col, anchor="mm")

def q_layer(i, k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l); header(dr); it = ITEMS[i]
    s = back(k / .35)
    seal = Image.new("RGBA", (420, 200), (0, 0, 0, 0)); sd = ImageDraw.Draw(seal)
    sd.rounded_rectangle([10, 10, 410, 190], 22, fill=RED); text_c(sd, (210, 98), f"第{NUM[i]}問", F("Black", 104), CREAM)
    seal = seal.resize((max(1, int(420 * s)), max(1, int(200 * s))), Image.BILINEAR); l.alpha_composite(seal, (int(W / 2 - seal.width / 2), int(440 - seal.height / 2)))
    a = ease((k - .2) / .4)
    if a > 0: question(dr, it, a)
    b = ease((k - .9) / .4); pr = it.get("p", EP.get("prompt", ""))
    if b > 0 and pr: text_c(dr, (W / 2, 765 if "opts" in it else 1200), pr, F("Bold", 60 if "opts" in it else 76), RED + (int(255 * b),))
    clock(dr, k)
    return l

def clock(dr, k):
    u = min(1, max(0, (k - T0) / TN)); left = TN - int(min(TN, max(0, k - T0)))
    cx, cy, R = 380, 1395, 95; up = k >= T0 + TN
    dr.ellipse([cx - R - 6, cy - R - 6, cx + R + 6, cy + R + 6], fill=INK); dr.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(255, 250, 238))
    if u < 1: dr.pieslice([cx - R + 14, cy - R + 14, cx + R - 14, cy + R - 14], -90 + 360 * u, 270, fill=RED + (200,))
    for m in range(12):
        a = math.radians(m * 30); r0 = R - (20 if m % 3 == 0 else 12)
        dr.line([(cx + r0 * math.sin(a), cy - r0 * math.cos(a)), (cx + (R - 4) * math.sin(a), cy - (R - 4) * math.cos(a))], fill=INK, width=5 if m % 3 == 0 else 3)
    a = 2 * math.pi * u; dr.line([(cx, cy), (cx + (R - 26) * math.sin(a), cy - (R - 26) * math.cos(a))], fill=INK, width=9)
    dr.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], fill=INK); dr.rounded_rectangle([cx - 26, cy - R - 40, cx + 26, cy - R - 8], 8, fill=INK)
    if up: text_c(dr, (735, 1395), "時間です！", F("Black", 80), RED)
    else:
        text_c(dr, (590, 1410), "のこり", F("Bold", 56), INK)
        text_c(dr, (760, 1387), str(left), F("Black", 150 if left < 10 else 120), RED if left <= 3 else INK); text_c(dr, (885, 1410), "秒", F("Bold", 56), INK)

OUT_Q = EP.get("outro", "いくつ読めましたか？")
def outro_layer(k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l)
    a = ease((k - VC) / .35); text_c(dr, (W / 2, 620), OUT_Q, F("Black", 84), INK + (int(255 * a),))
    s = back((k - VD) / .4) if k > VD else 0
    if s > 0:
        t = Image.new("RGBA", (W, 560), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
        td.rounded_rectangle([110, 40, W - 110, 520], 30, fill=RED); td.rounded_rectangle([132, 62, W - 132, 498], 22, outline=CREAM, width=4)
        text_c(td, (W / 2, 205), "答えは", F("Black", 130), CREAM); text_c(td, (W / 2, 370), "コメント欄で", F("Black", 130), CREAM)
        t = t.resize((max(1, int(W * s)), max(1, int(560 * s))), Image.BILINEAR); l.alpha_composite(t, (int(W / 2 - t.width / 2), int(1000 - t.height / 2)))
    c = ease((k - VD - .6) / .4)
    if c > 0: text_c(dr, (W / 2, 1370), "↓", F("Black", 120), RED + (int(255 * c),))
    return l

if __name__ == "__main__":
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
    for fi in range(int(END * FPS)):
        t = fi / FPS; fr = BG.copy()
        if t < HOOK: lay, k0 = hook_layer(t), t
        elif t < HOOK + NQ * QD: i = int((t - HOOK) // QD); k0 = t - HOOK - i * QD; lay = q_layer(i, k0)
        else: k0 = t - HOOK - NQ * QD; lay = outro_layer(k0)
        fr.alpha_composite(lay)
        if k0 < .12 and t > .1: fr.alpha_composite(Image.new("RGBA", (W, H), CREAM + (int(160 * (1 - k0 / .12)),)))
        ff.stdin.write(fr.convert("RGB").tobytes())
    ff.stdin.close(); ff.wait()
    Q = [HOOK + i * QD for i in range(NQ)]; O = HOOK + NQ * QD
    json.dump({"end": END, "voice": {"A": VA, "B": VB, "C": O + VC, "D": O + VD}, "voiceB": EP["voiceB"], "voiceC": EP.get("voiceC"),
               "seal": Q, "reveal": [q + .2 for q in Q], "ticks": [q + T0 + j for q in Q for j in range(TN)],
               "timeup": [q + T0 + TN for q in Q], "tn": TN, "boxes": [O + VD], "jingle": 0.0},
              open(OUT.rsplit(".", 1)[0] + "_events.json", "w"), indent=1)
    print("done", round(END, 2))
