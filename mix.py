# python3 mix.py voice.(mp3|wav) music.wav sfx.wav out.wav [duration_s]
# Music sits at exactly 50 % (-6 dB) of the voice's gated RMS; SFX at 50 % or less with peaks capped at 0.7x the voice peak.
import sys, subprocess, wave, numpy as np
SR = 48000
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def grms(x):
    n = int(0.05 * SR); fr = x[: len(x) // n * n].reshape(-1, n); r = np.sqrt((fr ** 2).mean(1) + 1e-12)
    g = r[r > r.max() * 10 ** (-30 / 20)]
    return np.sqrt((g ** 2).mean())
v, m, s = load(sys.argv[1]), load(sys.argv[2]), load(sys.argv[3])
N = int(float(sys.argv[5]) * SR) if len(sys.argv) > 5 else max(len(v), len(m))
pad = lambda x: np.pad(x, (0, max(0, N - len(x))))[:N]
v, m, s = pad(v), pad(m), pad(s)
vr, vp = grms(v), np.abs(v).max()
m *= 0.5 * vr / max(grms(m), 1e-9)
s *= 0.5 * vr / max(grms(s), 1e-9)
if np.abs(s).max() > 0.7 * vp: s *= 0.7 * vp / np.abs(s).max()
mix = v + m + s
db = lambda a, b: 20 * np.log10(a / b)
print(f"music {db(grms(m), vr):+.1f} dB vs voice | sfx {db(grms(s), vr):+.1f} dB (peak {db(np.abs(s).max(), vp):+.1f} dB) vs voice")
mix /= max(1.0, np.abs(mix).max() / 0.98)
with wave.open(sys.argv[4], "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
