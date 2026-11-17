# soft symbolic graph sounds: 'rise' (a bar grows: rising glassy sweep with little ticks) and 'fall' (a bar shrinks)
# usage: python3 graph_sfx.py <out dir>
import sys, numpy as np, soundfile as sf
SR = 48000
def sweep(f0, f1, dur, ticks=7):
    t = np.arange(int(dur * SR)) / SR; k = t / dur
    f = f0 * (f1 / f0) ** k; ph = 2 * np.pi * np.cumsum(f) / SR
    tone = .6 * np.sin(ph) + .25 * np.sin(2 * ph) + .1 * np.sin(3 * ph + .5)
    env = np.minimum(1, t / .03) * (1 - k) ** 1.6 * .9 + .1 * np.exp(-t * 6)
    out = tone * env
    for i in range(ticks):                       # little marimba-like ticks riding the sweep
        t0 = i * dur * .75 / ticks; n = int(.09 * SR); tt = np.arange(n) / SR; ff = f0 * (f1 / f0) ** (t0 / dur) * 2
        j = int(t0 * SR); out[j:j + n] += .35 * np.sin(2 * np.pi * ff * tt) * np.exp(-tt * 45)
    out = np.convolve(out, np.ones(24) / 24, mode='same')
    return np.stack([out, out], 1) / np.abs(out).max() * .7
sf.write(sys.argv[1] + '/rise.wav', sweep(330, 880, .9), SR)
sf.write(sys.argv[1] + '/fall.wav', sweep(880, 300, .9, 5), SR)
