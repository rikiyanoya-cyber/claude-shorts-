# word timings for a whole narration file (sherpa-onnx en zipformer), cut at silences into <=20 s chunks.
# usage: python3 words_all.py in.wav out.json   -> [[t, word], ...]  (times run ~0.1-0.2 s early)
import sys, json, numpy as np, soundfile as sf, sherpa_onnx
M = '/home/user/asr/sherpa-onnx-zipformer-en-2023-06-26/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=M + 'encoder-epoch-99-avg-1.int8.onnx', decoder=M + 'decoder-epoch-99-avg-1.onnx',
    joiner=M + 'joiner-epoch-99-avg-1.int8.onnx', tokens=M + 'tokens.txt', num_threads=4)
x, sr = sf.read(sys.argv[1], dtype='float32')
if x.ndim > 1: x = x.mean(1)
hop = int(.05 * sr); e = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])
quiet = e < max(1e-4, np.percentile(e, 20) * 2)
cuts = [0]; i = 0
while cuts[-1] + int(20 * sr / hop) < len(e):
    lo, hi = cuts[-1] + int(8 * sr / hop), cuts[-1] + int(20 * sr / hop)
    q = [k for k in range(lo, hi) if quiet[k]]; cuts.append(q[len(q) // 2] if q else hi)
cuts.append(len(e)); out = []
for a, b in zip(cuts, cuts[1:]):
    s0 = a * hop; seg = x[s0:b * hop]; st = rec.create_stream(); st.accept_waveform(sr, seg); rec.decode_stream(st); r = st.result
    cur = ''; ts = None
    for tok, tt in zip(r.tokens, r.timestamps):
        if tok.startswith('▁') or tok.startswith(' '):
            if cur: out.append([round(ts + s0 / sr, 2), cur])
            cur = tok.strip('▁ '); ts = tt
        else: cur += tok
    if cur: out.append([round(ts + s0 / sr, 2), cur])
json.dump(out, open(sys.argv[2], 'w')); print(len(out))
