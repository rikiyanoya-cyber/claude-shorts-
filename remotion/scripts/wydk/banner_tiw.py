# YouTube channel banner (2560x1440) for The Life Atlas, in the kit look: deep teal space, nebula, stars, sparkles,
# an ink-outlined earth and the title. Everything that matters sits inside the 1546x423 safe area (phones crop to it).
# usage: python3 banner_tiw.py <kit dir> out.png
import sys, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
KIT, OUT = sys.argv[1:3]; sys.path.insert(0, KIT)
from tiw_style import INK, TEAL, TEAL_D, CREAM, AMBER, F_BIG, F_HAND, outlined, grain
W, H = 2560, 1440; SX0, SY0, SX1, SY1 = (W - 1546) // 2, (H - 423) // 2, (W + 1546) // 2, (H + 423) // 2
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); t = yy / H
bg = np.zeros((H, W, 3), np.float32)
for i, c in enumerate(TEAL_D): bg[..., i] = c * (1 - t) + (8 + (TEAL[i] - 8) * .5) * t
def cloud(scale, s):
    n = np.random.default_rng(s).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
neb = np.clip((cloud(300, 3) * .6 + cloud(140, 4) * .3 + cloud(60, 5) * .1 - .45) * 2.2, 0, 1)
warm = np.clip(1 - np.hypot(xx - W * .8, yy - H * .3) / (W * .6), 0, 1); cool = np.clip(1 - np.hypot(xx - W * .2, yy - H * .7) / (W * .6), 0, 1)
bg += neb[..., None] * (warm[..., None] * np.array(AMBER) * .4 + cool[..., None] * np.array((60, 120, 110)) * .5)
img = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert("RGBA").filter(ImageFilter.GaussianBlur(2))
rng = np.random.default_rng(11); d = ImageDraw.Draw(img)
for k in range(900):
    x, y = rng.uniform(0, W), rng.uniform(0, H); r = rng.choice([1, 1.5, 2, 2.5, 3])
    d.ellipse([x - r, y - r, x + r, y + r], fill=(CREAM if rng.random() > .2 else AMBER) + (int(rng.uniform(90, 230)),))
for k in range(26):
    x, y = rng.uniform(0, W), rng.uniform(0, H); s = rng.uniform(12, 26)
    d.line([(x - s, y), (x + s, y)], fill=CREAM + (220,), width=3); d.line([(x, y - s), (x, y + s)], fill=CREAM + (220,), width=3)
# earth (satellite, tinted teal like the kit), black ink outline, inside the safe area on the left
tex = np.asarray(Image.open(os.path.join(KIT, "earth_day_4096.jpg")).convert("RGB")).astype(np.float32) * .82 + np.array((20, 40, 36)) * .18
TH, TW = tex.shape[:2]; R = 190; CX, CY = SX0 + 230, H / 2; l0, p0 = math.radians(-30), math.radians(25)
x = (xx - CX) / R; y = -(yy - CY) / R; rho = np.sqrt(x * x + y * y); inside = rho <= 1
c = np.arcsin(np.clip(rho, 0, 1)); sc, cc = np.sin(c), np.cos(c)
with np.errstate(invalid="ignore", divide="ignore"):
    lat = np.arcsin(np.clip(cc * math.sin(p0) + np.where(rho > 0, y * sc * math.cos(p0) / np.maximum(rho, 1e-9), 0), -1, 1))
    lon = l0 + np.arctan2(x * sc, rho * math.cos(p0) * cc - y * math.sin(p0) * sc)
u = ((np.degrees(lon) + 180) % 360) / 360 * (TW - 1); v = (90 - np.degrees(lat)) / 180 * (TH - 1)
e = tex[v.astype(int).clip(0, TH - 1), u.astype(int).clip(0, TW - 1)] * (.5 + .5 * np.sqrt(np.clip(1 - rho * rho, 0, 1)))[..., None]
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse([CX - R - 30, CY - R - 30, CX + R + 30, CY + R + 30], fill=(120, 190, 170, 120))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30)))
img.paste(Image.fromarray(e.clip(0, 255).astype(np.uint8)).convert("RGBA"), (0, 0), Image.fromarray((inside * 255).astype(np.uint8)))
d = ImageDraw.Draw(img); d.ellipse([CX - R, CY - R, CX + R, CY + R], outline=INK + (255,), width=10)
# roulette marker on the globe (the series' opening)
d.ellipse([CX - 52, CY - 52, CX + 52, CY + 52], outline=INK + (255,), width=14); d.ellipse([CX - 48, CY - 48, CX + 48, CY + 48], outline=AMBER + (255,), width=8)
d.polygon([(CX - 22, CY - 112), (CX + 22, CY - 112), (CX, CY - 60)], fill=AMBER + (255,), outline=INK + (255,), width=5)
# title + tagline
L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); tx = SX0 + 520 + (SX1 - SX0 - 520) / 2
outlined(L, (tx, H / 2 - 50), "THE LIFE ATLAS", F_BIG(150), fill=AMBER, sw=12)
outlined(L, (tx, H / 2 + 95), "Spin the wheel. Live a whole life somewhere new.", F_HAND(54), fill=CREAM, sw=6)
img.alpha_composite(L); img.alpha_composite(grain((W, H), 12, 4)); img.convert("RGB").save(OUT)
