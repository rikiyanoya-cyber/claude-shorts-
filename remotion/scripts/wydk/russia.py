# The World You Don't Know — "If you were born in Russia" (2026-11-27). Hungary renderer with the new safe-area layout:
# nothing above y=260 (Instagram clock / buttons), top cards start at y=330, a wide "AGE n" badge sits on the card's top-left corner.
# Opening (globe frames from globe_space_spin.py) -> illustration backgrounds with cards, stamps and the age badge -> end screen.
# usage: python3 russia.py <work dir> <kit dir> out.mp4 [t0 t1]   (work dir: img2x/, globe/)
import sys, os, math, subprocess, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
WD, KIT, OUTF = sys.argv[1:4]
T0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
T1 = float(sys.argv[5]) if len(sys.argv) > 5 else None
sys.path.insert(0, KIT)
from tiw_style import *   # W, H, colors, F_BIG, F_HAND, card, outlined, strike, check, top_shade, age_badge, grain
FPS = 30; END = 115.2
ease = lambda s: 1 - (1 - min(1, max(0, s))) ** 3
eio = lambda s: (lambda x: 3 * x * x - 2 * x * x * x)(min(1, max(0, s)))
def back(s):
    s = min(1, max(0, s)); k = 1.7; return 1 + (k + 1) * (s - 1) ** 3 + k * (s - 1) ** 2


# ₽ is missing from the kit fonts: draw it with DejaVu Sans Bold, everything else with the kit font
from PIL import ImageFont
RUB_F = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def rtext(d, xy, txt, font, anchor="mm", **kw):
    if "₽" not in txt: d.text(xy, txt, font=font, anchor=anchor, **kw); return
    rf = ImageFont.truetype(RUB_F, int(font.size * .82)); segs = [(s, font) for s in txt.split("₽")]
    parts = []
    for i, (s, f) in enumerate(segs):
        if i: parts.append(("₽", rf))
        if s: parts.append((s, f))
    widths = [d.textlength(s, font=f) for s, f in parts]; x = xy[0] - (sum(widths) / 2 if anchor[0] == "m" else 0)
    for (s, f), w in zip(parts, widths): d.text((x, xy[1]), s, font=f, anchor="l" + anchor[1], **kw); x += w
def outlined(layer, xy, text, font, fill=CREAM, stroke=INK, sw=8, anchor="mm", shadow=True):
    d = ImageDraw.Draw(layer)
    if shadow: rtext(d, (xy[0] + 6, xy[1] + 8), text, font, anchor, fill=INK + (170,), stroke_width=sw, stroke_fill=INK + (170,))
    rtext(d, xy, text, font, anchor, fill=fill + (255,), stroke_width=sw, stroke_fill=stroke + (255,))


FPS = 30; END = 114.6
GLOBE_END, GLOBE_N = 5.7, 171
LOOP_T = 110.2   # closing card over the opening globe; the last frame lands on globe frame 0 so the video loops
SHOTS = [   # (image, start s, move, focus, zoom) — scene numbers from marketing's sheet; 37-38-39-36 close
    ("01", 5.7, "in", (.5, .55)), ("02", 10.65, "in", (.5, .6)), ("03", 12.95, "out", (.5, .6)), ("04", 18.8, "in", (.5, .6)),
    ("05", 21.25, "in", (.5, .5)), ("06", 23.8, "in", (.5, .42)), ("07", 26.95, "out", (.5, .38)), ("08", 30.05, "in", (.5, .55)),
    ("09", 33.1, "in", (.5, .55)), ("10", 35.25, "in", (.5, .6)), ("11", 38.35, "in", (.5, .6)), ("12", 39.4, "in", (.5, .6)),
    ("13", 40.6, "out", (.5, .6)), ("14", 43.0, "in", (.5, .6)), ("15", 46.45, "in", (.5, .55)), ("16", 49.15, "in", (.5, .42)),
    ("17", 54.4, "in", (.5, .55)), ("18", 55.7, "out", (.5, .5)), ("19", 57.45, "in", (.5, .6)), ("20", 60.15, "in", (.6, .55)),
    ("21", 62.1, "in", (.45, .55)), ("22", 64.15, "out", (.5, .55)), ("23", 68.05, "in", (.45, .5)), ("24", 71.5, "in", (.5, .55)),
    ("25", 73.95, "in", (.5, .55)), ("26", 75.4, "out", (.5, .6)), ("27", 77.95, "in", (.5, .6)), ("28", 80.8, "in", (.5, .6)),
    ("29", 82.95, "in", (.5, .42)), ("30", 85.95, "out", (.5, .6)), ("31", 90.15, "in", (.5, .65)), ("32", 91.2, "candle", (.68, .55)),
    ("33", 92.9, "in", (.5, .36)), ("34", 96.25, "in", (.5, .55)), ("35", 98.15, "in", (.5, .6)),
    ("37", 102.15, "in", (.5, .5)), ("38", 103.75, "in", (.5, .6)), ("39", 105.15, "in", (.5, .55)), ("36", 108.05, "out", (.5, .6)),
    ("LOOP", LOOP_T, "", (.5, .5)),
]
IMG = {}
def load(n):
    if n in IMG: return IMG[n]
    im = Image.open(f"{WD}/img2x/{n}.jpg").convert("RGB")
    s = max(W * 1.16 / im.width, H * 1.16 / im.height); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    IMG[n] = im; return im
