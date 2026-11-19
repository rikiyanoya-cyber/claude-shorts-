# IA ep2 final audio (follows the 2026-11-19 guides):
# - narration: the new opening + the old narration with line 6 cut (11.333-14.667 s) and pauses inserted before key lines
# - pop sound effects, ~2-3 a minute, only on real events; each use slightly re-pitched (+-4 %) so no file repeats exactly
# - one BGM bed at a fixed 26 dB under the voice (no ducking), dipped only around the key-line pauses; -14 LUFS / -1 dBTP after
# usage: python3 mix_ep2_full.py <work dir> <out wav>
import sys, json, subprocess, random, numpy as np, soundfile as sf
W, OUT = sys.argv[1], sys.argv[2]; SR = 48000; random.seed(2)
GAPS = [(236.7, .7), (238.7, 1.0), (357.9, .8), (480.0, .7)]
OPEN, CUT0, CUT1, END_ORIG = 9.3, 11.3333, 14.6667, 511.0 + sum(d for _, d in GAPS)
ld = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean())
shift = lambda x: x + sum(d for g, d in GAPS if x > g)
vt = lambda orig: OPEN + (shift(orig) if orig < CUT0 else shift(orig) - (CUT1 - CUT0))   # narration clock -> final video
# narration with the pauses
nar = ld(f'{W}/dl/ia_ep2_narration_full.mp3'); vr = rms(nar); parts = []; p = 0
for g, d in GAPS: parts += [nar[int(p * SR):int(g * SR)], np.zeros((int(d * SR), 2), np.float32)]; p = g
parts.append(nar[int(p * SR):]); ng = np.concatenate(parts)
ng = np.pad(ng, ((0, max(0, int(END_ORIG * SR) - len(ng))), (0, 0)))[:int(END_ORIG * SR)]
op = ld(f'{W}/up/new1.mp3')[:int(8.75 * SR)]; op *= vr / rms(op)
intro = np.zeros((int(OPEN * SR), 2), np.float32); intro[:len(op)] = op
X = int(.015 * SR); a = ng[:int(CUT0 * SR)].copy(); b = ng[int(CUT1 * SR):].copy(); a[-X:] *= np.linspace(1, 0, X)[:, None]; b[:X] *= np.linspace(0, 1, X)[:, None]
voice = np.concatenate([intro, a, b]); N = len(voice)
fx = np.zeros((N, 2), np.float32)
def put(name, t, db):
    x = ld(f'{W}/sfx/{name}.wav'); r = 1 + random.uniform(-.04, .04)
    idx = np.arange(0, len(x) - 1, r); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
    f = min(len(x) // 3, int(.08 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(x))
# opening (already on the final clock)
put('alarm', .05, -12); put('boing', 6.45, -12)
# events on the narration clock: (time, sound, dB under the voice)
EV = [(3.2, 'coins', -13), (30.15, 'wahwah', -13), (51.1, 'sparkle', -14), (68.5, 'coins', -13), (69.85, 'pop', -15),
      (90.9, 'sigh', -14), (95.2, 'xylo', -15), (100.7, 'party', -13), (129.9, 'boing', -12), (144.55, 'swish', -19),
      (148.9, 'coins', -14), (167.5, 'sigh', -13), (177.5, 'sparkle', -15), (194.9, 'xylo', -15), (213.5, 'boing', -12),
      (222.4, 'pop', -14), (237.4, 'freeze', -12), (245.1, 'heart', -14), (264.5, 'coins', -13), (275.7, 'pop', -15),
      (300.1, 'xylo', -15), (313.1, 'boing', -12), (325.3, 'sad', -14), (353.9, 'sigh', -14), (362.3, 'xylo', -15),
      (384.6, 'boing', -12), (433.8, 'sparkle', -16), (438.3, 'xylo', -15), (451.4, 'boing', -12), (480.75, 'freeze', -12), (509.0, 'tvoff', -10)]
TVOFF = 509.0   # the picture switches off here (IA2_TVOFF): BGM cuts with it, silence after
for t, n, db in EV: put(n, vt(t), db)
# BGM: fixed 26 dB under the voice, looped with 4 s crossfades, dipped 10 dB around the key-line pauses
bg = ld(f'{W}/bgm.mp3'); Y = 4 * SR
# drop the track's own fade-out (last second still within 6 dB of the median level) so the loop seam has no dip
lv = np.array([rms(bg[i:i + SR]) for i in range(0, len(bg) - SR, SR)]); keep = np.where(lv > np.median(lv) * .5)[0][-1] + 1
bg = bg[:keep * SR]; loop = bg.copy()
while len(loop) < N: r_ = np.linspace(0, 1, Y)[:, None]; loop = np.concatenate([loop[:-Y], loop[-Y:] * (1 - r_) + bg[:Y] * r_, bg[Y:]])
g = np.full(N, 10 ** (-26 / 20) * vr / rms(bg)); tt = np.arange(N) / SR
for gg, d in GAPS:
    s0, s1 = vt(gg) - .4, vt(gg) + d + .3
    g *= 1 - (1 - 10 ** (-10 / 20)) * np.clip(np.minimum((tt - s0) / .3, (s1 - tt) / .3), 0, 1)
g *= np.clip(tt / 2, 0, 1) * np.clip((vt(TVOFF) + .05 - tt) / .08, 0, 1)
mix = voice + fx + loop[:N] * g[:, None]
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('len', N / SR)
