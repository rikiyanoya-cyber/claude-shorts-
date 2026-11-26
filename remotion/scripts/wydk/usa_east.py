# The World You Don't Know — "If you were born in the US East" (2026-11-26 format, marketing's kit look).
# Opening (globe frames from globe_space_spin.py) -> illustration backgrounds (one image 4-11 s, slow push/pan)
# with cards, checklists, stamps and the age badge layered on top -> end screen. Silent video; mix is separate.
# usage: python3 usa_east.py <work dir> <kit dir> out.mp4 [t0 t1]   (work dir: img2x/, globe/)
import sys, os, math, subprocess, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
WD, KIT, OUTF = sys.argv[1:4]
T0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
T1 = float(sys.argv[5]) if len(sys.argv) > 5 else None
sys.path.insert(0, KIT)
from tiw_style import *   # W, H, colors, F_BIG, F_HAND, card, outlined, strike, check, top_shade, age_badge, grain
FPS = 30; END = 109.0
ease = lambda s: 1 - (1 - min(1, max(0, s))) ** 3
eio = lambda s: (lambda x: 3 * x * x - 2 * x * x * x)(min(1, max(0, s)))
def back(s):
    s = min(1, max(0, s)); k = 1.7; return 1 + (k + 1) * (s - 1) ** 3 + k * (s - 1) ** 2

# ---------- backgrounds: image, start, motion (in / out / left / right / up / down), focus (fx, fy)
SHOTS = [
    ("01_family", 22.2, "in", (.5, .45)), ("02_pricetag", 33.19, "out", (.4, .6)), ("10a_mom_nightshift", 36.43, "in", (.45, .45)),
    ("10b_dad_dawn", 41.55, "right", (.5, .5)), ("10a_mom_nightshift", 42.75, "out", (.5, .4)), ("03_baton", 43.79, "in", (.55, .45)),
    ("11_free_lunch", 45.95, "left", (.5, .5)), ("04_bodega", 51.47, "in", (.5, .55)), ("12_walk_faster", 60.65, "left", (.6, .5)),
    ("05_long_distance", 62.41, "up", (.5, .5)), ("13_landlord", 67.45, "in", (.5, .5)), ("06_back_home", 76.9, "out", (.5, .5)),
    ("07_washer_crown", 79.75, "in", (.45, .55)), ("14_gw_bridge", 83.07, "right", (.4, .5)), ("08_nj_gas", 87.15, "in", (.55, .6)),
    ("09_grandchild_baton", 93.3, "out", (.5, .5)), ("15_rooftop", 99.6, "in", (.5, .45)), ("END", 105.46, "out", (.5, .45)),
]
BLUR = {"04_bodega": [(10, 920, 165, 1095)], "08_nj_gas": [(25, 1050, 200, 1170)], "12_walk_faster": [(625, 945, 768, 1025)]}   # logos/words, in 768x1376 px
IMG = {}
def load(n):
    if n in IMG: return IMG[n]
    im = Image.open(f"{WD}/img2x/{n}.jpg").convert("RGB")
    sx = im.width / (1152 if n == "01_family" else 768)
    for (x0, y0, x1, y1) in BLUR.get(n, []):
        box = tuple(int(v * sx) for v in (x0, y0, x1, y1)); reg = im.crop(box).filter(ImageFilter.GaussianBlur(14 * sx)); im.paste(reg, box)
    if n == "02_pricetag":   # "$$$" written on the blank price tag (2x coords)
        lay = Image.new("RGBA", (420, 220), (0, 0, 0, 0)); ImageDraw.Draw(lay).text((210, 110), "$$$", font=F_BIG(int(120 * sx / 2)), fill=INK + (235,), anchor="mm")
        lay = lay.rotate(18, resample=Image.BICUBIC, expand=True); im.paste(lay, (int(235 * sx) - lay.width // 2, int(1205 * sx) - lay.height // 2), lay)
    s = max(W * 1.16 / im.width, H * 1.16 / im.height); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    IMG[n] = im; return im
def bg_frame(n, u, mv, f):
    im = load("15_rooftop" if n == "END" else n); e = eio(u)
    z = {"in": 1.0 + .12 * e, "out": 1.12 - .12 * e}.get(mv, 1.08)
    cw, ch = min(W / z, im.width), min(H / z, im.height)   # the image is >= 1.16x the frame, so this never runs out
    fx, fy = f; dx = {"left": .5 - e, "right": e - .5}.get(mv, 0) * (im.width - cw) * .8; dy = {"up": .5 - e, "down": e - .5}.get(mv, 0) * (im.height - ch) * .8
    cx = min(max(cw / 2, fx * im.width + dx), im.width - cw / 2); cy = min(max(ch / 2, fy * im.height + dy), im.height - ch / 2)
    fr = im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).convert("RGBA")
    if n == "END":
        sh = Image.new("RGBA", (W, H), TEAL_D + (int(150 * min(1, u * 4)),)); fr.alpha_composite(sh)
    return fr

# ---------- overlay layers (built once, animated by alpha + a small pop)
L = {}
def layer(key, build):
    if key not in L:
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); build(lay); L[key] = (lay, lay.getbbox())
    return L[key]
