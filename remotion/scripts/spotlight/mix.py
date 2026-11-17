# narration + one BGM looped (4 s crossfades) at a steady -20 dB under the voice; 2 s fade-in, 3 s fade-out.
# usage: python3 mix.py <narration> <bgm> <out wav> <total seconds>
import sys, subprocess, numpy as np, soundfile as sf
SR = 48000
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
v, b = load(sys.argv[1]), load(sys.argv[2]); N = int(float(sys.argv[4]) * SR)
v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]
X = 4 * SR; out = b.copy()
while len(out) < N:
    r = np.linspace(0, 1, X)[:, None]
    out = np.concatenate([out[:-X], out[-X:] * (1 - r) + b[:X] * r, b[X:]])
out = out[:N]
rms = lambda x: np.sqrt(np.mean(x[np.abs(x).max(1) > 1e-4] ** 2))
g = np.full(N, 10 ** (-20 / 20) * rms(v) / rms(out))
g[:2 * SR] *= np.linspace(0, 1, 2 * SR); g[-3 * SR:] *= np.linspace(1, 0, 3 * SR)
sf.write(sys.argv[3], v + out * g[:, None], SR)