def bg_frame(n, u, mv, f):
    im = load(n); e = eio(u)
    z = {"in": 1.0 + .12 * e, "out": 1.12 - .12 * e, "candle": 1.0 + .45 * e}.get(mv, 1.08)   # scene 32: the cake is small, push in on the candle
    cw, ch = min(W / z, im.width), min(H / z, im.height)
    fx, fy = f
    if mv == "candle": fx, fy = .5 + (fx - .5) * e, .5 + (fy - .5) * e   # face and the candle both stay in frame
    cx = min(max(cw / 2, fx * im.width), im.width - cw / 2); cy = min(max(ch / 2, fy * im.height), im.height - ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).convert("RGBA")

# ---------- overlay layers (built once, animated by alpha + a small pop)
L = {}
def layer(key, build):
    if key not in L:
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); build(lay); L[key] = (lay, lay.getbbox())
    return L[key]
def put(fr, key, build, k, dur=None, pop=True):
    if k < 0 or (dur is not None and k > dur): return
    lay, bb = layer(key, build)
    if bb is None: return
    a = min(1, k / .12) * (min(1, (dur - k) / .15) if dur is not None else 1)
    s = back(k / .3) if pop else 1
    crop = lay.crop(bb)
    if abs(s - 1) > .005: crop = crop.resize((max(1, int(crop.width * s)), max(1, int(crop.height * s))), Image.BILINEAR)
    if a < 1: crop.putalpha(crop.getchannel("A").point(lambda v: int(v * a)))
    cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    fr.alpha_composite(crop, (int(cx - crop.width / 2), int(cy - crop.height / 2)))
def shade(l): top_shade(l)
Y0 = 330   # safe area: the top 260 px sit under Instagram's clock and buttons
def card2(l, title, big, seed, color=AMBER, big_size=120):
    card(l, (110, Y0, 970, Y0 + 290), seed=seed); outlined(l, (540, Y0 + 98), title, F_HAND(62), fill=INK, sw=0, shadow=False)   # title clears the AGE badge
    outlined(l, (540, Y0 + 200), big, F_BIG(big_size), fill=color)
def card3(l, top, big, bottom, seed, color=AMBER, big_size=130):
    card(l, (110, Y0, 970, Y0 + 350), seed=seed); outlined(l, (540, Y0 + 72), top, F_HAND(62), fill=INK, sw=0, shadow=False)
    outlined(l, (540, Y0 + 180), big, F_BIG(big_size), fill=color); outlined(l, (540, Y0 + 285), bottom, F_HAND(60), fill=INK, sw=0, shadow=False)
def c_110(l): card3(l, "OUT OF EVERY", "1 IN 110", "babies on Earth", 11, big_size=140)
def c_tz(l): card2(l, "YOUR COUNTRY HAS", "11 TIME ZONES", 13, big_size=110)
def c_rub1(l): card2(l, "FOR YOUR PARENTS", "729,000 ₽", 4, big_size=130)
def c_ivan(l): card2(l, "YOUR DAD: IVAN", "IVANOVICH", 3, big_size=130)
def c_yours(l):
    card(l, (110, Y0, 970, Y0 + 290), seed=19); outlined(l, (540, Y0 + 98), "YOUR DAD'S NAME + -OVICH =", F_HAND(62), fill=INK, sw=0, shadow=False)
    ImageDraw.Draw(l).line([(330, Y0 + 220), (750, Y0 + 220)], fill=INK + (255,), width=10)
