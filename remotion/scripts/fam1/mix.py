# Effects for 家族心理学アニメ 第1本: soft symbolic sounds on the shot list's events, 16-24 dB under the voice.
# usage: python3 mix.py <narration wav (with the 1 s pause)> <sfx dir> <out wav>   (sfx dir: tick rain pop typing count thud whoosh chime knock notify .wav)
# 2026-11-16 review: far fewer pops (only the three items of the 'common points' list); quiet beats get no sound.
import sys, json, re, subprocess, numpy as np, soundfile as sf
NAR, SFX, OUT = sys.argv[1:4]; SR = 48000
HERE = '/home/user/claude-shorts-/remotion/src/companies/'
S = {i: (a, b) for i, a, b, _ in json.load(open(HERE + 'fam1_sentences.json'))}
at = lambda i: S[i][0]
shots = [int(a) for a, b in re.findall(r'\{ from: (\d+), to: (\d+),', open(HERE + 'Fam1Episode.tsx', encoding='utf-8').read())]
load = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
voice = load(NAR); N = len(voice) + 3 * SR; voice = np.concatenate([voice, np.zeros((3 * SR, 2), np.float32)])
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean()); vr = rms(voice)
C = []
QUIET = set([51, 54, 60, 61, 62]) | set(range(104, 114))
for a in shots:
    if a not in QUIET and a != 1: C.append((at(a) - .05, 'whoosh', -22, .6))
for a in (15, 24, 48, 55, 67):
    for k in range(5): C.append((at(a) + .2 + k * .28, 'tick', -21, .35))
for t in (at(1) + 1.4, at(2) + .3, at(6) + 1.2, at(42) + .3, at(53) + .1, at(72) + .2, at(87) + .2): C.append((t, 'count', -20, 1.6))
for t in (at(44) + .1, at(45) + .1, at(46) + .1): C.append((t, 'pop', -21, .4))
for t in (at(29) + .3, at(37) + .3, at(96) + .3, at(96) + 1.6, at(99) + .2): C.append((t, 'notify', -19, 1.1))
C.append((at(31) + .1, 'typing', -20, 1.2)); C.append((at(32) + .4, 'typing', -21, .9))
C.append((at(56) + .15, 'knock', -16, 1.0))
for t in (at(77), at(79), at(75) + .2): C.append((t, 'thud', -17, 1.6))
for t in (at(14) + .8, at(86)): C.append((t, 'chime', -19, 1.6))
cache = {}; fx = np.zeros((N, 2), np.float32)
def put(x, t, g):
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: fx[i:j] += x[:j - i] * g
for t, n, db, mx in C:
    if n not in cache: cache[n] = load(f'{SFX}/{n}.wav')
    x = cache[n][:int(mx * SR)].copy(); fo = min(len(x) // 3, int(.15 * SR)); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    put(x, t, 10 ** (db / 20) * vr / rms(cache[n]))
rain = load(f'{SFX}/rain.wav')
def bed(a, b, db):
    n = int((b - a) * SR); r = np.concatenate([rain] * (n // len(rain) + 2))[:n].copy(); f = int(.8 * SR)
    r[:f] *= np.linspace(0, 1, f)[:, None]; r[-f:] *= np.linspace(1, 0, f)[:, None]; put(r, a, 10 ** (db / 20) * vr / rms(rain))
bed(at(26) - .2, at(28) + .3, -24); bed(at(40) - .2, at(41) + .2, -24)
mix = voice + fx
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('cues', len(C))
