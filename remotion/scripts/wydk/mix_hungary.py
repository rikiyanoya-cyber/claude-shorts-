# Hungary audio: narration + the series roulette sounds (two spins) + info-event SFX + the channel BGM after the map.
# usage: python3 mix_hungary.py <work dir> <norway sfx dir> out.wav      (then loudness to -14 LUFS / -1.5 dBTP)
import sys, json, subprocess, numpy as np, soundfile as sf
W, SFX, OUT = sys.argv[1:4]; SR = 48000; END = 140.0; N = int(END * SR)
ld = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean())
nar = ld(f'{W}/in/narration.wav'); nar = np.pad(nar, ((0, max(0, N - len(nar))), (0, 0)))[:N]; vr = rms(nar)
fx = np.zeros((N, 2), np.float32)
SFX_GAIN = 6   # 2026-11-26 owner: effects need not be that quiet; every effect +6 dB
def put(x, t, db):
    db += SFX_GAIN
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(x))
E = json.load(open(f'{W}/globe/events.json'))
tick, ding = ld(f'{SFX}/u_tick.mp3'), ld(f'{SFX}/u_ding.mp3')
for t in E['ticks']: put(tick, t, -20)
put(ding, E['stop1'], -12)
pop, stamp, coins, click, up = ld(f'{SFX}/u_pop.mp3'), ld(f'{SFX}/u_stamp.mp3'), ld(f'{SFX}/u_coins.mp3'), ld(f'{SFX}/u_click.mp3'), ld(f'{SFX}/ageup.wav')
# information events only (a number, a card, a stamp)
for t in (5.76, 12.48, 22.58, 27.42, 43.39, 56.75, 61.54, 71.34, 86.31, 99.51, 104.48, 118.12, 125.37, 132.2): put(pop, t, -18)
put(coins, 34.81, -17); put(coins, 51.75, -17); put(coins, 112.36, -17)          # loan / pay / pálinka
for t, db in ((11.32, -15), (46.07, -15), (73.51, -15), (92.43, -15), (108.52, -15), (130.69, -15)): put(stamp, t - .4, db)   # RARE FEWEST PURPOSE LATE WON PURPOSE
put(click, 37.49 - .077, -19)                                                         # loan struck out
for t in (55.59, 60.98, 67.26, 75.43, 83.11, 90.63, 96.99, 101.87, 109.32, 115.96): put(up, t, -19)   # every age step
# channel BGM: starts after the map (22.2 s), low and fixed
bg = ld('/home/user/channel_assets/WYDK_BGM_Picture_Book_Atlas.mp3'); Y = 3 * SR
lv = np.array([rms(bg[i:i + SR]) for i in range(0, len(bg) - SR, SR)]); bg = bg[:(np.where(lv > np.median(lv) * .5)[0][-1] + 1) * SR]
loop = bg.copy()
while len(loop) < N: r_ = np.linspace(0, 1, Y)[:, None]; loop = np.concatenate([loop[:-Y], loop[-Y:] * (1 - r_) + bg[:Y] * r_, bg[Y:]])
t = np.arange(N) / SR; i0 = int(12.45 * SR); g = np.zeros(N); g[i0:] = 10 ** (-23 / 20) * vr / rms(bg)
g *= np.clip((t - 12.45) / 1.5, 0, 1) * np.clip((END - t) / 2.0, 0, 1)
mus = np.zeros((N, 2), np.float32); mus[i0:] = loop[:N - i0]
mix = nar + fx + mus * g[:, None]
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('ok')