def put(fr, key, build, k, dur=None, pop=True):
    """k = seconds since it appeared (<0: not yet); dur: seconds until it leaves"""
    if k < 0 or (dur is not None and k > dur): return
    lay, bb = layer(key, build)
    if bb is None: return
    a = min(1, k / .12) * (min(1, (dur - k) / .15) if dur is not None else 1)
    s = back(k / .3) if pop else 1
    crop = lay.crop(bb)
    if abs(s - 1) > .005:
        crop = crop.resize((max(1, int(crop.width * s)), max(1, int(crop.height * s))), Image.BILINEAR)
    if a < 1:
        al = crop.getchannel("A").point(lambda v: int(v * a)); crop.putalpha(al)
    cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    fr.alpha_composite(crop, (int(cx - crop.width / 2), int(cy - crop.height / 2)))
def shade(l): top_shade(l)
def stamp(text, cx, cy, ang, size=130):
    def b(l):
        t = Image.new("RGBA", (900, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
        d.rounded_rectangle([40, 50, 860, 250], 26, outline=BRICK + (255,), width=16)
        d.text((450, 150), text, font=F_BIG(size), fill=BRICK + (255,), anchor="mm")
        t = t.rotate(ang, resample=Image.BICUBIC, expand=True); l.alpha_composite(t, (int(cx - t.width / 2), int(cy - t.height / 2)))
    return b
def c_1in37(l):
    card(l, (150, 170, 930, 610), seed=11); outlined(l, (540, 250), "OUT OF EVERY", F_HAND(70), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 380), "37 BABIES", F_BIG(130), fill=AMBER); outlined(l, (540, 520), "ONE IS BORN HERE", F_HAND(66), fill=INK, sw=0, shadow=False)
def c_four(l):
    card(l, (160, 190, 920, 420), seed=12); outlined(l, (540, 305), "4 COUNTRIES, 1 FLAG", F_BIG(70), fill=AMBER)
def c_queens(l):
    card(l, (190, 200, 890, 420), seed=13); outlined(l, (540, 280), "THE EAST", F_HAND(70), fill=INK, sw=0, shadow=False); outlined(l, (540, 365), "QUEENS, NYC", F_BIG(96), fill=AMBER)
def c_income_a(l):
    card(l, (110, 150, 970, 580), seed=2); outlined(l, (540, 230), "ON PAPER", F_HAND(64), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 345), "$97,000", F_BIG(130), fill=SAGE)
def c_strike(l): strike(l, 250, 350, 830)
def c_income_b(l): outlined(l, (540, 485), "$80,000", F_BIG(130), fill=AMBER)
def c_daycare_a(l):
    card(l, (80, 150, 1000, 610), seed=7); outlined(l, (540, 230), "DAYCARE", F_HAND(70), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 330), "$26,000 / YEAR", F_BIG(100), fill=AMBER)
