"""ZERO HOUR long-form YouTube thumbnail (1280x720).

Layout: dark panel on the left with stacked text, scene image on the right
(fades into the panel), warm glow on one focal point.

  CITY          big gold headline (e.g. TOKYO, NEW DELHI)
  30            big white number
  STUDENTS      white
  TRAPPED       red
  [DAY 1 – FINAL DAY]  red label

Usage:
  python3 make_thumbnail.py scene.jpg out.jpg --city TOKYO --num 30 \
      --line1 STUDENTS --line2 TRAPPED --label "DAY 1 – FINAL DAY" \
      --crop 390,40,1536,1080 --glow 880,245
`scene.jpg` is a clean 1920x1080 frame (no captions/HUD).
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'NSJP900.ttf')
GOLD, WHITE, RED, PANEL = (255, 211, 106), (255, 255, 255), (230, 40, 30), (10, 12, 20)


def font(size):
    return ImageFont.truetype(FONT, size)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('scene'); ap.add_argument('out')
    ap.add_argument('--city', default='TOKYO')
    ap.add_argument('--num', default='30')
    ap.add_argument('--line1', default='STUDENTS')
    ap.add_argument('--line2', default='TRAPPED')
    ap.add_argument('--label', default='DAY 1 – FINAL DAY')
    ap.add_argument('--crop', default='390,40,1536,1080', help='x0,y0,x1,y1 of the scene to show on the right')
    ap.add_argument('--glow', default='880,245', help='x,y of the focal glow on the 1280x720 canvas ("" for none)')
    a = ap.parse_args()

    src = Image.open(a.scene).convert('RGB')
    img = src.crop(tuple(int(v) for v in a.crop.split(','))).resize((793, 720), Image.LANCZOS)
    img = ImageEnhance.Color(img).enhance(1.1)
    img = Image.blend(img, Image.new('RGB', img.size, (40, 20, 60)), .28)   # dusk grade
    img = ImageEnhance.Contrast(img).enhance(1.25)

    th = Image.new('RGB', (1280, 720), PANEL)
    th.paste(img, (487, 0))
    fade = Image.new('L', th.size, 0); d = ImageDraw.Draw(fade)
    for x in range(487, 700):
        d.line([(x, 0), (x, 720)], fill=int(255 * (1 - (x - 487) / 213)))
    th.paste(Image.new('RGB', th.size, PANEL), (0, 0), fade)

    if a.glow:
        gx, gy = (int(v) for v in a.glow.split(','))
        g = Image.new('RGB', th.size, (0, 0, 0))
        ImageDraw.Draw(g).ellipse([gx - 80, gy - 75, gx + 80, gy + 75], fill=(255, 190, 90))
        th = ImageChops.add(th, g.filter(ImageFilter.GaussianBlur(40)))

    d = ImageDraw.Draw(th)

    def st(xy, t, f, fill, sw=7):
        d.text(xy, t, font=f, fill=fill, stroke_width=sw, stroke_fill=(0, 0, 0))

    city_size = 150 if len(a.city) <= 6 else 96
    st((52, 30), a.city, font(city_size), GOLD, sw=8)
    st((56, 215), a.num, font(150), WHITE)
    st((60, 385), a.line1, font(82), WHITE)
    st((60, 480), a.line2, font(82), RED)
    d.rectangle([60, 606, 470, 662], fill=(214, 38, 28))
    d.text((265, 635), a.label, font=font(34), fill=WHITE, anchor='mm')
    th.save(a.out, quality=93)


if __name__ == '__main__':
    main()
