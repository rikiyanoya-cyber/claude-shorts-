# 難読地名クイズ Shorts (2026-11-27): hook -> 3 questions (big kanji + number, no answers) -> "答えはコメント欄へ".
# Cards are typeset in code (Noto Serif CJK JP = Mincho). Colours from the channel brief: cream / ink #2B2620 / crimson #9E2A24.
# No brand (character, catchphrase) baked in while the brand is undecided. Silent video; the BGM is muxed separately.
# usage: python3 nandoku_short.py out.mp4 "国立" "東雲" "高輪"
import sys, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
OUT, QS = sys.argv[1], sys.argv[2:5]
W, H, FPS = 1080, 1920, 30
CREAM, INK, RED, PAPER2 = (246, 238, 220), (43, 38, 32), (158, 42, 36), (233, 222, 198)
SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-%s.ttc"
F = lambda w, s: ImageFont.truetype(SERIF % w, s, index=0)
# timing follows the narration (voice_hook_kohei: A "あなたはわかるかな" B "難読地名クイズ" C "いくつ読めましたか" D "答えはコメント欄で")
HOOK, QD, OUTRO = 4.1, 7.0, 4.6
VA, VB = .7, 2.5                   # hook lines start (after the owner's quiz jingle at 0:00)
VC, VD = .15, 1.6                  # outro lines start (from the outro start)
T0, TN = 1.0, 6                    # thinking clock: starts at k=1.0, counts TN seconds; time-up at k=T0+TN
END = HOOK + 3 * QD + OUTRO
ease = lambda s: 1 - (1 - min(1, max(0, s))) ** 3
def back(s):
    s = min(1, max(0, s)); k = 1.6; return 1 + (k + 1) * (s - 1) ** 3 + k * (s - 1) ** 2

