# The World You Don't Know — "If you were born in Hungary" (Debrecen) (2026-11-27, same format as India).
# Opening (globe frames from globe_space_spin.py) -> illustration backgrounds with cards, stamps and the age badge -> end screen.
# usage: python3 hungary.py <work dir> <kit dir> out.mp4 [t0 t1]   (work dir: img2x/, globe/)
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


FPS = 30; END = 140.0
GLOBE_END, GLOBE_N = 12.45, 373
SHOTS = [   # v2 (2026-11-27): about one picture every 4 s
    ("01_city", 12.45, "in", (.5, .45)), ("02_thin_walls", 16.4, "in", (.5, .55)), ("03_name_book", 19.58, "in", (.5, .55)),
    ("G_scroll", 22.58, "out", (.5, .55)), ("A_king", 26.3, "in", (.5, .4)), ("H_attilas", 29.17, "in", (.5, .62)),
    ("I_stork", 32.53, "in", (.5, .35)), ("B_loan_birds", 34.81, "in", (.5, .55)), ("C_four_kids", 38.33, "out", (.6, .45)),
    ("04_playground", 41.77, "in", (.45, .62)), ("J_jobs", 47.71, "out", (.5, .45)), ("05_complain", 50.55, "in", (.5, .5)),
    ("06_high_chair", 55.59, "in", (.5, .55)), ("07_two_cakes", 60.98, "out", (.5, .5)), ("K_aunts", 64.7, "in", (.5, .45)),
    ("08_bath_grandpa", 67.26, "in", (.5, .55)), ("D_grumpy", 72.95, "in", (.4, .5)), ("09_bejgli", 75.43, "in", (.45, .5)),
    ("L_sister", 79.59, "in", (.5, .5)), ("10_bus", 83.11, "out", (.45, .55)), ("M_bus_away", 86.31, "in", (.45, .6)),
    ("11_late_train", 90.63, "in", (.5, .5)), ("E_conductor", 94.19, "in", (.55, .5)), ("12_moving_out", 96.99, "in", (.5, .55)),
    ("13_poster", 101.87, "in", (.55, .45)), ("F_party", 106.76, "in", (.5, .55)), ("14_palinka", 109.32, "in", (.5, .45)),
    ("15_bench", 115.96, "out", (.5, .6)), ("N_pastry", 120.25, "in", (.5, .45)), ("16_grandchild_book", 122.89, "in", (.45, .5)),
    ("17_bath_grandchild", 127.13, "in", (.5, .55)), ("END", 131.93, "out", (.5, .55)),
]
BLUR = {}   # owner: no blurring
IMG = {}
def load(n):
    if n in IMG: return IMG[n]
    im = Image.open(f"{WD}/img2x/{n}.jpg").convert("RGB"); sx = im.width / 768
    for (x0, y0, x1, y1) in BLUR.get(n, []):
        box = tuple(int(v * sx) for v in (x0, y0, x1, y1)); reg = im.crop(box).filter(ImageFilter.GaussianBlur(14 * sx)); im.paste(reg, box)
    s = max(W * 1.16 / im.width, H * 1.16 / im.height); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    IMG[n] = im; return im
def bg_frame(n, u, mv, f):
    im = load("17_bath_grandchild" if n == "END" else n); e = eio(u)
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
def c_1in1900(l):
    card(l, (150, 170, 930, 610), seed=11); outlined(l, (540, 250), "ONLY ABOUT", F_HAND(70), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 380), "1 IN 1,900", F_BIG(130), fill=AMBER); outlined(l, (540, 520), "BABIES ON EARTH", F_HAND(62), fill=INK, sw=0, shadow=False)
def c_debrecen(l):
    card(l, (150, 180, 930, 500), seed=13); outlined(l, (540, 280), "DEBRECEN", F_BIG(120), fill=AMBER)
    outlined(l, (540, 410), "Hungary's second-largest city", F_HAND(58), fill=INK, sw=0, shadow=False)
def c_burp(l):
    t = Image.new("RGBA", (700, 300), (0, 0, 0, 0)); outlined(t, (350, 150), "BURP!", F_BIG(150), fill=AMBER, sw=10)
    t = t.rotate(10, resample=Image.BICUBIC, expand=True); l.alpha_composite(t, (int(700 - t.width / 2), int(330 - t.height / 2)))
def c_list(l): card2(l, "OFFICIAL NAME LIST", "4,703 NAMES", 2, AMBER)
def c_attila(l): card2(l, "YOUR NAME", "ATTILA", 3, AMBER, y0=1380, big_size=140)   # low: the crowned baby is up top
def c_others(l): card2(l, "ALSO NAMED ATTILA", "140,000", 22, AMBER, big_size=140)
def c_loan(l): card2(l, "HAVE 3 KIDS:", "11M FT LOAN", 4, AMBER)
def c_loan_s(l): strike(l, 250, 385, 830)
def c_tax(l): card2(l, "HAVE 4 KIDS:", "MOM'S TAX = 0", 5, SAGE, big_size=104)
def c_births(l): card2(l, "BABIES BORN LAST YEAR", "72,000", 6, AMBER, big_size=140)
def c_pay(l):
    card(l, (110, 160, 970, 560), seed=7); outlined(l, (540, 240), "TAKE-HOME, TOGETHER", F_HAND(66), fill=INK, sw=0, shadow=False)
    outlined(l, (540, 370), "800,000 FT", F_BIG(110), fill=AMBER); outlined(l, (540, 480), "A MONTH", F_HAND(62), fill=INK, sw=0, shadow=False)
