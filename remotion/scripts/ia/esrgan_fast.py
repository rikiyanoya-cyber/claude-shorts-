# Fast AI upscale for the ep2 stills: Real-ESRGAN compact model (SRVGGNetCompact, realesr-general-x4v3), CPU.
# 4x, then Lanczos down to 2x: crisp edges without the hour-per-image cost of the big RRDB model.
# usage: python3 esrgan_fast.py weights.pth out_dir in1.png [...]   -> out_dir/<name>.jpg (2x, q95)
import sys, os, torch, numpy as np
import torch.nn as nn, torch.nn.functional as F
from PIL import Image

class Compact(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__(); s.up = up
        b = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)]
        for _ in range(nc): b += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf, 3 * up * up, 3, 1, 1)]
        s.body = nn.ModuleList(b)
    def forward(s, x):
        o = x
        for m in s.body: o = m(o)
        return F.pixel_shuffle(o, s.up) + F.interpolate(x, scale_factor=s.up, mode="nearest")

def main():
    w, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    sd = torch.load(w, map_location="cpu"); sd = sd.get("params", sd)
    nc = sum(1 for k in sd if k.endswith(".weight") and sd[k].dim() == 4) - 2
    net = Compact(nc=nc); net.load_state_dict(sd, strict=True); net.eval()
    T, P = 384, 10
    for f in sys.argv[3:]:
        d = os.path.join(out, os.path.splitext(os.path.basename(f))[0] + ".jpg")
        if os.path.exists(d): continue
        im = Image.open(f).convert("RGB"); W, H = im.size
        a = torch.from_numpy(np.asarray(im).astype(np.float32) / 255).permute(2, 0, 1)[None]
        o = torch.zeros(1, 3, H * 4, W * 4)
        with torch.inference_mode():
            for y in range(0, H, T):
                for x in range(0, W, T):
                    y0, x0, y1, x1 = max(0, y - P), max(0, x - P), min(H, y + T + P), min(W, x + T + P)
                    r = net(a[:, :, y0:y1, x0:x1]); yy, xx = (y - y0) * 4, (x - x0) * 4
                    h, ww = min(T, H - y) * 4, min(T, W - x) * 4
                    o[:, :, y * 4:y * 4 + h, x * 4:x * 4 + ww] = r[:, :, yy:yy + h, xx:xx + ww]
        big = Image.fromarray((o[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8))
        big.resize((W * 2, H * 2), Image.LANCZOS).save(d, quality=95)
        print("done", os.path.basename(d), flush=True)

if __name__ == "__main__":
    main()
