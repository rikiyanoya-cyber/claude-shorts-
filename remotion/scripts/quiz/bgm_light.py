# Light quiz BGM, synthesized (2026-11-27, provisional until the owner picks one): soft marimba-like pentatonic
# melody + plucked bass + warm pad, 100 BPM, gentle and unobtrusive. usage: python3 bgm_light.py seconds out.wav
import sys, numpy as np, soundfile as sf
T, OUT = float(sys.argv[1]), sys.argv[2]; SR = 48000; N = int(T * SR); t = np.arange(N) / SR
out = np.zeros((N, 2)); bpm = 100; b = 60 / bpm; rng = np.random.default_rng(4)
def note(f, d, dec, harm=(1, .25, .08), g=1.0, pan=0.0):
    tt = np.arange(int(d * SR)) / SR; e = np.exp(-tt * dec) * np.clip(tt / .004, 0, 1)
    x = sum(a * np.sin(2 * np.pi * f * (k * 3 + 1 if k else 1) * tt) for k, a in enumerate(harm)) * e * g
    return np.stack([x * (1 - pan) , x * (1 + pan)], 1) * .5
def put(x, t0):
    i = int(t0 * SR); j = min(N, i + len(x))
    if i < N: out[i:j] += x[:j - i]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
scale = [60, 62, 64, 67, 69, 72, 74, 76]            # C major pentatonic
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]   # C Am F G
mel = [4, 3, 2, 3, 4, 4, 5, -1, 3, 2, 1, 2, 3, -1, 2, 1, 0, 1, 2, 4, 3, -1, 2, -1, 1, 2, 3, 2, 1, 0, -1, -1]
bars = int(T / (4 * b)) + 1
for bar in range(bars):
    root, ch = prog[bar % 4]; t0 = bar * 4 * b
    put(note(hz(root), 4 * b, 2.2, (1, .3), .55), t0); put(note(hz(root + 7), 2 * b, 3, (1, .2), .25), t0 + 2 * b)
    for k in range(4):   # soft off-beat chord taps
        for m in ch: put(note(hz(m), .5, 9, (1, .15), .07, pan=-.3), t0 + k * b + b / 2)
    for k in range(8):   # melody in eighths
        idx = mel[(bar * 8 + k) % len(mel)]
        if idx >= 0: put(note(hz(scale[idx] + 12), .9, 6, (1, .35, .1), .32, pan=.25), t0 + k * b / 2)
pad = sum(np.sin(2 * np.pi * hz(m) * t + rng.uniform(0, 6)) for m in (48, 55, 64)) * .03
out += pad[:, None]
out *= (np.clip(t / .6, 0, 1) * np.clip((T - t) / 1.8, 0, 1))[:, None]
sf.write(OUT, out / np.abs(out).max() * .8, SR); print("ok")
