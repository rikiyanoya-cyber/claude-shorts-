# Born in Norway audio: narration + the series roulette ticks/ding + a few pop SFX on the cards; -14 LUFS / -1.5 dBTP after.
# usage: python3 mix_norway.py <norway work dir> <sfx dir> out.wav
import sys, json, random, subprocess, numpy as np, soundfile as sf
W, SFX, OUT = sys.argv[1:4]; SR = 48000; random.seed(3)
ld = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean())
nar = ld(f'{W}/in/born_in_norway_narration.wav'); N = int(105.0 * SR); nar = np.pad(nar, ((0, max(0, N - len(nar))), (0, 0)))[:N]; vr = rms(nar)
fx = np.zeros((N, 2), np.float32)
def put(x, t, db, pitch=True):
    if pitch:
        r = 1 + random.uniform(-.04, .04); idx = np.arange(0, len(x) - 1, r)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(x))
# roulette: ticks as the globe turns, ding on the stop (same every episode)
T = json.load(open(f'{W}/spin/ticks.json')); tick = ld(f'{W}/sfx/tick.wav'); ding = ld(f'{W}/sfx/ding.wav')
for t in T['ticks']: put(tick, t, -20, False)
put(ding, T['stop'], -12, False)
# 2026-11-25 research: 10-20 sounds, 4-5 s apart, only on information events. The owner made the sounds (anime-like,
# a little mechanical) and asked for nothing harsh, so everything sits low: light -18..-20 dB, the stamp -16.
EV = [(6.45, 'pop', -18), (24.7, 'pop', -19), (30.8, 'run', -17), (49.9, 'pop', -19), (61.45, 'stamp', -16), (71.9, 'stamp', -16),
      (80.4, 'pop', -17), (18.6, 'coins', -19), (94.6, 'coins', -19)]
AGEUP = [34.2, 39.7, 53.5, 82.4]   # the age badge steps up (same chime every time)
# number counters: soft counter clicks along the same ease-out curve the number uses on screen (start, length)
COUNTS = [(16.6, 2.0), (46.3, 1.5), (58.7, 1.2), (92.6, 2.0)]
for t, n, db in EV: put(ld(f'{W}/sfx/{n}.wav'), t, db)
ck = ld(f'{W}/sfx/count.wav')
for a0, d in COUNTS:
    for k in range(1, 23):
        p = k / 23; put(ck, a0 + d * (1 - (1 - p) ** (1 / 3)), -21, False)
up = ld(f'{W}/sfx/ageup.wav')
for t in AGEUP: put(up, t, -15, False)
mix = nar + fx
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('ok')
