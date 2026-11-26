# The World You Don't Know — "If you were born in India" (Indore) (2026-11-26 format, marketing's kit look).
# Opening (globe frames from globe_space_spin.py) -> illustration backgrounds (one image 4-11 s, slow push/pan)
# with cards, checklists, stamps and the age badge layered on top -> end screen. Silent video; mix is separate.
# usage: python3 india.py <work dir> <kit dir> out.mp4 [t0 t1]   (work dir: img2x/, globe/)
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


# ₹ is missing from the kit fonts: draw it with DejaVu Sans Bold, everything else with the kit font
from PIL import ImageFont
RUPEE_F = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def rtext(d, xy, txt, font, anchor="mm", **kw):
    if "₹" not in txt: d.text(xy, txt, font=font, anchor=anchor, **kw); return
    rf = ImageFont.truetype(RUPEE_F, int(font.size * .82)); segs = [(s, font) for s in txt.split("₹")]
    parts = []
    for i, (s, f) in enumerate(segs):
        if i: parts.append(("₹", rf))
        if s: parts.append((s, f))
    widths = [d.textlength(s, font=f) for s, f in parts]; x = xy[0] - (sum(widths) / 2 if anchor[0] == "m" else 0)
    for (s, f), w in zip(parts, widths): d.text((x, xy[1]), s, font=f, anchor="l" + anchor[1], **kw); x += w
def outlined(layer, xy, text, font, fill=CREAM, stroke=INK, sw=8, anchor="mm", shadow=True):
    d = ImageDraw.Draw(layer)
    if shadow: rtext(d, (xy[0] + 6, xy[1] + 8), text, font, anchor, fill=INK + (170,), stroke_width=sw, stroke_fill=INK + (170,))
    rtext(d, xy, text, font, anchor, fill=fill + (255,), stroke_width=sw, stroke_fill=stroke + (255,))

GLOBE_END, GLOBE_N = 11.1, 333
# ---------- backgrounds: image, start, motion, focus
SHOTS = [
    ("01_city", 11.1, "in", (.5, .45)), ("02_hospital", 16.05, "in", (.5, .55)), ("03_bike", 22.5, "right", (.5, .6)), ("04_office", 29.05, "in", (.55, .55)),
    ("05_grandpa", 38.65, "out", (.4, .55)), ("06_bazaar", 43.88, "in", (.45, .5)), ("07_relatives", 53.6, "in", (.5, .5)),
    ("08_exam", 56.24, "out", (.5, .6)), ("09_bossfight", 61.82, "in", (.5, .5)), ("10_missed", 73.5, "in", (.4, .55)),
    ("11_commute", 75.82, "left", (.5, .55)), ("12_aunt", 80.54, "in", (.55, .45)), ("13_wedding", 84.82, "out", (.5, .45)),
    ("14_rent", 88.85, "in", (.5, .5)), ("15_pension", 94.33, "in", (.55, .55)), ("16_grandchild", 100.41, "out", (.45, .5)),
    ("16b_grandchild", 106.26, "in", (.45, .5)), ("END", 109.6, "out", (.45, .5)),
]
# text and signs written into the pictures, blurred (768x1376 px)
CITY_SIGNS = [(0, 1080, 200, 1376), (150, 990, 420, 1090), (380, 700, 460, 840)]   # shop signs on the shared Indore street
BLUR = {"01_city": CITY_SIGNS, "03_bike": CITY_SIGNS, "11_commute": CITY_SIGNS,
        "09_bossfight": [(585, 205, 768, 470)], "16b_grandchild": [(150, 590, 330, 640)]}
IMG = {}
def load(n):
    if n in IMG: return IMG[n]
    im = Image.open(f"{WD}/img2x/{n}.jpg").convert("RGB"); sx = im.width / 768
    for (x0, y0, x1, y1) in BLUR.get(n, []):
        box = tuple(int(v * sx) for v in (x0, y0, x1, y1)); reg = im.crop(box).filter(ImageFilter.GaussianBlur(14 * sx)); im.paste(reg, box)
    s = max(W * 1.16 / im.width, H * 1.16 / im.height); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    IMG[n] = im; return im
def bg_frame(n, u, mv, f):
    im = load("16b_grandchild" if n == "END" else n); e = eio(u)
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
def card2(l, title, big, seed, color=AMBER, y0=170, big_size=120):
    card(l, (110, y0, 970, y0 + 330), seed=seed); outlined(l, (540, y0 + 85), title, F_HAND(66), fill=INK, sw=0, shadow=False)
    outlined(l, (540, y0 + 215), big, F_BIG(big_size), fill=color)
