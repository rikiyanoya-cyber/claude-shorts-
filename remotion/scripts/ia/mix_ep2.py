# IA ep2 audio: narration + a few soft effects (1-3 a minute, only on real events), no ducking, -14 LUFS after.
# usage: python3 mix_ep2.py <narration> <sfx dir> <out wav> <end seconds> [bgm]
import sys, json, subprocess, numpy as np, soundfile as sf
NAR, SFX, OUT, END = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]); BGM = sys.argv[5] if len(sys.argv) > 5 else None
SR = 48000; N = int(END * SR)
S = {i: a for i, a, b, _ in json.load(open('/home/user/claude-shorts-/remotion/src/companies/ia2_sentences.json'))}
load = lambda p: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
v = load(NAR)[:N]; voice = np.zeros((N, 2), np.float32); voice[:len(v)] = v
rms = lambda x: np.sqrt((x[np.abs(x).max(1) > 1e-4] ** 2).mean()); vr = rms(v)
fx = np.zeros((N, 2), np.float32)
def put(name, t, db, mx=1.2):
    x = load(f'{SFX}/{name}.wav' if not name.endswith('.mp3') else f'{SFX}/{name}')[:int(mx * SR)]; f = min(len(x) // 3, int(.12 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * (10 ** (db / 20) * vr / rms(x))
# events (first half): numbers land, the dream, the drip, the raise, the fade, the alarm, the lottery
put('count', S[2] + .1, -14)                      # $75,000
put('chime', S[5] + .05, -16)                     # only half true
put('tick', S[14] + .4, -15, .35); put('tick', S[14] + 1.6, -17, .35)   # the dripping faucet
put('chime', S[18] + .05, -16)                    # x3
put('count', S[23] + .1, -15)                     # the first raise (coins)
put('whoosh', S[26] - .1, -20, .6)                # the feeling faded
put('notify', S[28] + .3, -15, 1.0)               # the alarm
put('chime', S[31] + .3, -14)                     # the lottery
put('whoosh', 144.0, -22, .6)                     # chapter turn to the coworker
mix = voice + fx
if BGM:
    b = load(BGM); b = np.concatenate([b] * (N // len(b) + 1))[:N]; g = 10 ** (-26 / 20) * vr / rms(b)
    tt = np.arange(N) / SR; mix += b * (g * np.clip(tt / 2, 0, 1) * np.clip((END - tt) / 2, 0, 1))[:, None]
sf.write(OUT, mix / max(1, np.abs(mix).max() / .95), SR); print('ok')
