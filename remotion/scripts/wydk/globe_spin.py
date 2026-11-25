# The World You Don't Know: series opening "roulette" on the real satellite globe (marketing's globe.py, NASA Blue Marble
# + Natural Earth borders), set on the channel's painted dark-teal backdrop with a warm glow.
# The globe spins fast, slows with ease-out and stops on the target; a gold pointer marks the stop; then the country
# turns red and the camera zooms in. Writes frames + ticks.json (times the pointer passes a country, for the click SFX).
# usage: python3 globe_spin.py <in dir with earth_day_4096.jpg + geojson> <out dir> ISO lon lat [stop_t=4.45] [dur=7.0]
import json, sys, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H, FPS = 1080, 1920, 30
IN, OUT, ISO = sys.argv[1], sys.argv[2], sys.argv[3]
TLON, TLAT = float(sys.argv[4]), float(sys.argv[5])
STOP = float(sys.argv[6]) if len(sys.argv) > 6 else 4.45
DUR = float(sys.argv[7]) if len(sys.argv) > 7 else 7.0
MODE = sys.argv[8] if len(sys.argv) > 8 else "spin"   # "out": slow zoom-out from the country (closing shot)
os.makedirs(OUT, exist_ok=True)
tex = np.asarray(Image.open(f"{IN}/earth_day_4096.jpg").convert("RGB")).astype(np.float32)
TH, TW = tex.shape[:2]
gj = json.load(open(f"{IN}/ne_50m_admin_0_countries.geojson"))
POLYS = []
for f in gj["features"]:
    g = f["geometry"]; ps = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for p in ps: POLYS.append((f["properties"].get("ADM0_A3"), np.array(p[0], np.float64)))

# painted backdrop (channel look): dark teal, brushy strokes, warm glow behind the globe
rng = np.random.default_rng(7)
def backdrop():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32) + np.array([18, 38, 44], np.float32)
    im = Image.fromarray(base.astype(np.uint8)); d = ImageDraw.Draw(im, "RGBA")
    for _ in range(2600):
        x, y = rng.uniform(-50, W + 50), rng.uniform(-50, H + 50); a = rng.uniform(0, math.pi); L = rng.uniform(30, 110)
        c = rng.choice([(28, 58, 64), (12, 28, 34), (36, 70, 72), (20, 44, 50), (46, 62, 52)])
        d.line([(x, y), (x + L * math.cos(a), y + L * math.sin(a))], fill=(*c, int(rng.uniform(40, 110))), width=int(rng.uniform(6, 18)))
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(im).astype(np.float32)
    r = np.sqrt(((xx - W / 2) / 620) ** 2 + ((yy - H * .47) / 700) ** 2)
    glow = np.clip(1 - r, 0, 1) ** 1.6
    a = a * (1 - .55 * glow[..., None]) + np.array([214, 160, 72], np.float32) * (.55 * glow[..., None])
    vig = np.clip(1.15 - .55 * np.sqrt(((xx - W / 2) / W) ** 2 * 2 + ((yy - H / 2) / H) ** 2 * 2), .35, 1)
    return a * vig[..., None]