def c_1in6(l):
    card(l, (150, 170, 930, 610), seed=11); outlined(l, (540, 250), "ONE IN EVERY", F_HAND(70), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 380), "6 BABIES", F_BIG(140), fill=AMBER); outlined(l, (540, 520), "ON EARTH IS BORN HERE", F_HAND(62), fill=INK, sw=0, shadow=False)
def c_indore(l):
    card(l, (150, 180, 930, 560), seed=13); outlined(l, (540, 270), "INDORE", F_BIG(130), fill=AMBER)
    outlined(l, (540, 400), "India's cleanest city", F_HAND(64), fill=INK, sw=0, shadow=False); outlined(l, (540, 480), "8 YEARS IN A ROW", F_BIG(64), fill=SAGE)
def c_free(l): card2(l, "HOSPITAL BILL", "FREE", 2, SAGE)
def c_free_s(l): strike(l, 360, 385, 720)
def c_2300(l): outlined(l, (540, 560), "₹2,300", F_BIG(120), fill=AMBER)
def c_pay(l):
    card(l, (110, 160, 970, 560), seed=3); outlined(l, (540, 240), "DAD'S PAY", F_HAND(66), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 360), "₹24,000 / MONTH", F_BIG(96), fill=AMBER)
def c_pay_usd(l): outlined(l, (540, 480), "≈ $270", F_HAND(70), fill=INK, sw=0, shadow=False)
NO = ["CONTRACT", "PENSION", "PAID LEAVE"]
def c_no(l):
    card(l, (170, 600, 910, 960), seed=6); d = ImageDraw.Draw(l)
    for i, r in enumerate(NO):
        y = 680 + i * 105; d.rounded_rectangle([230, y - 34, 294, y + 30], 10, outline=INK + (255,), width=6, fill=CREAM + (255,))
        d.text((330, y), r, font=F_BIG(64), fill=INK + (255,), anchor="lm")
def c_x(i):
    def b(l):
        d = ImageDraw.Draw(l); y = 680 + i * 105
        for w, c in ((18, INK), (10, BRICK)): d.line([(236, y - 28), (288, y + 24)], fill=c + (255,), width=w); d.line([(288, y - 28), (236, y + 24)], fill=c + (255,), width=w)
    return b
def c_nanny(l): card2(l, "A NANNY", "= HALF DAD'S PAY", 7, BRICK, big_size=84)
def c_grandpa(l): outlined(l, (540, 580), "GRANDPA: ₹0", F_BIG(110), fill=AMBER)
def c_8pm(l): card(l, (330, 180, 750, 360), seed=8); outlined(l, (540, 272), "8 PM", F_BIG(120), fill=AMBER)
def c_marks(l): card2(l, "BEFORE YOUR NAME...", "\"MARKS?\"", 9, AMBER, big_size=130)
def c_stream(l): card(l, (110, 160, 970, 640), seed=10); outlined(l, (540, 240), "AT 15, ONE EXAM", F_HAND(66), fill=INK, sw=0, shadow=False)
def c_opt(i, txt): return lambda l: outlined(l, (540, 345 + i * 100), txt, F_BIG(86), fill=[SAGE, AMBER, BRICK][i])
def c_funnel_a(l):
    card(l, (110, 140, 970, 700), seed=12); outlined(l, (540, 215), "THE ENGINEERING EXAM", F_HAND(60), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 320), "1,500,000", F_BIG(120), fill=CREAM); outlined(l, (540, 405), "STUDENTS", F_HAND(56), fill=INK, sw=0, shadow=False)
def c_funnel_b(l):
    outlined(l, (540, 470), "↓", F_HAND(80), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 560), "18,160 SEATS", F_BIG(104), fill=AMBER)
def c_coach(l): card2(l, "COACHING", "= 2 YEARS OF INCOME", 14, BRICK, y0=760, big_size=76)
def c_week(l): card2(l, "YOUR JOB", "6 DAYS · 50 HOURS", 15, AMBER, big_size=92)
def c_aunt(l):
    card(l, (110, 170, 970, 580), seed=16); outlined(l, (540, 250), "YOUR AUNT:", F_HAND(66), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 370), "\"EVERYONE'S MARRIED", F_BIG(70), fill=AMBER); outlined(l, (540, 470), "EXCEPT YOU.\"", F_BIG(70), fill=AMBER)
def c_wedding(l): card2(l, "A \"SMALL\" WEDDING", "= 1–2 YEARS OF INCOME", 17, AMBER, big_size=78)
def c_home(l): card2(l, "A HOME OF YOUR OWN", "= 14 YEARS OF INCOME", 18, BRICK, big_size=82)
def c_pension(l):
    card(l, (110, 160, 970, 600), seed=19); outlined(l, (540, 240), "STATE PENSION", F_HAND(66), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 360), "₹600 / MONTH", F_BIG(110), fill=AMBER)
