# The World You Don't Know: vertical cover (1080x1920) = the owner's picture + a title in the empty top third.
# The title sits below y=240 so a 3:4 grid crop (Instagram profile) still shows it.
# usage: python3 cover.py art.jpg out.png "SMALL LINE" "BIG WORD" "GOLD LINE"
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
art, out, l1, l2, l3 = sys.argv[1:6]
W, H = 1080, 1920
F = "/home/user/claude-shorts-/remotion/.pub_wydk/fonts/Anton.ttf"
ZOOM, CX, CY = 1.32, .56, .50   # push in on the character + flag so the flag reads at phone size
im = Image.open(art).convert("RGB")
s = max(W / im.width, H / im.height) * ZOOM; im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
x0 = min(max(0, round(im.width * CX - W / 2)), im.width - W); y0 = min(max(0, round(im.height * CY - H / 2)), im.height - H)
im = im.crop((x0, y0, x0 + W, y0 + H)).convert("RGBA")
def flag(x, y, w):
    # Norway: red, white-bordered blue Nordic cross (22:16)
    h = w * 16 / 22; u = w / 22; f = Image.new("RGBA", (int(w), int(h)), (186, 12, 47, 255)); d = ImageDraw.Draw(f)
    d.rectangle([6 * u, 0, 10 * u, h], fill="white"); d.rectangle([0, 6 * u, w, 10 * u], fill="white")
    d.rectangle([7 * u, 0, 9 * u, h], fill=(0, 32, 91)); d.rectangle([0, 7 * u, w, 9 * u], fill=(0, 32, 91))
    m = Image.new("L", f.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, f.width - 1, f.height - 1], radius=int(u * 1.5), fill=255); f.putalpha(m)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x, y + 8, x + w, y + h + 8], radius=int(u * 1.5), fill=(0, 0, 0, 170))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14))); im.alpha_composite(f, (int(x), int(y)))
    ImageDraw.Draw(im).rounded_rectangle([x, y, x + w, y + h], radius=int(u * 1.5), outline=(8, 18, 24), width=4)
def line(y, text, size, fill, shadow=18, x=None):
    f = ImageFont.truetype(F, size); d = ImageDraw.Draw(im); w = d.textlength(text, font=f); x = (W - w) / 2 if x is None else x
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x, y + 6), text, font=f, fill=(0, 0, 0, 200))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(shadow)))
    d = ImageDraw.Draw(im); d.text((x, y), text, font=f, fill=fill, stroke_width=4, stroke_fill=(8, 18, 24))
line(150, l1, 80, (246, 238, 220))
fw = 200; f2 = ImageFont.truetype(F, 200); tw = ImageDraw.Draw(im).textlength(l2, font=f2); gx = (W - (fw + 34 + tw)) / 2
flag(gx, 300, fw); line(232, l2, 200, (226, 72, 61), x=gx + fw + 34)
line(1640, l3, 110, (244, 196, 94))
im.convert("RGB").save(out)
