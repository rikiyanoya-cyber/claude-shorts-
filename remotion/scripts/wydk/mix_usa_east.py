# USA East audio: narration + the series roulette sounds (two spins) + info-event SFX + the channel BGM after the map.
# usage: python3 mix_usa_east.py <work dir> <norway sfx dir> out.wav      (then loudness to -14 LUFS / -1.5 dBTP)
import sys, json, subprocess, numpy as np, soundfile as sf
W, SFX, OUT = sys.argv[1:4]; SR = 48000; END = 109.0; N = int(END * SR)
ld = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean())
nar = ld(f'{W}/in/born_in_usa_east_narration.wav'); nar = np.pad(nar, ((0, max(0, N - len(nar))), (0, 0)))[:N]; vr = rms(nar)
fx = np.zeros((N, 2), np.float32)
def put(x, t, db):
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(x))
E = json.load(open(f'{W}/globe/events.json'))
tick, ding = ld(f'{SFX}/u_tick.mp3'), ld(f'{SFX}/u_ding.mp3')
for t in E['ticks']: put(tick, t, -20)
put(ding, E['stop1'], -12); put(ding, E['stop2'], -12)
pop, stamp, coins, click, up = ld(f'{SFX}/u_pop.mp3'), ld(f'{SFX}/u_stamp.mp3'), ld(f'{SFX}/u_coins.mp3'), ld(f'{SFX}/u_click.mp3'), ld(f'{SFX}/ageup.wav')
# information events only (a number, a card, a stamp), soft
for t in (6.2, 13.9, 20.2, 26.0, 48.95, 69.6, 89.4): put(pop, t, -18)   # (no pop where an age chime already plays)
for t in (54.5, 56.9, 60.4, 61.6): put(click, t - .077, -19)       # NYC RULES checks
put(coins, 29.85, -17); put(coins, 74.1, -17)                      # $80,000 / $126,000
put(stamp, 75.6 - .4, -15); put(stamp, 88.59 - .4, -15)            # DENIED / ILLEGAL (stamp hit is 0.4 s into the file)
for t in (36.43, 43.79, 45.95, 51.47, 60.65, 62.41, 67.45, 76.9, 79.75, 83.07, 87.15): put(up, t, -19)   # every age step (soft)
# channel BGM: starts after the map (22.2 s), low and fixed
bg = ld('/home/user/channel_assets/WYDK_BGM_Picture_Book_Atlas.mp3'); Y = 3 * SR
lv = np.array([rms(bg[i:i + SR]) for i in range(0, len(bg) - SR, SR)]); bg = bg[:(np.where(lv > np.median(lv) * .5)[0][-1] + 1) * SR]
loop = bg.copy()
while len(loop) < N: r_ = np.linspace(0, 1, Y)[:, None]; loop = np.concatenate([loop[:-Y], loop[-Y:] * (1 - r_) + bg[:Y] * r_, bg[Y:]])
t = np.arange(N) / SR; i0 = int(22.2 * SR); g = np.zeros(N); g[i0:] = 10 ** (-23 / 20) * vr / rms(bg)
g *= np.clip((t - 22.2) / 1.5, 0, 1) * np.clip((END - t) / 2.0, 0, 1)
mus = np.zeros((N, 2), np.float32); mus[i0:] = loop[:N - i0]
mix = nar + fx + mus * g[:, None]
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('ok')
