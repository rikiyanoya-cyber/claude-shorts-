# The World You Don't Know cover in the kit look (2026-11-26): owner art + "IF YOU WERE BORN IN / PLACE" + a small tag.
# Text stays between y=200 and y=600 so a 3:4 grid crop keeps it.
# usage: python3 cover_tiw.py <kit dir> art.jpg out.png "PLACE" "TAG"
import sys
from PIL import Image, ImageDraw
KIT, ART, OUT, PLACE, TAG = sys.argv[1:6]
sys.path.insert(0, KIT)
from tiw_style import *
im = Image.open(ART).convert("RGB"); s = max(W / im.width, H / im.height)
im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
im = im.crop(((im.width - W) // 2, 0, (im.width - W) // 2 + W, H)).convert("RGBA")
L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); top_shade(L, 700)
outlined(L, (540, 250), "IF YOU WERE BORN IN", F_HAND(84), fill=CREAM, sw=6)
size = 190 if len(PLACE) <= 8 else 150
outlined(L, (540, 400), PLACE, F_BIG(size), fill=AMBER, sw=10)
if TAG:
    f = F_HAND(58); w = ImageDraw.Draw(L).textlength(TAG, font=f)
    card(L, (540 - w / 2 - 40, 510, 540 + w / 2 + 40, 600), seed=3); outlined(L, (540, 555), TAG, f, fill=INK, sw=0, shadow=False)
im.alpha_composite(L); im.convert("RGB").save(OUT)
