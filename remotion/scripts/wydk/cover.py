# The World You Don't Know: vertical cover (1080x1920) = the owner's picture + a title in the empty top third.
# The title sits below y=240 so a 3:4 grid crop (Instagram profile) still shows it.
# usage: python3 cover.py art.jpg out.png "SMALL LINE" "BIG WORD" "GOLD LINE"
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
art, out, l1, l2, l3 = sys.argv[1:6]
W, H = 1080, 1920
F = "/home/user/claude-shorts-/remotion/.pub_wydk/fonts/Anton.ttf"
im = Image.open(art).convert("RGB")
s = max(W / im.width, H / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H)).convert("RGBA")
def line(y, text, size, fill, shadow=18):
    f = ImageFont.truetype(F, size); d = ImageDraw.Draw(im); w = d.textlength(text, font=f); x = (W - w) / 2
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x, y + 6), text, font=f, fill=(0, 0, 0, 200))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(shadow)))
    d = ImageDraw.Draw(im); d.text((x, y), text, font=f, fill=fill, stroke_width=4, stroke_fill=(8, 18, 24))
line(200, l1, 80, (246, 238, 220))
line(290, l2, 210, (226, 72, 61))
line(545, l3, 92, (244, 196, 94))
im.convert("RGB").save(out)
