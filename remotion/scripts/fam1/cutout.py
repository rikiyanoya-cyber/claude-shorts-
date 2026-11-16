# Cut the glowing characters out of their navy background: alpha from the colour distance to the border's navy,
# the navy unmixed from soft edges, small specks dropped, cropped to the figure.  usage: python3 cutout.py <assets dir> <out dir>
import sys, os, glob, numpy as np
from PIL import Image
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.jpg'))):
    im = np.asarray(Image.open(f).convert('RGB')).astype(np.float32); H, W, _ = im.shape
    border = np.concatenate([im[:8].reshape(-1, 3), im[-8:].reshape(-1, 3), im[:, :8].reshape(-1, 3), im[:, -8:].reshape(-1, 3)]); bg = np.median(border, 0)
    d = np.sqrt(((im - bg) ** 2).sum(2)); a = np.clip((d - 22) / (60 - 22), 0, 1)
    lab, n = ndimage.label(ndimage.binary_dilation(a > .5, iterations=6))
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1)); keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > sizes.max() * .08])
    a = a * ndimage.binary_dilation(keep, iterations=3)
    col = np.clip((im - (1 - a[..., None]) * bg) / np.maximum(a, 1e-3)[..., None], 0, 255)
    ys, xs = np.where(a > .1); pad = 6
    Image.fromarray(np.dstack([col, a * 255]).astype(np.uint8)).crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + pad), min(H, ys.max() + pad))).save(os.path.join(out, os.path.basename(f)[:-4] + '.png'))
