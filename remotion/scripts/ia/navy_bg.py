# Unify the background of a 3D render to one clean navy (#0D2349): find the dark blue background
# (soft mask) and shift its smooth colour field to the target navy, keeping every local detail. Objects and warm lights are left untouched.
# usage: python3 navy_bg.py in.jpg out.png   |   python3 navy_bg.py in.mp4 out.mp4
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

T = np.array([13, 35, 73], float)  # #0D2349
TL = T @ [.299, .587, .114]

def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def field(a, k=1.0):
    """mask m and offset D for one RGB frame (float array); k scales the blur sizes (1.0 = 1376 px wide)."""
    G = lambda x, sg: ndimage.gaussian_filter(x, sg * k)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    L = a @ [.299, .587, .114]
    blue = ss(14, 28, b - r) * ss(-6, 4, b - g)   # real navy only; the navy-black hair (b-r ~15) is kept
    dark = 1 - ss(70, 110, L)
    black = 1 - ss(10, 24, a.max(2))           # crushed vignette corners
    m0 = ndimage.grey_opening(np.maximum(blue * dark, black), size=(5, 5))
    m = G(m0, 4)
    # objects = regions closed by hard edges (filled); everything dim outside them is backdrop, including
    # warm light pools and lamp halos, which then sit on the new navy as added light instead of patches.
    gy, gx = np.gradient(G(L, 1.0))
    edge = ndimage.binary_dilation(np.hypot(gx, gy) > 5 / k, iterations=2)
    e2 = edge.copy(); e2[-1] = True                  # close figures cut off by the bottom frame edge
    obj = ndimage.binary_fill_holes(e2); obj[-1] = edge[-1]
    obj = ndimage.binary_opening(obj, iterations=2) | edge
    free = 1 - G(obj.astype(float), 2)
    m = np.maximum(m, np.clip(free * 1.4 - .2, 0, 1) * (1 - ss(70, 150, L)))
    # smooth colour field of the backdrop (vignette, gradients); a smooth offset moves it to the target
    # navy, so the original fine detail (contact shadows, edges, texture) stays as it is.
    w = G(m0, 60) + 1e-4
    C = np.stack([G(a[..., i] * m0, 60) / w for i in range(3)], -1)
    # only pixels that look like the backdrop around them move fully; dim figures in dark rooms
    # (skin, hair, clothes) differ from it and keep their colour; light pools fade out gradually.
    d = np.linalg.norm(a - C, axis=-1)
    m = m * (1 - ss(28, 70, d))
    return m, T[None, None] - C

def run(src, dst):
    a = np.asarray(Image.open(src).convert("RGB")).astype(float)
    m, D = field(a, a.shape[1] / 1376)
    out = a + m[..., None] * D
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst)

def run_video(src, dst):
    """same per frame, computed at 960 px and upsampled; the offset field is smoothed over time."""
    import subprocess
    W, H = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
        "stream=width,height", "-of", "csv=p=0", src]).decode().strip().split(","))
    rd = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    wr = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30",
        "-i", "-", "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    sw, sh = 960, round(960 * H / W)
    Dp = None; mp = None
    while True:
        buf = rd.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        a = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(float)
        sm = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((sw, sh), Image.BILINEAR)).astype(float)
        m, D = field(sm, sw / 1376)
        Dp = D if Dp is None else Dp * .7 + D * .3
        mp = m if mp is None else mp * .5 + m * .5
        up = lambda x: ndimage.zoom(x, (H / sh, W / sw) + ((1,) if x.ndim == 3 else ()), order=1)
        out = a + up(mp)[..., None] * up(Dp)
        wr.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    wr.stdin.close(); wr.wait(); rd.wait()

if __name__ == "__main__":
    (run_video if sys.argv[1].endswith(".mp4") else run)(sys.argv[1], sys.argv[2])
