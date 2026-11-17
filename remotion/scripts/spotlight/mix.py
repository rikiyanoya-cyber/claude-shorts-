# THE SPOTLIGHT EFFECT audio: narration (cut 1 s after the last line) + closing voice + soft symbolic effects
# + one BGM looped with 4 s crossfades at a steady -20 dB under the voice (2 s in, 3 s out).
# usage: python3 mix.py <narration> <closing voice> <bgm> <sfx dir (fam1 set + bubble.wav)> <out wav>
# Times mirror SpotEpisode.tsx (OUT0 = last line end + 1.0, TV_OFF = OUT0 + 9.8 + 0.45, end = TV_OFF + 2.5).
import sys, json, subprocess, numpy as np, soundfile as sf
NAR, OUTRO, BGM, SFX, OUT = sys.argv[1:6]; SR = 48000
S = {i: (a, b) for i, a, b, _ in json.load(open('/home/user/claude-shorts-/remotion/src/companies/spot_sentences.json'))}
at = lambda i: S[i][0]
OUT0 = S[142][1] + 1.0; TV_OFF = OUT0 + 9.8 + .45; END = TV_OFF + 2.5; N = int(END * SR)
load = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
voice = np.zeros((N, 2), np.float32); nv = load(NAR)[:int(OUT0 * SR)]; voice[:len(nv)] = nv
ov = load(OUTRO); i0 = int(OUT0 * SR); voice[i0:i0 + len(ov)] = ov[:N - i0]
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean()); vr = rms(nv)
C = []
for t in (30.3, at(26) - .35, at(45) - .35, at(58) - .35, at(81) - .35, at(99) - .35, at(118) - .35, at(121) - .3): C.append((t, 'whoosh', -22, .6))
for t in (14.95, 72.2, 153.3, 228.2, 300.5, 335.6, 411.4, 431.4): C.append((t, 'chime', -19, 1.6))      # a spotlight key word lights up
for t in (at(86) + .6, 327.9, 368.7, 375.4): C.append((t, 'count', -20, 1.2))                          # stand-alone numbers
# graphs (2026-11-17 review, saved sounds only): the count-up sound when a bar grows,
# a soft whoosh when a bar shrinks or a row drops, ticks while a meter needle or slider moves
for t in (57.85, 64.6, 92.2, at(37) + .8, at(37) + 2.2, at(51), 168.5, 347.4, 355.2,
          at(110) + 2, at(111) + .5, at(120) + .5, at(120) + 3.1): C.append((t, 'count', -20, 1.2))
for t in (96.7, 169.0, 140.6): C.append((t, 'whoosh', -21, .6))                                            # 48% -> 8%, the guess adjusting, slip-up #2 -> #3
for a0 in (228.4, at(90) + .1):
    for k in range(4): C.append((a0 + k * .2, 'tick', -21, .3))
C.append((134.5, 'pop', -20, .4))
# speech bubbles (2026-11-17): the tiny chime the user made ('bubble.wav'); bubbles in a row get quieter
for t, db in ((at(18), -18), (at(28), -18), (at(36), -18), (at(36) + 1.2, -20), (at(39) + 3, -18), (190.6, -18), (191.6, -20), (193.6, -21), (194.8, -22),
              (at(62), -18), (at(76), -18), (at(139) + 2.5, -19), (at(139) + 3, -21), (at(139) + 3.5, -22)): C.append((t, 'bubble', db, 1.0))                                                                           # the slip-up row lights on the board
for t in (70.2, 179.9, 241.9, 247.4): C.append((t, 'count', -22, .8))                                       # figures light up
for a in (8.5, at(107)):
    for k in range(5): C.append((a + k * .28, 'tick', -21, .35))
C.append((at(89) + .3, 'notify', -19, 1.1))
C.append((153.7, 'thud', -18, 1.4))                                                                         # the meter hits the top
C.append((TV_OFF, 'tvoff', -8, 1.2))
cache = {}; fx = np.zeros((N, 2), np.float32)
SFX_BOOST = 4.0   # 2026-11-17 review: effects 4 dB louder (the TV switch-off stays as it was)
for t, n, db, mx in C:
    db += 0 if n == 'tvoff' else SFX_BOOST
    if n not in cache: cache[n] = load(f'{SFX}/{n}.wav')
    x = cache[n][:int(mx * SR)].copy(); fo = min(len(x) // 3, int(.15 * SR)); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(cache[n]))
b = load(BGM); X = 4 * SR; loop = b.copy()
while len(loop) < N:
    r = np.linspace(0, 1, X)[:, None]; loop = np.concatenate([loop[:-X], loop[-X:] * (1 - r) + b[:X] * r, b[X:]])
g = np.full(N, 10 ** (-20 / 20) * vr / rms(b)); tt = np.arange(N) / SR
g *= np.clip(tt / 2, 0, 1) * np.clip((END - tt) / 3, 0, 1)
mix = voice + fx + loop[:N] * g[:, None]
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('cues', len(C), 'end', round(END, 3))
