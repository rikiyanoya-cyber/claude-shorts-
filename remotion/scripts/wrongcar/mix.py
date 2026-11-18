# WRONG CAR ep1 audio: narration + the user's ElevenLabs effects (+ saved rain / tick / notify), -14 LUFS after.
# usage: python3 mix.py <narration> <wc sfx dir> <saved sfx dir> <out wav>
# times follow WrongCar.tsx (cuts and word times in wc_words.json); the Pollo clips are used without sound.
import sys, json, subprocess, numpy as np, soundfile as sf
NAR, WSFX, SSFX, OUT = sys.argv[1:5]; SR = 48000
W = json.load(open('/home/user/claude-shorts-/remotion/src/companies/wc_words.json'))
first = lambda line: next(t for l, w, t in W if l == line)
word = lambda line, ww: next(t for l, w, t in W if l == line and w == ww)
END = 75.47 + 2.0; N = int(END * SR)
load = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
voice = np.zeros((N, 2), np.float32); v = load(NAR); voice[:len(v)] = v[:N]
loadq = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', 'highpass=f=70,equalizer=f=250:t=q:w=1.2:g=6,equalizer=f=1200:t=q:w=1:g=4', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean()); vr = rms(v)
fx = np.zeros((N, 2), np.float32)
HIT_BOOST, BED_BOOST = 7.0, 10.0   # 2026-11-18 review: effects were not heard at all, all louder
def put(x, t, db, fade_in=0.0, fade_out=.08, boost=None):
    db += HIT_BOOST if boost is None else boost
    x = x.copy(); n = len(x)
    if fade_in: f = min(n, int(fade_in * SR)); x[:f] *= np.linspace(0, 1, f)[:, None]
    f = min(n // 3, int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); j = min(N, i + n)
    if i < N: fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / max(rms(x), 1e-6))
def bed(name, a, b, db, fi=.8, fo=.8):
    x = loadq(name); n = int((b - a) * SR); x = np.concatenate([x] * (n // len(x) + 2))[:n]; put(x, a, db, fi, fo, BED_BOOST)
S = lambda n: f'{WSFX}/{n}.mp3'
# beds
bed(f'{SSFX}/rain.wav', 5.3, 19.7, -27)                        # the street before you get in
bed(S('road_a'), 19.7, END, -24, 1.0, 1.5)                     # inside the taxi from here on
bed(S('heart'), 55.5, END, -15, 1.5, 1.0)                      # from the photo to the end
# hits
put(load(S('impact'))[: int(1.8 * SR)], 0.0, -9)
put(load(S('lock')), 0.12, -5)                                 # hook: the doors lock
put(load(S('lock')), word(23, 'Click.') - .02, -3)             # "Click." the doors lock
put(load(S('door')), 20.25, -12)                               # you get in
put(load(f'{SSFX}/notify.wav')[: int(1.0 * SR)], 10.85, -16)    # driver found
put(load(S('blinker')), 32.3, -12)                             # right turn
put(load(S('brake')), 67.3, -9)                                # he starts to slow down
for k in range(11): put(load(f'{SSFX}/tick.wav')[: int(.3 * SR)], 66.55 + k, -17)   # the red-light countdown
mix = voice + fx
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('end', END)