# ---- paper background with a double ink frame (built once)
rng = np.random.default_rng(3)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = 1 - .10 * (np.hypot((xx - W / 2) / W, (yy - H / 2) / H) * 2) ** 2
n = np.asarray(Image.fromarray((rng.random((H // 3, W // 3)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
bg = np.array(CREAM, np.float32)[None, None] * vig[..., None] + (n[..., None] - .5) * 10
BG = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert("RGBA")
d = ImageDraw.Draw(BG)
d.rectangle([44, 44, W - 44, H - 44], outline=INK, width=8); d.rectangle([62, 62, W - 62, H - 62], outline=INK, width=2)
for cx, cy in ((44, 44), (W - 44, 44), (44, H - 44), (W - 44, H - 44)):
    d.rectangle([cx - 16, cy - 16, cx + 16, cy + 16], fill=RED)

def text_c(dr, xy, s, font, fill, **kw): dr.text(xy, s, font=font, fill=fill, anchor="mm", **kw)
def fit(s, maxw, start, weight="Black"):
    size = start
    while size > 60:
        f = F(weight, size)
        if f.getlength(s) <= maxw: return f
        size -= 6
    return F(weight, size)

def header(dr):   # the running title band (same on every question card)
    dr.rectangle([62, 150, W - 62, 290], fill=INK)
    text_c(dr, (W / 2, 220), "難読地名クイズ", F("Black", 78), CREAM)

def hook_layer(k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l)
    q = back(k / .3) * (1 - ease((k - VA + .1) / .3))   # a big "？" pops with the jingle, then gives way to the line
    if q > .01:
        t = Image.new("RGBA", (600, 600), (0, 0, 0, 0)); td = ImageDraw.Draw(t); text_c(td, (300, 300), "？", F("Black", 460), RED)
        t = t.resize((max(1, int(600 * max(q, .05))), max(1, int(600 * max(q, .05)))), Image.BILINEAR); l.alpha_composite(t, (int(W / 2 - t.width / 2), int(900 - t.height / 2)))
    a = ease((k - VA) / .35)
    text_c(dr, (W / 2, 700 - 30 * (1 - a)), "あなたはわかるかな？？", F("Black", 86), INK + (int(255 * a),))
    s = back((k - VB) / .4) if k > VB else 0
    if s > 0:
        t = Image.new("RGBA", (W, 520), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
        td.rounded_rectangle([150, 60, W - 150, 460], 30, fill=RED); td.rounded_rectangle([172, 82, W - 172, 438], 22, outline=CREAM, width=4)
        text_c(td, (W / 2, 215), "難読地名", F("Black", 168), CREAM); text_c(td, (W / 2, 370), "クイズ", F("Black", 96), CREAM)
        t = t.resize((max(1, int(W * s)), max(1, int(520 * s))), Image.BILINEAR)
        l.alpha_composite(t, (int(W / 2 - t.width / 2), int(1060 - t.height / 2)))
    return l

def q_layer(i, k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l); header(dr)
    # number seal: 第N問
    s = back(k / .35)
    seal = Image.new("RGBA", (420, 200), (0, 0, 0, 0)); sd = ImageDraw.Draw(seal)
    sd.rounded_rectangle([10, 10, 410, 190], 22, fill=RED); text_c(sd, (210, 98), f"第{'一二三'[i]}問", F("Black", 104), CREAM)
    seal = seal.resize((max(1, int(420 * s)), max(1, int(200 * s))), Image.BILINEAR); l.alpha_composite(seal, (int(W / 2 - seal.width / 2), int(470 - seal.height / 2)))
    # the place name, as large as it fits
    a = ease((k - .2) / .4)
    if a > 0:
        f = fit(QS[i], 800, 330); y = 900 + 40 * (1 - a)
        dr.text((W / 2 + 6, y + 8), QS[i], font=f, fill=PAPER2 + (int(255 * a),), anchor="mm")
        dr.text((W / 2, y), QS[i], font=f, fill=INK + (int(255 * a),), anchor="mm")
    b = ease((k - .9) / .4)
    if b > 0: text_c(dr, (W / 2, 1170), "なんと読む？", F("Bold", 80), RED + (int(255 * b),))
    clock(dr, k)
    return l

def clock(dr, k):
    """thinking time: a clock whose red wedge empties, and 'のこり N 秒' beside it (kept above the Shorts overlay)"""
    u = min(1, max(0, (k - T0) / TN)); left = TN - int(min(TN, max(0, k - T0)))
    cx, cy, R = 380, 1395, 95; up = k >= T0 + TN
    dr.ellipse([cx - R - 6, cy - R - 6, cx + R + 6, cy + R + 6], fill=INK)
    dr.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(255, 250, 238))
    if u < 1: dr.pieslice([cx - R + 14, cy - R + 14, cx + R - 14, cy + R - 14], -90 + 360 * u, 270, fill=RED + (200,))
    for m in range(12):
        a = math.radians(m * 30); r0 = R - (20 if m % 3 == 0 else 12)
        dr.line([(cx + r0 * math.sin(a), cy - r0 * math.cos(a)), (cx + (R - 4) * math.sin(a), cy - (R - 4) * math.cos(a))], fill=INK, width=5 if m % 3 == 0 else 3)
    a = 2 * math.pi * u; dr.line([(cx, cy), (cx + (R - 26) * math.sin(a), cy - (R - 26) * math.cos(a))], fill=INK, width=9)
    dr.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], fill=INK)
    dr.rounded_rectangle([cx - 26, cy - R - 40, cx + 26, cy - R - 8], 8, fill=INK)   # the stopwatch crown
    if up: text_c(dr, (690, 1395), "時間です！", F("Black", 84), RED)
    else:
        text_c(dr, (600, 1410), "のこり", F("Bold", 56), INK)
        text_c(dr, (760, 1387), str(left), F("Black", 150), RED if left <= 3 else INK); text_c(dr, (870, 1410), "秒", F("Bold", 56), INK)

def outro_layer(k):
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(l)
    a = ease((k - VC) / .35)
    text_c(dr, (W / 2, 620), "いくつ読めましたか？", F("Black", 84), INK + (int(255 * a),))
    s = back((k - VD) / .4) if k > VD else 0
    if s > 0:
        t = Image.new("RGBA", (W, 560), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
        td.rounded_rectangle([110, 40, W - 110, 520], 30, fill=RED); td.rounded_rectangle([132, 62, W - 132, 498], 22, outline=CREAM, width=4)
        text_c(td, (W / 2, 205), "答えは", F("Black", 130), CREAM); text_c(td, (W / 2, 370), "コメント欄で", F("Black", 130), CREAM)
        t = t.resize((max(1, int(W * s)), max(1, int(560 * s))), Image.BILINEAR); l.alpha_composite(t, (int(W / 2 - t.width / 2), int(1000 - t.height / 2)))
    c = ease((k - VD - .6) / .4)
    if c > 0: text_c(dr, (W / 2, 1370), "↓", F("Black", 120), RED + (int(255 * c),))
    return l

ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
for fi in range(int(END * FPS)):
    t = fi / FPS; fr = BG.copy()
    if t < HOOK: lay, k0 = hook_layer(t), t
    elif t < HOOK + 3 * QD: i = int((t - HOOK) // QD); k0 = t - HOOK - i * QD; lay = q_layer(i, k0)
    else: k0 = t - HOOK - 3 * QD; lay = outro_layer(k0)
    fr.alpha_composite(lay)
    if k0 < .12 and t > .1: fr.alpha_composite(Image.new("RGBA", (W, H), CREAM + (int(160 * (1 - k0 / .12)),)))   # soft wipe between cards
    ff.stdin.write(fr.convert("RGB").tobytes())
ff.stdin.close(); ff.wait()
import json   # sound events for the mix (quiz_mix.py)
Q = [HOOK + i * QD for i in range(3)]; O = HOOK + 3 * QD
json.dump({"end": END, "voice": {"A": VA, "B": VB, "C": O + VC, "D": O + VD}, "seal": Q, "reveal": [q + .2 for q in Q],
           "ticks": [q + T0 + j for q in Q for j in range(TN)], "timeup": [q + T0 + TN for q in Q], "boxes": [O + VD], "jingle": 0.0},
          open(OUT.rsplit(".", 1)[0] + "_events.json", "w"), indent=1)
print("done", END)
