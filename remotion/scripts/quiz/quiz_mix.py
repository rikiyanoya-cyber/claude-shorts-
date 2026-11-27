# 難読地名 Shorts audio (2026-11-27): owner narration (4 lines) + light BGM ducked under the voice + synthesized
# Japanese-flavoured SFX: swish on each card, taiko "don" when the place name appears, wooden clock tick-tock each second,
# a rin bell at time-up, a bright pluck chord when a red box pops. Levels are dB relative to the voice.
# usage: python3 quiz_mix.py <events.json> <voice.mp3> <bgm.wav> out.wav [jingle.mp3]   (jingle: owner's quiz-question sound, opening only)   (then loudness to -14 LUFS / -1.5 dBTP)
# loudness: acompressor=threshold=-24dB:ratio=4:attack=3:release=120, then gain to -14 LUFS and alimiter 0.80 at 192 kHz (plain loudnorm lands at -16: the taiko/bell peaks)
import sys, json, subprocess, numpy as np, soundfile as sf
EV, VOICE, BGM, OUT = sys.argv[1:5]; SR = 48000
E = json.load(open(EV)); N = int(E["end"] * SR); t = np.arange(N) / SR
ld = lambda p: np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(float)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))
rng = np.random.default_rng(9)
voice = np.zeros(N); fx = np.zeros(N)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * g
# ---- narration: the 4 lines cut from the owner's take at its pauses
v = ld(VOICE); VR = rms(v)
LINES = {"A": (0.0, 1.75), "B": (2.1, 3.45), "C": (3.9, 5.25), "D": (5.6, 7.39)}
for key, (a, b) in LINES.items():
    seg = v[int(a * SR):int(b * SR)].copy(); f = int(.02 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    put(voice, seg, E["voice"][key] - .03)
def at(x, db): return x * 10 ** (db / 20) * VR / rms(x)
tt = lambda d: np.arange(int(d * SR)) / SR
# ---- synthesized SFX
def taiko():
    s = tt(.7); f = 58 + 70 * np.exp(-s * 18); body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s * 6)
    hit = rng.standard_normal(len(s)) * np.exp(-s * 60); hit = np.convolve(hit, np.ones(12) / 12, "same")
    return body + .5 * hit
def wood(fr, d=.09):
    s = tt(d); return (np.sin(2 * np.pi * fr * s) + .4 * np.sin(2 * np.pi * fr * 2.7 * s)) * np.exp(-s * 70)
def rin():
    s = tt(2.6); return sum(a * np.sin(2 * np.pi * 1320 * m * s) * np.exp(-s * dk) for m, a, dk in ((1, 1, 1.6), (2.76, .5, 2.5), (5.4, .25, 4), (8.9, .1, 6)))
def swish():
    n = rng.standard_normal(int(.35 * SR)); n = n - np.convolve(n, np.ones(6) / 6, "same"); s = tt(.35)
    return n * np.sin(np.pi * s / .35) ** 2
def pluck_chord():
    s = tt(1.2); out = 0
    for k, m in enumerate((72, 76, 79, 84)):
        fr = 440 * 2 ** ((m - 69) / 12); out = out + np.roll(np.sin(2 * np.pi * fr * s) * np.exp(-s * 5) + .3 * np.sin(4 * np.pi * fr * s) * np.exp(-s * 9), int(k * .018 * SR))
    return out
for q in E["seal"]: put(fx, at(swish(), -22), q)
for q in E["reveal"]: put(fx, at(taiko(), -10), q)
for j, q in enumerate(E["ticks"]):
    tn = E.get("tn", 6); last3 = (j % tn) >= tn - 3
    put(fx, at(wood(2300 if j % 2 == 0 else 1700), -13 if last3 else -17), q)
for q in E["timeup"]: put(fx, at(rin(), -13), q)
for q in E["boxes"]: put(fx, at(pluck_chord(), -12), q)
if len(sys.argv) > 5 and "jingle" in E: put(fx, at(ld(sys.argv[5]), -3), E["jingle"])
# ---- BGM: ~19 dB under the voice, ducked a further 6 dB while someone speaks
bg = ld(BGM)[:N]; bg = np.pad(bg, (0, N - len(bg))); bg[:int(.6 * SR)] = 0; bg[int(.6 * SR):int(1.2 * SR)] *= np.linspace(0, 1, int(.6 * SR))   # BGM comes in after the jingle
env = np.convolve((np.abs(voice) > 1e-3).astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), "same").clip(0, 1)
mus = at(bg, -19) * (1 - .5 * env)
mix = voice + fx + mus; mix *= np.clip((E["end"] - t) / .4, 0, 1)
sf.write(OUT, np.stack([mix, mix], 1) / max(1, np.abs(mix).max() / .95), SR); print("ok")
