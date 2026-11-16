# Insert the 1 s pause before line 110 ("今日のお話はこれで以上です。") at the quietest 20 ms before it.
# usage: python3 pause.py <video1-narration-joined.mp3> <out wav>   (the sentence json already carries the +1 s shift)
import sys, subprocess, numpy as np, soundfile as sf
SR = 48000; CUT = 477.739
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
p = int(CUT * SR); f = int(.005 * SR); x = a[:p].copy(); x[-f:] *= np.linspace(1, 0, f); y = a[p:].copy(); y[:f] *= np.linspace(0, 1, f)
sf.write(sys.argv[2], np.concatenate([x, np.zeros(SR, np.float32), y]), SR)