def c_daycare_b(l):
    outlined(l, (540, 430), ">", F_BIG(90), fill=BRICK); outlined(l, (540, 525), "MOM'S TAKE-HOME", F_BIG(76), fill=SAGE)
def c_free_a(l): card(l, (190, 170, 890, 560), seed=9); outlined(l, (540, 280), "3-K: $0", F_BIG(120), fill=AMBER)
def c_free_b(l): outlined(l, (540, 450), "LUNCH: $0", F_BIG(120), fill=AMBER)
RULES = ['Manhattan = "the city"', "Bodega cat (illegal)", "Never read the menu", "Walk faster"]
def c_rules(l):
    card(l, (90, 120, 990, 820), seed=4); outlined(l, (540, 210), "NYC RULES", F_BIG(96), fill=AMBER); d = ImageDraw.Draw(l)
    for i, r in enumerate(RULES):
        y = 340 + i * 118; d.rounded_rectangle([150, y - 34, 214, y + 30], 10, outline=INK + (255,), width=6, fill=CREAM + (255,))
        d.text((250, y), r, font=F_HAND(66), fill=INK + (255,), anchor="lm")
def c_check(i): return lambda l: check(l, 160, 340 + i * 118 - 4, 52)
def c_long(l): card(l, (170, 190, 910, 420), seed=14); outlined(l, (540, 260), "QUEENS TO THE BRONX", F_HAND(62), fill=INK, sw=0, shadow=False); outlined(l, (540, 355), "LONG DISTANCE", F_BIG(92), fill=AMBER)
def c_rent_a(l): card(l, (110, 150, 970, 640), seed=15); outlined(l, (540, 225), "NEW RENT IN QUEENS", F_HAND(62), fill=INK, sw=0, shadow=False); outlined(l, (540, 340), "$3,150 x 40", F_BIG(100), fill=CREAM)
def c_rent_b(l): outlined(l, (540, 500), "= $126,000", F_BIG(120), fill=AMBER)
def c_tax(l): card(l, (130, 160, 950, 520), seed=16); outlined(l, (540, 245), "NJ PROPERTY TAX", F_HAND(64), fill=INK, sw=0, shadow=False); outlined(l, (540, 380), "$9,358 / YEAR", F_BIG(110), fill=AMBER)
def c_end(l):
    card(l, (110, 560, 970, 1060), seed=21); outlined(l, (540, 680), "WHICH COUNTRY", F_BIG(100), fill=CREAM); outlined(l, (540, 810), "NEXT?", F_BIG(150), fill=AMBER)
    outlined(l, (540, 960), "Tell us in the comments", F_HAND(70), fill=INK, sw=0, shadow=False)
# AGE badge (2026-11-26 owner: the age should keep moving; label and number must not overlap):
# a wide amber card, "AGE" in the hand font on the left, the number on the right; it counts up at each step
AGES = [(22.23, 0), (36.43, 1), (43.79, 2), (45.95, 3), (51.47, 8), (60.65, 12), (62.41, 22), (67.45, 24), (76.9, 25),
        (79.75, 28), (83.07, 31), (87.15, 33)]
NEW_LIFE = (93.3, 99.6)   # the grandchild: a new badge at 0 (scene cut, never counted back)
BADGE = {}
def badge_layer(n):
    if n not in BADGE:
        l = Image.new("RGBA", (380, 190), (0, 0, 0, 0)); card(l, (14, 14, 350, 160), fill=AMBER, seed=5)
        outlined(l, (100, 90), "AGE", F_HAND(62), fill=INK, sw=0, shadow=False)
        outlined(l, (250, 92), str(n), F_BIG(84), fill=CREAM, sw=7, shadow=False); BADGE[n] = l
    return BADGE[n]
