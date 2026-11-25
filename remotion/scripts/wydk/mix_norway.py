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
for t in T['ticks']: put(tick, t, -16, False)
put(ding, T['stop'], -8, False)
EV = [(6.45, 'pop', -16), (16.6, 'coins', -14), (19.4, 'sparkle', -17), (27.1, 'pop', -16), (30.8, 'xylo', -16), (34.2, 'pop', -17),
      (37.1, 'sparkle', -17), (39.7, 'party', -14), (46.3, 'coins', -14), (49.9, 'pop', -16), (53.5, 'pop', -17), (59.0, 'swish', -17),
      (61.4, 'boing', -14), (63.8, 'pop', -17), (69.6, 'sparkle', -17), (71.85, 'freeze', -13), (76.2, 'pop', -17), (80.4, 'heart', -15),
      (82.4, 'pop', -17), (85.4, 'coins', -15), (91.15, 'sparkle', -16), (92.6, 'coins', -15), (101.95, 'pop', -16)]
for t, n, db in EV: put(ld(f'{SFX}/{n}.wav'), t, db)
mix = nar + fx
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('ok')