def c_word(l): card2(l, "YOUR FIRST WORD:", "A COMPLAINT", 8, BRICK, big_size=110)
def c_hello(l): card(l, (170, 560, 910, 720), seed=9); outlined(l, (540, 642), "COMPLAINING = HELLO", F_BIG(68), fill=INK, sw=0, shadow=False)
def c_bday(l):
    card(l, (110, 160, 970, 560), seed=10); outlined(l, (540, 250), "2 BIRTHDAYS", F_BIG(120), fill=AMBER)
    outlined(l, (540, 380), "your birthday", F_HAND(62), fill=INK, sw=0, shadow=False); outlined(l, (540, 460), "+ your name day", F_HAND(62), fill=INK, sw=0, shadow=False)
def c_38(l): card(l, (330, 180, 750, 360), seed=12); outlined(l, (540, 272), "38\u00b0C", F_BIG(120), fill=AMBER)
def c_left(l): card2(l, "ALREADY LEFT HUNGARY", "500,000+", 14, AMBER, big_size=140)
def c_home(l): card2(l, "GUYS YOUR AGE AT HOME", "NEARLY HALF", 15, AMBER, big_size=110)
def c_party(l): card2(l, "THE JOKE PARTY:", "2 SUNSETS + FREE BEER", 16, AMBER, y0=1160, big_size=72)
def c_palinka(l): card2(l, "HOMEMADE P\u00c1LINKA, TAX-FREE", "UP TO 86 L / YEAR", 17, AMBER, big_size=96)
def c_pension(l): card2(l, "EVERY FEBRUARY", "+1 PENSION MONTH", 18, SAGE, big_size=92)
def c_list2(l): card2(l, "THE NAME?", "FROM THE LIST", 19, AMBER, big_size=110)
def c_happy(l):
    card(l, (110, 170, 970, 570), seed=20); outlined(l, (540, 290), "THE GREATEST", F_BIG(100), fill=CREAM); outlined(l, (540, 440), "HAPPINESS", F_BIG(130), fill=AMBER)
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
AGES = [(16.4, 0), (55.59, 1), (60.98, 6), (67.26, 8), (75.43, 12), (83.11, 18), (90.63, 21), (96.99, 28), (101.87, 30),
        (109.32, 45), (115.96, 65)]