def draw_age(fr, t):
    if NEW_LIFE[0] <= t < NEW_LIFE[1]: n, k = 0, t - NEW_LIFE[0]
    elif AGES[0][0] <= t < NEW_LIFE[0]:
        j = max(i for i, (a, _) in enumerate(AGES) if a <= t); a, tgt = AGES[j]; prev = AGES[j - 1][1] if j else tgt
        k = t - a; n = round(prev + (tgt - prev) * ease(k / .6))
    else: return
    l = badge_layer(n); s = max(.1, back(k / .35)) if k < .6 else 1
    if abs(s - 1) > .005: l = l.resize((int(l.width * s), int(l.height * s)), Image.BILINEAR)
    fr.alpha_composite(l, (int(30 + 190 - l.width / 2), int(10 + 95 - l.height / 2)))

OV = [  # (key, builder, start, end, pop)
    ("shade_g", shade, 6.0, 22.2, False), ("1in37", c_1in37, 6.16, 12.8, True), ("four", c_four, 13.84, 17.4, True), ("queens", c_queens, 20.15, 22.2, True),
    ("shade1", shade, 22.2, 105.46, False),
    ("inc_a", c_income_a, 25.99, 33.19, True), ("inc_s", c_strike, 29.5, 33.19, False), ("inc_b", c_income_b, 29.83, 33.19, True),
    ("day_a", c_daycare_a, 36.43, 41.55, True), ("day_b", c_daycare_b, 39.47, 41.55, True),
    ("free_a", c_free_a, 48.91, 51.47, True), ("free_b", c_free_b, 49.87, 51.47, True),
    ("rules", c_rules, 51.6, 62.41, True), ("ck0", c_check(0), 54.5, 62.41, True), ("ck1", c_check(1), 56.9, 62.41, True), ("ck2", c_check(2), 60.4, 62.41, True), ("ck3", c_check(3), 61.6, 62.41, True),
    ("long", c_long, 66.09, 67.45, True),
    ("rent_a", c_rent_a, 69.01, 76.9, True), ("rent_b", c_rent_b, 74.09, 76.9, True), ("denied", stamp("DENIED", 540, 420, 12), 75.6, 76.9, True),
    ("illegal", stamp("ILLEGAL", 560, 760, -10), 88.59, 89.35, True), ("tax", c_tax, 89.39, 93.3, True),
    ("end", c_end, 105.6, END, True),
]
# ---------- captions (follow the audio)
CAPS = [("Where will you be born today?", 0.0, 1.5), ("Let's spin the wheel.", 1.6, 3.3), ("...The United States!", 4.0, 5.9),
 ("Out of every 37 babies", 6.16, 8.0), ("born in the world,", 8.04, 9.1), ("one is born here.", 9.16, 10.5), ("And today, that one is you.", 10.56, 12.8),
 ("But America is four countries", 12.84, 14.85), ("wearing one flag.", 14.88, 16.1), ("So let's spin again.", 16.12, 17.4), ("...The East.", 18.79, 20.1),
 ("Queens, New York City.", 20.15, 22.2), ("Your dad drives a delivery truck.", 22.23, 24.08), ("Your mom is a nursing assistant.", 24.11, 25.95),
 ("On paper, they should make", 25.99, 27.6), ("about $97,000.", 27.62, 29.55), ("They make $80,000 —", 29.59, 31.1), ("because Mom cut her shifts for you.", 31.15, 33.15),
 ("You're one day old,", 33.19, 34.4), ("and you're already expensive.", 34.43, 36.4), ("Daycare costs $26,000 a year —", 36.43, 39.42), ("more than Mom takes home.", 39.47, 41.05),
 ("So Dad works mornings,", 41.11, 42.7), ("Mom works nights,", 42.75, 43.75), ("and you get passed between them", 43.79, 45.2), ("like a baton.", 45.23, 45.9),
 ("At three, the city finally helps.", 45.95, 48.85), ("Free preschool.", 48.91, 49.83), ("Free lunch for every kid.", 49.87, 51.4), ("You learn the rules fast.", 51.47, 53.1),
 ('Manhattan is "the city."', 53.19, 54.9), ("The bodega cat is technically illegal.", 54.95, 57.6), ("Never read the deli menu —", 57.67, 59.1),
 ("that's how they know", 59.15, 59.8), ("you're not from here.", 59.83, 60.6), ("And walk faster.", 60.65, 62.35), ("At 22, you date", 62.41, 63.9),
 ("someone from the Bronx.", 63.93, 65.1), ("Different borough.", 65.13, 66.05), ("That's long distance.", 66.09, 67.4), ("You want your own place.", 67.45, 68.95),
 ("New rent in Queens: $3,150.", 69.01, 71.55), ("Landlords want you", 71.61, 72.55), ("to earn 40 times that —", 72.57, 74.05), ("$126,000.", 74.09, 76.3),
 ("So you stay with your parents.", 76.35, 78.6), ("Very New York.", 78.63, 79.7), ("A washer inside your apartment?", 79.75, 81.65), ("That's for rich people.", 81.71, 83.0),
 ("So you do the most", 83.07, 84.2), ("New York thing of all.", 84.27, 85.45), ("You move to New Jersey —", 85.51, 87.1), ("where pumping your own gas is illegal,", 87.15, 89.1),
 ("and property tax is $9,358 a year.", 89.15, 93.25), ("Then one morning,", 93.3, 94.9), ("your grandchild is born. In Queens.", 94.94, 97.7),
 ("Passed around like a baton.", 97.78, 99.6), ("Too rich to get help.", 99.78, 101.35), ("Too broke to slow down.", 101.38, 102.98),
 ("And you'd never live anywhere else.", 103.02, 105.4), ("Which country should we do next?", 105.46, 107.1), ("Tell us in the comments.", 107.14, 108.9)]
