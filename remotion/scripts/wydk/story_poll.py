# The World You Don't Know: Instagram story base for the "which country next?" poll (2026-11-28).
# Same space backdrop as the opening, the question card at the top, an empty band in the middle for the poll sticker,
# and the globe from the episode's last opening frame (country in red) at the bottom.
# Safe areas: nothing above y=260 (progress bar, account name); the tag stays above the reply bar (y < 1700).
# usage: python3 story_poll.py <kit dir> <globe frame.jpg> out.png ["JUST WATCHED: RUSSIA"]
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
KIT, GLOBE, OUT = sys.argv[1:4]; TAG = sys.argv[4] if len(sys.argv) > 4 else ""
sys.path.insert(0, KIT)
from tiw_style import *
# space backdrop: the recipe from globe_space_spin.py
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
im = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert("RGBA").filter(ImageFilter.GaussianBlur(2))
d = ImageDraw.Draw(im)
for k in range(420):
    x, y = rng.uniform(0, W), rng.uniform(0, H); r = rng.choice([1, 1, 1.5, 2, 2.5])
    d.ellipse([x - r, y - r, x + r, y + r], fill=(CREAM if rng.random() > .2 else AMBER) + (int(rng.uniform(90, 230)),))
for k in range(14):
    x, y = rng.uniform(0, W), rng.uniform(0, H); s = rng.uniform(10, 22)
    d.line([(x - s, y), (x + s, y)], fill=CREAM + (220,), width=3); d.line([(x, y - s), (x, y + s)], fill=CREAM + (220,), width=3)
# globe: cut the disc (+ glow) out of the frame, centre it at y=1800 (the poll sticker needs y=790-1190)
g = Image.open(GLOBE).convert("RGBA"); R = 520
m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse([540 - R, 960 - R, 540 + R, 960 + R], fill=255); m = m.filter(ImageFilter.GaussianBlur(30))
g.putalpha(m); im.alpha_composite(g.crop((0, 960 - R - 40, W, H)), (0, 1800 - R - 40))
im.alpha_composite(grain((W, H), 14, 7))
L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
card(L, (110, 330, 970, 760), seed=21)
outlined(L, (540, 450), "WHICH COUNTRY", F_BIG(104), fill=CREAM)
outlined(L, (540, 585), "NEXT?", F_BIG(160), fill=AMBER)
outlined(L, (540, 700), "Vote below", F_HAND(66), fill=INK, sw=0, shadow=False)
if TAG:
    f = F_HAND(56); w = ImageDraw.Draw(L).textlength(TAG, font=f)
    card(L, (540 - w / 2 - 36, 1205, 540 + w / 2 + 36, 1285), seed=3)
    outlined(L, (540, 1245), TAG, f, fill=INK, sw=0, shadow=False)
im.alpha_composite(L); im.convert("RGB").save(OUT, quality=95); print(OUT)
