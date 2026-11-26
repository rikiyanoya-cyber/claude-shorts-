# The World You Don't Know — opening on the space globe (marketing's kit, 2026-11-26 look: deep teal space,
# amber/teal nebula, cross sparkles, satellite earth tinted teal, black ink outline).
# Two roulettes: spin the globe and stop on a country; then split the country into regions, cycle a highlight
# and stop on one; then zoom to a city pin. Writes frames f0000.jpg... and events.json (tick/ding times).
# usage: python3 globe_space_spin.py <kit dir> <states.geojson> <out dir> <config.json>
import json, sys, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
KIT, STATES, OUT, CFG = sys.argv[1:5]
sys.path.insert(0, KIT)
from tiw_style import W, H, INK, TEAL, TEAL_D, CREAM, AMBER, grain
cfg = json.load(open(CFG)); FPS = 30
os.makedirs(OUT, exist_ok=True)
ease = lambda s: 1 - (1 - min(1, max(0, s))) ** 3
eio = lambda s: (lambda x: 3 * x * x - 2 * x * x * x)(min(1, max(0, s)))

# ---- space background (once), same recipe as the kit's globe_space.py
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
t_ = yy / H; bg = np.zeros((H, W, 3), np.float32)
for i, c in enumerate(TEAL_D): bg[..., i] = c * (1 - t_) + (8 + (TEAL[i] - 8) * 0.5) * t_
def cloud(scale, s):
    n = np.random.default_rng(s).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
neb = np.clip((cloud(240, 7) * .6 + cloud(110, 8) * .3 + cloud(50, 9) * .1 - .45) * 2.2, 0, 1)
warm = np.clip(1 - np.hypot(xx - W * .85, yy - H * .15) / (W * .9), 0, 1); cool = np.clip(1 - np.hypot(xx - W * .1, yy - H * .85) / (W * .9), 0, 1)
bg += neb[..., None] * (warm[..., None] * np.array(AMBER) * .35 + cool[..., None] * np.array((60, 120, 110)) * .45)
SPACE = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert("RGBA").filter(ImageFilter.GaussianBlur(2))
d = ImageDraw.Draw(SPACE)
for k in range(420):
    x, y = rng.uniform(0, W), rng.uniform(0, H); r = rng.choice([1, 1, 1.5, 2, 2.5])
    d.ellipse([x - r, y - r, x + r, y + r], fill=(CREAM if rng.random() > .2 else AMBER) + (int(rng.uniform(90, 230)),))
for k in range(14):
    x, y = rng.uniform(0, W), rng.uniform(0, H); s = rng.uniform(10, 22)
    d.line([(x - s, y), (x + s, y)], fill=CREAM + (220,), width=3); d.line([(x, y - s), (x, y + s)], fill=CREAM + (220,), width=3)
GRAIN = grain((W, H), 14, 7)
TEX = np.asarray(Image.open(os.path.join(KIT, "earth_day_4096.jpg")).convert("RGB")).astype(np.float32); TH, TW = TEX.shape[:2]
TEX = TEX * .82 + np.array((20, 40, 36)) * .18

def rings(path, key, keep):
    out = []
    for f in json.load(open(path))["features"]:
        k = keep(f["properties"])
        if k is None: continue
        g = f["geometry"]
        for poly in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]):
            out.append((k, np.radians(np.array(poly[0], np.float64))))
    return out
COUNTRIES = rings(os.path.join(KIT, "ne_50m_admin_0_countries.geojson"), "ADM0_A3", lambda p: p.get("ADM0_A3"))
REG = cfg["regions"]; state2reg = {s: r for r, ss in REG.items() for s in ss}
STATES_R = rings(STATES, "postal", lambda p: state2reg.get(p.get("postal")) if p.get("adm0_a3") == cfg["iso"] else None)

def frame(lon0, lat0, R, CX, CY, hi_country, regions, region_alpha):
    """regions: {name: (rgb, alpha)} or None"""
    l0, p0 = math.radians(lon0), math.radians(lat0)
    x = (xx - CX) / R; y = -(yy - CY) / R; rho = np.sqrt(x * x + y * y); inside = rho <= 1
    c = np.arcsin(np.clip(rho, 0, 1)); sc, cc = np.sin(c), np.cos(c)
    with np.errstate(invalid="ignore", divide="ignore"):
        lat = np.arcsin(np.clip(cc * math.sin(p0) + np.where(rho > 0, y * sc * math.cos(p0) / np.maximum(rho, 1e-9), 0), -1, 1))
        lon = l0 + np.arctan2(x * sc, rho * math.cos(p0) * cc - y * math.sin(p0) * sc)
    u = ((np.degrees(lon) + 180) % 360) / 360 * (TW - 1); v = (90 - np.degrees(lat)) / 180 * (TH - 1)
    e = TEX[v.astype(int).clip(0, TH - 1), u.astype(int).clip(0, TW - 1)] * (.5 + .5 * np.sqrt(np.clip(1 - rho * rho, 0, 1)))[..., None]
    img = SPACE.copy()
    if R < 3000:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse([CX - R - 24, CY - R - 24, CX + R + 24, CY + R + 24], fill=(120, 190, 170, 110))
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(28)))
    img.paste(Image.fromarray(e.clip(0, 255).astype(np.uint8)).convert("RGBA"), (0, 0), Image.fromarray((inside * 255).astype(np.uint8)))
    sp, cp = math.sin(p0), math.cos(p0)
    def proj(ring):
        lo, la = ring[:, 0], ring[:, 1]; vis = sp * np.sin(la) + cp * np.cos(la) * np.cos(lo - l0)
        px = CX + R * np.cos(la) * np.sin(lo - l0); py = CY - R * (cp * np.sin(la) - sp * np.cos(la) * np.cos(lo - l0))
        return list(zip(px.tolist(), py.tolist())), (vis > 0).mean()
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
    for code, ring in COUNTRIES:
        xy, ok = proj(ring)
        if ok < .9: continue
        if code == cfg["iso"] and hi_country > 0 and region_alpha < 1:
            dl.polygon(xy, fill=(214, 72, 52, int(175 * hi_country * (1 - region_alpha))), outline=INK + (int(255 * hi_country),), width=4)
        else: dl.line(xy + [xy[0]], fill=CREAM + (60,), width=1)
    if regions and region_alpha > 0:
        for name, ring in STATES_R:
            xy, ok = proj(ring)
            if ok < .9: continue
            rgb, a = regions[name]; dl.polygon(xy, fill=rgb + (int(a * region_alpha),), outline=INK + (int(160 * region_alpha),), width=2)
    img.alpha_composite(lay)
    if R < 3000: ImageDraw.Draw(img).ellipse([CX - R, CY - R, CX + R, CY + R], outline=INK + (255,), width=8)
    return img, proj