BG = backdrop()
Image.fromarray(BG.clip(0, 255).astype(np.uint8)).save(f"{OUT}/bg.jpg", quality=94)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def frame(lon0, lat0, R, red, CX=W / 2, CY=H * .47):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    x = (xx - CX) / R; y = -(yy - CY) / R; rho = np.sqrt(x * x + y * y); inside = rho <= 1
    c = np.arcsin(np.clip(rho, 0, 1)); sc, cc = np.sin(c), np.cos(c)
    with np.errstate(invalid="ignore", divide="ignore"):
        lat = np.arcsin(np.clip(cc * math.sin(p0) + np.where(rho > 0, y * sc * math.cos(p0) / np.maximum(rho, 1e-9), 0), -1, 1))
        lon = l0 + np.arctan2(x * sc, rho * math.cos(p0) * cc - y * math.sin(p0) * sc)
    u = ((np.degrees(lon) + 180) % 360) / 360 * (TW - 1); v = (90 - np.degrees(lat)) / 180 * (TH - 1)
    img = tex[v.astype(int).clip(0, TH - 1), u.astype(int).clip(0, TW - 1)]
    img = img * (.55 + .45 * np.sqrt(np.clip(1 - rho * rho, 0, 1)))[..., None]
    # soft warm rim so the globe sits in the painted light
    edge = np.clip((rho - .93) / .07, 0, 1) * inside
    img = img * (1 - .3 * edge[..., None]) + np.array([240, 190, 110]) * (.3 * edge[..., None])
    out = np.where(inside[..., None], img, BG)
    im = Image.fromarray(out.clip(0, 255).astype(np.uint8)).convert("RGBA")
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(halo).ellipse([CX - R - 8, CY - R - 8, CX + R + 8, CY + R + 8], outline=(255, 214, 150, 150), width=12)
    im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(14)))
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    sl, cl, sp, cp = None, None, math.sin(p0), math.cos(p0)
    for code, ring in POLYS:
        lo, la = np.radians(ring[:, 0]), np.radians(ring[:, 1])
        vis = sp * np.sin(la) + cp * np.cos(la) * np.cos(lo - l0)
        if (vis > 0).mean() < .9: continue
        px = CX + R * np.cos(la) * np.sin(lo - l0); py = CY - R * (cp * np.sin(la) - sp * np.cos(la) * np.cos(lo - l0))
        xy = list(zip(px.tolist(), py.tolist()))
        if code == ISO and red > 0:
            d.polygon(xy, fill=(230, 40, 40, int(170 * red)), outline=(255, 110, 100, int(255 * red)), width=4)
        elif R < 2500:
            d.line(xy + [xy[0]], fill=(255, 255, 255, 60), width=1)
    im.alpha_composite(lay)
    return im

def pointer(im, t, glow):
    # roulette marker: a gold ring at the globe centre (the wheel turns under it) with a small pointer on top;
    # it bounces when the wheel stops
    CX, CY = W / 2, H * .47
    k = max(0, t - STOP); b = 1 + (.12 * math.exp(-k * 6) * math.cos(k * 22) if t > STOP else 0)
    r = 92 * b
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse([CX - r, CY - r, CX + r, CY + r], outline=(255, 214, 120, int(140 + 115 * glow)), width=16)
    im.alpha_composite(g.filter(ImageFilter.GaussianBlur(9)))
    d = ImageDraw.Draw(im, "RGBA")
    d.ellipse([CX - r, CY - r, CX + r, CY + r], outline=(255, 220, 130, 255), width=6)
    tri = [(CX - 30, CY - r - 58), (CX + 30, CY - r - 58), (CX, CY - r - 8)]
    d.polygon(tri, fill=(250, 206, 100, 255), outline=(60, 36, 10, 255))

ease = lambda s: 1 - (1 - s) ** 3
T0, TURNS = .15, 3.2
ticks = []; prev = None
if MODE == "out":
    for i in range(int(DUR * FPS)):
        z = ease(i / (DUR * FPS - 1)); R = 3000 + (520 - 3000) * z
        frame(TLON, TLAT - 18 * z, R, 1).convert("RGB").save(f"{OUT}/f{i:04d}.jpg", quality=93)
    sys.exit(0)
for i in range(int(DUR * FPS)):
    t = i / FPS
    if t < STOP:
        s = ease(min(1, max(0, (t - T0) / (STOP - T0))))
        lon = TLON + 360 * TURNS * (1 - s); lat = 20 + (TLAT - 20) * s; R = 430; red = 0
        if prev is not None and int((prev - TLON) / 22) != int((lon - TLON) / 22): ticks.append(round(t, 3))
        prev = lon
        im = frame(lon, lat, R, 0)
    else:
        k = min(1, (t - STOP - .35) / 1.3); z = ease(max(0, k))
        red = min(1, (t - STOP) / .2)
        R = 430 + (3000 - 430) * z; lat = TLAT
        # keep the target under the frame centre while zooming
        im = frame(TLON, lat, R, red)
    if t < STOP + .5: pointer(im, t, 1 if t >= STOP else 0)
    im.convert("RGB").save(f"{OUT}/f{i:04d}.jpg", quality=93)
json.dump({"ticks": ticks, "stop": STOP}, open(f"{OUT}/ticks.json", "w"))
print("frames", i + 1, "ticks", len(ticks))
