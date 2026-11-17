# Make the 18 poses match: one chair colour (the dark wood of the main boy's chair) and one colour for the
# body's inner lines (the light grey of the main boy). Only the three odd ones are touched.  usage: unify.py <cut dir> <out dir>
import sys, os, shutil, numpy as np
from scipy import ndimage
from PIL import Image
src, out = sys.argv[1:3]; os.makedirs(out, exist_ok=True)
for f in os.listdir(src): shutil.copy(os.path.join(src, f), os.path.join(out, f))
WOOD = np.array([86, 60, 46], np.float32); LINE = np.array([205, 207, 214], np.float32)
def load(n):
    im = np.asarray(Image.open(os.path.join(src, n + '.png')).convert('RGBA')).astype(np.float32); return im
INK = np.array([28, 34, 54], np.float32)
def fill_lines(im, body_lines=False):
    # dark inner marks (eyes, mouths, outlines) were keyed out with the navy background: put them back as solid ink,
    # so they stay dark on any ground. On the two odd poses the body's limb lines become light grey like the main boy's.
    solid = im[..., 3] > 128; holes = ndimage.binary_fill_holes(solid) & ~solid
    # only small or thin holes are marks; a big enclosed gap (between an arm and the head, under a chair) stays see-through
    lab, n = ndimage.label(holes); keep = np.zeros_like(holes)
    for i in range(1, n + 1):
        c = lab == i
        if c.sum() < 500 or not ndimage.binary_erosion(c, iterations=5).any(): keep |= c
    holes = keep
    H = im.shape[0]; low = np.zeros_like(holes); low[int(.42 * H):] = True
    col = np.where(((holes & low) if body_lines else np.zeros_like(holes))[..., None], LINE, INK)
    im[..., :3] = np.where(holes[..., None], col, im[..., :3]); im[..., 3] = np.where(holes, 255, im[..., 3]); return im
def save(n, im): Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(os.path.join(out, n + '.png'))
def stats(im):
    rgb = im[..., :3]; mx = rgb.max(2); mn = rgb.min(2); return rgb, mx, (mx - mn) / np.maximum(mx, 1)
def box(im, x0, y0, x1, y1):
    m = np.zeros(im.shape[:2], bool); m[y0:y1, x0:x1] = True; return m
def recolor(im, mask, col):   # keep the pixel's lightness pattern, move it to the target colour
    rgb = im[..., :3]; lum = rgb.mean(2, keepdims=True); ref = lum[mask].mean() if mask.any() else 1
    im[..., :3] = np.where(mask[..., None], col * np.clip(lum / ref, .6, 1.25), rgb)
# red-haired boy: light grey chair behind/right of him; dark navy limb lines -> light grey
n = 'boy-red-sit-watch'; im = load(n); rgb, mx, sat = stats(im); a = im[..., 3] > 40
chair = a & box(im, 115, 200, 265, 474) & (mx > 140) & (mx < 228) & (sat < .25)
recolor(im, chair, WOOD)
lines = a & (mx < 120) & box(im, 0, 200, 265, 474) & ~chair; im[..., :3] = np.where(lines[..., None], LINE, im[..., :3]); save(n, fill_lines(im, True))
# bob-haired girl: white line-drawn chair on the left -> wood; dark limb lines -> light grey
n = 'girl-bob-stare'; im = load(n); rgb, mx, sat = stats(im); a = im[..., 3] > 40
white = a & (mx > 200)
chair = white & (box(im, 0, 180, 42, 471) | box(im, 0, 340, 150, 374) | box(im, 0, 362, 42, 471) | box(im, 95, 362, 150, 471))
recolor(im, chair, WOOD)
lines = a & (mx < 120) & box(im, 300, 0, 333, 0) ; lines = a & (mx < 110) & box(im, 0, 215, 333, 471) & ~chair
im[..., :3] = np.where(lines[..., None], LINE, im[..., :3]); save(n, fill_lines(im, True))
# blond girl clapping: grey-brown chair -> wood; grey lines on the hands and legs -> light grey
n = 'girl-long-clap'; im = load(n); rgb, mx, sat = stats(im); a = im[..., 3] > 40
grey = a & (mx > 70) & (mx < 185) & (sat < .3)
chair = grey & (box(im, 0, 250, 40, 505) | box(im, 0, 380, 244, 505)) & ~box(im, 130, 340, 244, 505)
recolor(im, chair, WOOD)
lines = grey & ~chair & box(im, 40, 200, 244, 505); im[..., :3] = np.where(lines[..., None], LINE, im[..., :3]); save(n, im)
# every other pose: eyes and marks back as solid ink
for f in os.listdir(out):
    n = f[:-4]
    if n in ('boy-red-sit-watch', 'girl-bob-stare'): continue
    im = np.asarray(Image.open(os.path.join(out, f)).convert('RGBA')).astype(np.float32); save(n, fill_lines(im))
print('done')
