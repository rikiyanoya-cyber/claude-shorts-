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
bed(f'{SSFX}/rain.wav', 5.3, 19.7, -23)                        # the street before you get in
bed(S('road_a'), 19.7, END, -25, 1.0, 1.5)   # 2026-11-18: was too loud at -19                     # inside the taxi from here on
bed(S('heart'), 55.5, END, -15, 1.5, 1.0)                      # from the photo to the end
# hits
put(load(S('impact'))[: int(1.8 * SR)], 0.0, -16)   # 2026-11-18: the opening was too loud
put(load(S('lock')), 0.12, -11)                                 # hook: the doors lock
put(load(S('lock')), word(23, 'Click.') - .02, -3)             # "Click." the doors lock
put(load(S('door')), 20.25, -12)                               # you get in
put(load(f'{SSFX}/notify.wav')[: int(1.0 * SR)], 10.85, -16)    # driver found
put(load(S('blinker')), 32.3, -12)                             # right turn
put(load(S('brake')), 67.3, -9)                                # he starts to slow down
for k in range(11): put(load(f'{SSFX}/tick.wav')[: int(.3 * SR)], 66.55 + k, -17)   # the red-light countdown
# BGM 'Back Seat Unresolved' (user, 2026-11-18): used from 28 s in. From there the track runs out at about 62 s of video,
# so two more passes of its own middle are joined with 1.5 s crossfades; the second pass puts the track's hit (80 s) on "Click."
BGM = f'{WSFX}/bgm2.mp3'
import os
if os.path.exists(BGM):
    b = load(BGM); click = word(23, 'Click.')
    segs = [(0.0, 54.5, 28.0), (54.5, 64.9, 80.0 - (click - 54.5)), (64.9, END, 67.0)]   # (video from, video to, track from)
    out = np.zeros((N, 2), np.float32); X = int(1.5 * SR)
    for k, (v0, v1, t0) in enumerate(segs):
        i0 = int(v0 * SR); n = int((v1 - v0) * SR) + (X if k < len(segs) - 1 else 0); seg = b[int(t0 * SR): int(t0 * SR) + n].copy()
        if k > 0: seg[:X] *= np.linspace(0, 1, X)[:, None]
        if k < len(segs) - 1: seg[-X:] *= np.linspace(1, 0, X)[:, None]
        j0 = min(N, i0 + len(seg)); out[i0:j0] += seg[:j0 - i0]
    g = np.full(N, 10 ** (-12 / 20) * vr / rms(b[int(28 * SR):])); tt = np.arange(N) / SR
    g *= np.clip(tt / .8, 0, 1) * np.clip((END - tt) / .8, 0, 1); fx += out * g[:, None]
VOICE_DB = -8.0   # 2026-11-18 review: the narration sat too far on top (-4, then -8); everything else stays where it was
mix = voice * 10 ** (VOICE_DB / 20) + fx
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('end', END)
