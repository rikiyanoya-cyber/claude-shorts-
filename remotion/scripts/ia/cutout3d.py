# Cut a 3D character/prop off its plain navy background (Flow renders): navy = blue-dominant and dark.
# Keeps the big connected parts, fills holes (eyes, glasses, phones), soft 2-px edge. usage: cutout3d.py <in> <out.png>
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im = Image.open(sys.argv[1]).convert("RGB"); a = np.asarray(im).astype(float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
navy = ((b - r) > 28) & ((b - g) > 10) & (a.max(2) < 140)
fg = ndimage.binary_opening(~navy, iterations=2)
lab, n = ndimage.label(fg); sizes = ndimage.sum(fg, lab, range(1, n + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > max(1500, sizes.max() * 0.02)])
keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=3))
alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
ys, xs = np.where(keep); pad = 6
box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad), min(im.height, ys.max() + pad))
out = im.convert("RGBA"); out.putalpha(alpha); out.crop(box).save(sys.argv[2]); print(sys.argv[2], box)