NEW_LIFE = (122.89, 131.93)   # the grandchild: a new badge at 0 (scene cut, never counted back)
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
    ("shade_g", shade, 5.7, 12.45, False), ("1in1900", c_1in1900, 5.76, 11.25, True), ("rare", stamp("RARE", 540, 420, -8, 170), 11.32, 12.45, True),
    ("shade1", shade, 12.45, 131.93, False),
    ("debrecen", c_debrecen, 12.48, 16.4, True), ("burp", c_burp, 18.82, 19.58, True),
    ("list", c_list, 22.58, 26.3, True), ("attila", c_attila, 27.42, 29.17, True), ("others", c_others, 29.41, 32.53, True),
    ("loan", c_loan, 34.81, 38.33, True), ("loan_s", c_loan_s, 37.49, 38.33, False), ("tax", c_tax, 38.33, 41.77, True),
    ("births", c_births, 43.39, 47.71, True), ("fewest", stamp("FEWEST EVER", 540, 660, -8, 120), 46.07, 47.71, True),
    ("pay", c_pay, 51.75, 55.59, True),
    ("word", c_word, 56.75, 60.98, True), ("hello", c_hello, 58.42, 60.98, True),
    ("bday", c_bday, 61.54, 64.7, True),
    ("38", c_38, 71.34, 75.43, True), ("purpose1", stamp("ON PURPOSE", 540, 520, -7, 120), 73.51, 75.43, True),
    ("left", c_left, 86.31, 90.63, True),
    ("late", stamp("LATE", 540, 420, -8, 170), 92.43, 96.99, True),
    ("home", c_home, 99.51, 101.87, True),
    ("party", c_party, 104.48, 106.76, True), ("won", stamp("THEY WON", 540, 360, -8, 140), 108.52, 109.32, True),
    ("palinka", c_palinka, 112.36, 115.96, True),
    ("pension", c_pension, 118.12, 122.89, True),
    ("list2", c_list2, 125.37, 127.13, True),
    ("purpose2", stamp("ON PURPOSE", 540, 420, -7, 120), 130.69, 131.93, True),
    ("happy", c_happy, 132.2, 135.29, True), ("end", c_end, 135.29, END, True),
]
CAPS = [("Where will you be born today?", 0.0, 1.5), ("Let's spin the wheel.", 1.6, 3.3), ("...Hungary!", 4.48, 5.7),
 ("Only about one in 1,900 babies", 5.76, 8.5), ("on Earth is born here.", 8.56, 10.05), ("Congratulations.", 10.12, 11.25), ("You're rare.", 11.32, 12.4),
 ("Welcome to Debrecen.", 12.48, 14.05), ("Home is a concrete panel block,", 14.1, 16.4), ("with walls so thin", 16.46, 17.65),
 ("you hear the neighbor burp.", 17.7, 19.5), ("First, your name.", 19.58, 20.95), ("By law, it must come from", 20.98, 22.55),
 ("an official list of 4,703 names.", 22.58, 26.25), ("Your parents pick Attila.", 26.3, 28.2), ("Like the king.", 28.25, 29.15),
 ("And 140,000 other Hungarians.", 29.17, 32.45), ("Hungary really wants babies.", 32.53, 34.75), ("Have three, and an 11-million-forint loan", 34.81, 37.45),
 ("vanishes.", 37.49, 38.3), ("Have four, and Mom never pays", 38.33, 40.3), ("income tax again.", 40.33, 41.7),
 ("And yet, last year", 41.77, 43.35), ("only 72,000 babies were born.", 43.39, 46.0), ("The fewest ever.", 46.07, 47.6),
 ("Dad's a factory engineer.", 47.71, 49.45), ("Mom's a teacher.", 49.51, 50.5), ("Together they take home", 50.55, 51.7),
 ("about 800,000 forints a month.", 51.75, 54.05), ("And complain about it.", 54.11, 55.5), ("Your first word?", 55.59, 56.7),
 ("Also a complaint.", 56.75, 57.85), ("Here, complaining isn't rude.", 57.9, 59.55), ("It's how you say hello.", 59.62, 60.9),
 ("You get two birthdays:", 60.98, 62.55), ("your real one, and your name day.", 62.62, 64.65), ("Twice the cake.", 64.7, 65.75),
 ("Twice the relatives.", 65.82, 67.2), ("On Sundays, Grandpa takes you", 67.26, 69.1), ("to the thermal bath", 69.14, 70.0),
 ("and teaches you chess", 70.06, 71.1), ("in 38\u00b0C water.", 71.14, 72.9), ("He loses on purpose.", 72.95, 74.2), ("Then complains.", 74.27, 75.4),
 ("At Christmas, Mom's bejgli", 75.43, 77.4), ("cracks in the oven.", 77.47, 78.55), ("She cries.", 78.63, 79.55), ("Your sister says", 79.59, 80.6),
 ("it's just overflowing with love.", 80.67, 83.05), ("At 18, your friends start", 83.11, 84.98), ("packing for Germany.", 85.03, 86.25),
 ("Over half a million Hungarians", 86.31, 88.2), ("already left.", 88.23, 89.3), ("You stay.", 89.35, 90.55), ("You take the train.", 90.63, 91.85),
 ("It's late.", 91.91, 92.8), ("Not because of snow.", 92.87, 94.1), ("Because the train bringing", 94.19, 95.5), ("the conductor is late.", 95.55, 96.95),
 ("At 28, you finally move out.", 96.99, 99.45), ("Nearly half the guys your age", 99.51, 101.2), ("haven't.", 101.27, 101.8),
 ("Your first vote?", 101.87, 102.95), ("A joke party promising", 103.0, 104.4), ("two sunsets a day and free beer.", 104.48, 106.7),
 ("In one Budapest district,", 106.76, 108.45), ("they won.", 108.52, 109.25), ("Grandpa brews his own p\u00e1linka.", 109.32, 111.5),
 ("Legal, and tax-free", 111.56, 112.95), ("up to 86 liters a year.", 113.0, 114.9), ("He's close.", 114.96, 115.9),
 ("At 65, your pension comes", 115.96, 118.05), ("with a bonus month every February.", 118.12, 120.2), ("You spend it complaining.", 120.25, 121.95),
 ("Happily.", 122.01, 122.85), ("Then your grandchild is born.", 122.89, 125.3), ("Name? From the list.", 125.37, 127.05),
 ("And on Sunday, you take them", 127.13, 128.45), ("to the bath and teach them chess.", 128.49, 130.35), ("You lose on purpose.", 130.41, 131.85),
 ("And that's the greatest", 131.93, 133.5), ("happiness there is.", 133.57, 135.2),
 ("Which country should we do next?", 135.29, 137.15), ("Tell us in the comments.", 137.21, END)]
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
            if not key.startswith(('shade', 'loan_s', 'burp')): low = max(low, L[key][1][3] if L[key][1] else 0)
    caption(fr, t, low - 70)
    draw_age(fr, t)
    ff.stdin.write(fr.convert("RGB").tobytes())
ff.stdin.close(); ff.wait(); print("done", n1 - n0)