def c_switch(l): card2(l, "THE HEATING", "NO SWITCH", 7, BRICK, big_size=130)
def c_jan7(l): card2(l, "CHRISTMAS", "JAN 7", 10, AMBER, big_size=140)
def c_10d(l): card2(l, "THE WHOLE COUNTRY", "~10 DAYS OFF", 12, SAGE, big_size=116)
def c_28(l): card2(l, "PAID VACATION, AT LEAST", "28 DAYS", 14, SAGE, big_size=140)
def c_74(l): card2(l, "MOST PEOPLE EARN", "74,000 ₽ / MONTH", 15, big_size=96)
def c_23(l): card2(l, "YOUR PENSION", "23,000 ₽ / MONTH", 16, big_size=96)
def c_end(l):
    card(l, (110, 560, 970, 1060), seed=21); outlined(l, (540, 680), "WHICH COUNTRY", F_BIG(100), fill=CREAM); outlined(l, (540, 810), "NEXT?", F_BIG(150), fill=AMBER)
    outlined(l, (540, 960), "Tell us in the comments", F_HAND(70), fill=INK, sw=0, shadow=False)

# ---------- AGE badge: wide "AGE n", centred on the top card's top-left corner (x=210, y=330), about 300 x 124
AGES = [(10.65, 0), (40.6, 6), (64.15, 17), (80.8, 22), (96.25, 65)]
BADGE = {}
def badge_layer(n):
    if n not in BADGE:
        l = Image.new("RGBA", (340, 164), (0, 0, 0, 0)); card(l, (20, 20, 320, 144), fill=AMBER, seed=5)
        outlined(l, (112, 84), "AGE", F_BIG(58), fill=INK, sw=0, shadow=False)
        outlined(l, (238, 86), str(n), F_BIG(100), fill=CREAM, sw=7, shadow=False); BADGE[n] = l
    return BADGE[n]
def draw_age(fr, t):
    if not (AGES[0][0] <= t < LOOP_T): return
    j = max(i for i, (a, _) in enumerate(AGES) if a <= t); a, tgt = AGES[j]; prev = AGES[j - 1][1] if j else tgt
    k = t - a; n = round(prev + (tgt - prev) * ease(k / .6))
    l = badge_layer(n); s = max(.1, back(k / .35)) if k < .6 else 1
    if abs(s - 1) > .005: l = l.resize((int(l.width * s), int(l.height * s)), Image.BILINEAR)
    fr.alpha_composite(l, (int(210 - l.width / 2), int(330 - l.height / 2)))

OV = [
    ("shade1", shade, 5.7, LOOP_T, False),
    ("110", c_110, 5.8, 10.6, True), ("tz", c_tz, 15.25, 18.75, True), ("rub1", c_rub1, 24.05, 26.9, True),
    ("ivan", c_ivan, 31.4, 33.05, True), ("yours", c_yours, 33.1, 35.2, True), ("switch", c_switch, 53.5, 57.4, True),
    ("jan7", c_jan7, 76.85, 77.9, True), ("10d", c_10d, 79.65, 80.75, True), ("28", c_28, 83.95, 85.9, True),
    ("74", c_74, 94.05, 96.2, True), ("23", c_23, 100.05, 102.1, True), ("end", c_end, LOOP_T, END - .35, True),
]
PH = [(0.0, "Where will you be born today?"), (1.68, "Let's spin the wheel."), (4.56, "...Russia!"), (5.68, "Out of every 110 babies"),
 (8.0, "born in the world,"), (9.12, "one is born here."), (10.56, "And today, that one is you."), (12.85, "Your country is so big,"),
 (14.77, "it has eleven time zones."), (16.85, "When you eat breakfast in Moscow,"), (18.73, "people on the Pacific coast"),
 (20.09, "are eating dinner."), (21.17, "On your first day,"), (22.21, "the government gives your parents"), (23.73, "about 729,000 rubles."),
 (26.85, "And you get your father's name"), (28.61, "in the middle of yours."), (29.97, "Your dad is Ivan,"), (31.29, "so you're \"Ivanovich.\""),
 (33.01, "Forever."), (33.93, "What would yours be?"), (35.17, "Your first naps are outside."), (37.21, "On the balcony,"),
 (38.25, "wrapped up tight."), (39.29, "Even when it's snowing."), (40.5, "At six, you meet the dacha:"),
 (42.9, "a tiny cabin with a vegetable garden"), (45.14, "outside the city."), (46.34, "Every weekend,"), (47.18, "you're out there digging potatoes."),
 (49.06, "And your home has a strange rule:"), (51.34, "the heating isn't yours."), (53.1, "There's no switch."), (54.3, "The city turns it on"),
 (55.58, "for every building at once."), (57.34, "In October,"), (58.42, "you shiver and wait."), (60.06, "In January, it's so hot"),
 (61.98, "you open the window to the snow."), (64.06, "At 17, one national exam"), (66.46, "decides two things:"), (67.95, "whether you finish school,"),
 (69.23, "and which university takes you."), (71.39, "Your biggest night of the year"), (72.83, "isn't Christmas."), (73.87, "It's New Year's Eve."),
 (75.31, "Christmas comes later,"), (76.55, "on January 7th."), (77.87, "And the whole country"), (79.03, "takes about ten days off."),
 (80.71, "At 22, you start working."), (82.87, "You get at least 28 days"), (84.71, "of paid vacation."), (85.87, "And your job probably has"),
 (87.55, "its own official holiday."), (89.03, "Teachers' Day."), (90.07, "Miners' Day."), (91.11, "Even Programmers' Day."), (92.79, "Most people earn"),
 (93.75, "about 74,000 rubles a month."), (96.15, "You work until 65."), (98.07, "Then your pension starts:"), (99.67, "about 23,000 rubles a month."),
 (102.07, "Snow on the balcony."), (103.67, "Heat from the city."), (105.07, "Your father's name,"), (106.47, "carried for life."),
 (107.99, "That was your life in Russia."), (110.11, "Which country should we do next?"), (111.83, "Tell us in the comments.")]