def c_pension_usd(l): outlined(l, (540, 500), "≈ $7", F_HAND(80), fill=INK, sw=0, shadow=False)
def c_family(l):
    card(l, (140, 560, 940, 960), seed=20); outlined(l, (540, 680), "NO SAFETY NET.", F_BIG(96), fill=CREAM); outlined(l, (540, 830), "JUST FAMILY.", F_BIG(120), fill=AMBER)
def c_end(l):
    card(l, (110, 560, 970, 1060), seed=21); outlined(l, (540, 680), "WHICH COUNTRY", F_BIG(100), fill=CREAM); outlined(l, (540, 810), "NEXT?", F_BIG(150), fill=AMBER)
    outlined(l, (540, 960), "Tell us in the comments", F_HAND(70), fill=INK, sw=0, shadow=False)
def shade(l): top_shade(l)
def stamp(text, cx, cy, ang, size=120):
    def b(l):
        t = Image.new("RGBA", (1000, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
        d.rounded_rectangle([30, 50, 970, 250], 26, outline=BRICK + (255,), width=16)
        d.text((500, 150), text, font=F_BIG(size), fill=BRICK + (255,), anchor="mm")
        t = t.rotate(ang, resample=Image.BICUBIC, expand=True); l.alpha_composite(t, (int(cx - t.width / 2), int(cy - t.height / 2)))
    return b
AGES = [(16.05, 0), (38.65, 1), (43.88, 2), (53.6, 10), (56.24, 15), (61.82, 17), (75.82, 23), (80.54, 28), (84.82, 29),
        (88.85, 45), (94.33, 60)]
NEW_LIFE = (102.3, 109.6)   # the grandchild: a new badge at 0 (scene cut, never counted back)
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

OV = [
    ("shade_g", shade, 5.3, 11.1, False), ("1in6", c_1in6, 5.42, 10.95, True), ("indore", c_indore, 11.1, 16.05, True),
    ("shade1", shade, 11.1, 109.6, False),
    ("free", c_free, 18.34, 22.5, True), ("free_s", c_free_s, 20.6, 22.5, False), ("r2300", c_2300, 20.94, 22.5, True),
    ("pay", c_pay, 29.89, 38.65, True), ("payusd", c_pay_usd, 31.85, 38.65, True), ("no", c_no, 33.69, 38.65, True),
    ("x0", c_x(0), 36.01, 38.65, True), ("x1", c_x(1), 36.89, 38.65, True), ("x2", c_x(2), 37.77, 38.65, True),
    ("nanny", c_nanny, 38.85, 43.88, True), ("gp", c_grandpa, 42.8, 43.88, True),
    ("8pm", c_8pm, 44.68, 50.8, True),
    ("marks", c_marks, 54.92, 56.24, True),
    ("stream", c_stream, 56.24, 61.82, True), ("o0", c_opt(0, "SCIENCE"), 59.38, 61.82, True), ("o1", c_opt(1, "COMMERCE"), 60.14, 61.82, True), ("o2", c_opt(2, "ARTS"), 61.1, 61.82, True),
    ("fun_a", c_funnel_a, 64.02, 73.5, True), ("fun_b", c_funnel_b, 66.5, 73.5, True), ("coach", c_coach, 70.34, 73.5, True),
    ("missed", stamp("MISSED BY A FEW MARKS", 540, 360, 8, 90), 74.86, 75.82, True),
    ("week", c_week, 77.26, 80.54, True),
    ("aunt", c_aunt, 82.62, 84.82, True),
    ("wedding", c_wedding, 86.82, 88.85, True),
    ("home", c_home, 89.97, 94.33, True), ("rent", stamp("RENT", 540, 700, -10, 140), 92.53, 94.33, True),
    ("pension", c_pension, 97.49, 100.41, True), ("pusd", c_pension_usd, 99.01, 100.41, True),
    ("family", c_family, 109.74, 112.18, True), ("end", c_end, 112.18, END, True),
]
CAPS = [("Where will you be born today?", 0.0, 1.5), ("Let's spin the wheel.", 1.56, 3.2), ("...India!", 4.46, 5.35),
 ("One in every six babies", 5.42, 7.25), ("on Earth is born here.", 7.3, 8.65), ("And today, one of them is you.", 8.7, 11.0),
 ("Welcome to Indore —", 11.1, 12.6), ("once crowned India's cleanest city,", 12.66, 14.75), ("eight years in a row.", 14.78, 16.05),
 ("You're born in a government hospital.", 16.1, 18.3), ("Free, on paper.", 18.34, 19.6), ("Your family still pays ₹2,300.", 19.66, 22.45),
 ("Your first ride home? Dad's motorbike.", 22.5, 25.25), ("Dad, Mom, Grandma and you —", 25.3, 27.6), ("all on one seat.", 27.66, 29.0),
 ("Dad earns ₹24,000 a month —", 29.05, 31.8), ("about $270.", 31.85, 33.6), ("Like nine in ten workers here,", 33.69, 35.35),
 ("he has no contract, no pension,", 35.37, 37.5), ("no paid leave.", 37.53, 38.6), ("A nanny would cost about half his pay.", 38.65, 41.0),
 ("So Grandpa takes the job.", 41.05, 42.75), ("For free.", 42.8, 43.85), ("Every night at eight,", 43.88, 44.95),
 ("he carries you to Sarafa Bazaar,", 45.0, 46.85), ("where the jewelry shops close", 46.88, 48.4), ("and the street turns into a food market.", 48.44, 50.8),
 ("Hot jalebi.", 50.84, 51.9), ("Your first sugar rush.", 51.92, 53.55), ("Your relatives ask your marks", 53.6, 55.3), ("before your name.", 55.36, 56.2),
 ("Because at 15, one exam decides your life:", 56.24, 59.3), ("science, commerce, or arts.", 59.38, 61.8), ("Then comes the real boss fight.", 61.82, 63.95),
 ("1.5 million students.", 64.02, 66.45), ("18,160 seats at the top institutes.", 66.5, 70.3), ("Your parents spend two years of income", 70.34, 72.6),
 ("on coaching...", 72.62, 73.45), ("and you miss by a few marks.", 73.5, 75.8), ("So you get a job.", 75.82, 77.2), ("Six days a week. Fifty hours.", 77.26, 79.4),
 ("One motorbike.", 79.42, 80.5), ("At 28, your aunt says it:", 80.54, 82.6), ('"Everyone\'s married except you."', 82.62, 84.8),
 ('Your "small" wedding costs', 84.82, 86.8), ("one to two years of income.", 86.82, 88.8), ("A home of your own?", 88.85, 89.95),
 ("Fourteen years of income.", 89.97, 91.85), ("So you rent. For decades.", 91.89, 94.3), ("At 60, there's no company pension.", 94.33, 96.6),
 ("The state pays ₹600 a month —", 96.61, 98.95), ("about $7.", 99.01, 100.35), ("So you move in with your son.", 100.41, 102.25),
 ("And one night at eight,", 102.3, 103.45), ("you carry your grandchild to Sarafa Bazaar.", 103.5, 106.2), ("Hot jalebi.", 106.26, 107.3),
 ("Their first sugar rush.", 107.34, 109.6), ("No safety net.", 109.74, 111.0), ("Just family.", 111.06, 112.1),
 ("Which country should we do next?", 112.18, 113.8), ("Tell us in the comments.", 113.86, END)]
CAP_L = {}
def caption(fr, t, y0=600):
    for i, (txt, a, b) in enumerate(CAPS):
        if a <= t < b:
            if i not in CAP_L:
                l = Image.new("RGBA", (W, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(l); f = F_HAND(78 if len(txt) < 30 else 68)
                rtext(d, (W / 2 + 4, 136), txt, f, "mm", fill=INK + (200,), stroke_width=9, stroke_fill=INK + (200,))
                rtext(d, (W / 2, 130), txt, f, "mm", fill=CREAM + (255,), stroke_width=8, stroke_fill=INK + (255,)); CAP_L[i] = l
            fr.alpha_composite(CAP_L[i], (0, int(y0))); return

N = int(END * FPS); n0 = int(T0 * FPS); n1 = int((T1 or END) * FPS)
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUTF], stdin=subprocess.PIPE)
for i in range(n0, n1):
    t = i / FPS
    if t < GLOBE_END:
        fr = Image.open(f"{WD}/globe/f{min(i, GLOBE_N - 1):04d}.jpg").convert("RGBA")
    else:
        k = max(j for j, s in enumerate(SHOTS) if s[1] <= t); n, a, mv, f = SHOTS[k]; b = SHOTS[k + 1][1] if k + 1 < len(SHOTS) else END
        fr = bg_frame(n, (t - a) / (b - a), mv, f)
        if t - a < .1: fr.alpha_composite(Image.new("RGBA", (W, H), (255, 245, 220, int(70 * (1 - (t - a) / .1)))))   # soft cut flash
    low = 440   # captions sit just under the lowest card on screen (faces are in the lower half of the pictures)
    for key, bld, a, b, pop in OV:
        if a <= t < b:
            put(fr, key, bld, t - a, b - a, pop)
            if not key.startswith(('shade', 'x', 'free_s', 'rent')): low = max(low, L[key][1][3] if L[key][1] else 0)
    caption(fr, t, low - 70)
    draw_age(fr, t)
    ff.stdin.write(fr.convert("RGB").tobytes())
ff.stdin.close(); ff.wait(); print("done", n1 - n0)