CAP_L = {}
def caption(fr, t, y0=600):
    for i, (txt, a, b) in enumerate(CAPS):
        if a <= t < b:
            if i not in CAP_L:
                l = Image.new("RGBA", (W, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(l); f = F_HAND(78 if len(txt) < 30 else 68)
                d.text((W / 2 + 4, 136), txt, font=f, fill=INK + (200,), anchor="mm", stroke_width=9, stroke_fill=INK + (200,))
                d.text((W / 2, 130), txt, font=f, fill=CREAM + (255,), anchor="mm", stroke_width=8, stroke_fill=INK + (255,)); CAP_L[i] = l
            fr.alpha_composite(CAP_L[i], (0, int(y0))); return

N = int(END * FPS); n0 = int(T0 * FPS); n1 = int((T1 or END) * FPS)
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUTF], stdin=subprocess.PIPE)
for i in range(n0, n1):
    t = i / FPS
    if t < 22.2:
        fr = Image.open(f"{WD}/globe/f{min(i, 665):04d}.jpg").convert("RGBA")
    else:
        k = max(j for j, s in enumerate(SHOTS) if s[1] <= t); n, a, mv, f = SHOTS[k]; b = SHOTS[k + 1][1] if k + 1 < len(SHOTS) else END
        fr = bg_frame(n, (t - a) / (b - a), mv, f)
        if t - a < .1: fr.alpha_composite(Image.new("RGBA", (W, H), (255, 245, 220, int(70 * (1 - (t - a) / .1)))))   # soft cut flash
    low = 440   # captions sit just under the lowest card on screen (faces are in the lower half of the pictures)
    for key, bld, a, b, pop in OV:
        if a <= t < b:
            put(fr, key, bld, t - a, b - a, pop)
            if not key.startswith(('shade', 'age', 'ck', 'inc_s')): low = max(low, L[key][1][3] if L[key][1] else 0)
    caption(fr, t, low - 70)
    draw_age(fr, t)
    ff.stdin.write(fr.convert("RGB").tobytes())
ff.stdin.close(); ff.wait(); print("done", n1 - n0)