CAPS = [(txt, a + .1, (PH[i + 1][0] + .05 if i + 1 < len(PH) else 113.3)) for i, (a, txt) in enumerate(PH)]
CAP_L = {}
def caption(fr, t, y0):
    for i, (txt, a, b) in enumerate(CAPS):
        if a <= t < b:
            if i not in CAP_L:
                l = Image.new("RGBA", (W, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(l); f = F_HAND(78 if len(txt) < 30 else 68)
                rtext(d, (W / 2 + 4, 136), txt, f, "mm", fill=INK + (200,), stroke_width=9, stroke_fill=INK + (200,))
                rtext(d, (W / 2, 130), txt, f, "mm", fill=CREAM + (255,), stroke_width=8, stroke_fill=INK + (255,)); CAP_L[i] = l
            fr.alpha_composite(CAP_L[i], (0, int(y0))); return

G0 = None
def globe(i):
    return Image.open(f"{WD}/globe/f{min(i, GLOBE_N - 1):04d}.jpg").convert("RGBA")
n0 = int(T0 * FPS); n1 = int((T1 or END) * FPS)
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUTF], stdin=subprocess.PIPE)
for i in range(n0, n1):
    t = i / FPS
    if t < GLOBE_END: fr = globe(i)
    elif t >= LOOP_T:   # closing: cross-fade from the last picture to the opening globe, easing back to frame 0 by the last frame
        if G0 is None: G0 = globe(0)
        u = (t - LOOP_T) / (END - 1 / FPS - LOOP_T); z = 1 + .1 * (1 - eio(u))
        g = G0.resize((W, H), Image.BILINEAR, box=(W / 2 - W / z / 2, H / 2 - H / z / 2, W / 2 + W / z / 2, H / 2 + H / z / 2))
        a = min(1, (t - LOOP_T) / .5)
        if a < 1: fr = bg_frame("36", 1, "out", (.5, .6)); fr = Image.blend(fr, g, a)
        else: fr = g
    else:
        k = max(j for j, s in enumerate(SHOTS) if s[1] <= t); n, a, mv, f = SHOTS[k]; b = SHOTS[k + 1][1]
        fr = bg_frame(n, (t - a) / (b - a), mv, f)
        if t - a < .1: fr.alpha_composite(Image.new("RGBA", (W, H), (255, 245, 220, int(70 * (1 - (t - a) / .1)))))
    low = 440
    for key, bld, a, b, pop in OV:
        if a <= t < b:
            put(fr, key, bld, t - a, b - a, pop)
            if not key.startswith("shade") and key != "end": low = max(low, L[key][1][3] if L[key][1] else 0)
    if t < LOOP_T: caption(fr, t, low - 85)   # caption right under the card: the faces start lower
    elif t < END - .35: caption(fr, t, 1100)
    draw_age(fr, t)
    ff.stdin.write(fr.convert("RGB").tobytes())
ff.stdin.close(); ff.wait(); print("done", n1 - n0)
