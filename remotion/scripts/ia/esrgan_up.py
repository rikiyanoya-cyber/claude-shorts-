# AI upscale (Real-ESRGAN x2plus, CPU, tiled) for the ep2 stills: sharper than Lanczos on 1376 px renders.
# usage: python3 esrgan_up.py weights.pth out_dir in1.png [in2.png ...]   -> out_dir/<name>.jpg (2x, q95)
import sys, os, torch, numpy as np
import torch.nn as nn, torch.nn.functional as F
from PIL import Image

class RDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__()
        s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1); s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1)))
        x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1))); x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1)))
        return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * .2 + x
class RRDB(nn.Module):
    def __init__(s, nf=64):
        super().__init__(); s.rdb1, s.rdb2, s.rdb3 = RDB(nf), RDB(nf), RDB(nf)
    def forward(s, x): return s.rdb3(s.rdb2(s.rdb1(x))) * .2 + x
class Net(nn.Module):  # RRDBNet, scale 2 (pixel-unshuffle input)
    def __init__(s, nf=64, nb=23):
        super().__init__()
        s.conv_first = nn.Conv2d(12, nf, 3, 1, 1); s.body = nn.Sequential(*[RRDB(nf) for _ in range(nb)])
        s.conv_body = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        s.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_last = nn.Conv2d(nf, 3, 3, 1, 1); s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        f = s.conv_first(F.pixel_unshuffle(x, 2)); f = f + s.conv_body(s.body(f))
        f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode="nearest")))
        f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode="nearest")))
        return s.conv_last(s.l(s.conv_hr(f)))

def main():
    w, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    net = Net(); sd = torch.load(w, map_location="cpu"); net.load_state_dict(sd.get("params_ema", sd.get("params", sd)), strict=True); net.eval()
    T, P = 256, 16
    for f in sys.argv[3:]:
        d = os.path.join(out, os.path.splitext(os.path.basename(f))[0] + ".jpg")
        if os.path.exists(d): continue
        a = torch.from_numpy(np.asarray(Image.open(f).convert("RGB")).astype(np.float32) / 255).permute(2, 0, 1)[None]
        _, _, H, W = a.shape; o = torch.zeros(1, 3, H * 2, W * 2)
        with torch.inference_mode():
            for y in range(0, H, T):
                for x in range(0, W, T):
                    y0, x0, y1, x1 = max(0, y - P), max(0, x - P), min(H, y + T + P), min(W, x + T + P)
                    r = net(a[:, :, y0:y1, x0:x1])
                    yy, xx = (y - y0) * 2, (x - x0) * 2; h, ww = min(T, H - y) * 2, min(T, W - x) * 2
                    o[:, :, y * 2:y * 2 + h, x * 2:x * 2 + ww] = r[:, :, yy:yy + h, xx:xx + ww]
        Image.fromarray((o[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8)).save(d, quality=95)
        print("done", os.path.basename(d), flush=True)

if __name__ == "__main__":
    main()