def marker(img, cx, cy, k):
    """roulette marker: amber ring + pointer, bounces after the stop (k = s since the stop, <0 before)"""
    b = 1 + (.14 * math.exp(-k * 6) * math.cos(k * 22) if k >= 0 else 0); r = 86 * b
    d = ImageDraw.Draw(img); d.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4], outline=INK + (255,), width=14)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=AMBER + (255,), width=8)
    tri = [(cx - 30, cy - r - 62), (cx + 30, cy - r - 62), (cx, cy - r - 10)]; d.polygon(tri, fill=AMBER + (255,), outline=INK + (255,), width=5)

def pin(img, x, y, k):
    s = ease(k / .35) if k >= 0 else 0
    if s <= 0: return
    d = ImageDraw.Draw(img); h = 90 * s
    d.polygon([(x, y), (x - 26 * s, y - h * .62), (x + 26 * s, y - h * .62)], fill=AMBER + (255,), outline=INK + (255,), width=5)
    d.ellipse([x - 34 * s, y - h - 30 * s, x + 34 * s, y - h + 30 * s], fill=AMBER + (255,), outline=INK + (255,), width=6)
    d.ellipse([x - 12 * s, y - h - 10 * s, x + 12 * s, y - h + 10 * s], fill=INK + (255,))

C = cfg; ticks = []; prev = None; last_hop = -1
names = list(REG.keys()); cols = {n: tuple(c) for n, c in C["colors"].items()}
N = int(C["end"] * FPS)
for i in range(N):
    t = i / FPS; CX, CY = W / 2, H * .5
    k1 = t - C["stop1"]
    if t < C["stop1"]:   # spin 1
        s = ease((t - .1) / (C["stop1"] - .1)); lon = C["lon"] + 360 * C["turns"] * (1 - s); lat = 18 + (C["lat"] - 18) * s
        if prev is not None and int((prev - C["lon"]) / 22) != int((lon - C["lon"]) / 22): ticks.append(round(t, 3))
        prev = lon; img, _ = frame(lon, lat, 430, CX, CY, 0, None, 0); marker(img, CX, CY, -1)
    elif t < C["zoom1"]:   # stopped on the country: red, slow push in
        z = eio((t - C["stop1"] - .3) / 2.5); img, _ = frame(C["lon"], C["lat"], 430 + 260 * z, CX, CY, min(1, k1 / .2), None, 0)
        if k1 < .6: marker(img, CX, CY, k1)
    else:   # regions + spin 2 + zoom to the city
        z = eio((t - C["zoom1"]) / 1.2); R = 690 + (C["R2"] - 690) * z
        ra = min(1, max(0, (t - C["regions_t"]) / .35))
        if t < C["spin2"]: regs = {n: (cols[n], 200) for n in names}
        elif t < C["stop2"]:   # cycle the highlight, slowing, landing on the target region
            nhops = 11; u = ease((t - C["spin2"]) / (C["stop2"] - C["spin2"])); hop = int(u * nhops)
            cur = names[(names.index(C["target"]) - nhops + hop) % len(names)]
            if hop != last_hop: ticks.append(round(t, 3)); last_hop = hop
            regs = {n: (cols[n], 230 if n == cur else 60) for n in names}
        else: regs = {n: (cols[n], 235 if n == C["target"] else 40) for n in names}
        k3 = (t - C["stop2"] - .5) / (C["zoomcity"] - C["stop2"] - .5) if t > C["stop2"] + .5 else 0
        zc = eio(k3); lon = C["lon"] + (C["city"][0] - C["lon"]) * zc; lat = C["lat"] + (C["city"][1] - C["lat"]) * zc
        R = R * (1 + (C["R3"] / C["R2"] - 1) * zc)
        img, proj = frame(lon, lat, R, CX, CY, 1, regs, ra)
        if t >= C["stop2"]:
            pxy, _ = proj(np.radians(np.array([C["city"]], np.float64))); pin(img, pxy[0][0], pxy[0][1], t - C["pin"])
    img.alpha_composite(GRAIN); img.convert("RGB").save(f"{OUT}/f{i:04d}.jpg", quality=92)
json.dump({"ticks": ticks, "stop1": C["stop1"], "stop2": C["stop2"]}, open(f"{OUT}/events.json", "w"))
print("frames", N, "ticks", len(ticks))
