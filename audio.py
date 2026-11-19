# python3 audio.py <storyDir> <outDir>
# Synthesizes the music bed + SFX stems from <storyDir>/cues.json and phrases.json. 48 kHz mono float WAV stems.
# cues.json: {"music": {"bpm": 112, "stop": [phrase, offset_s], "drone_after": true, "key": "C"},
#             "sfx": [{"at": [phrase, offset_s], "type": "whoosh", "gain": 1.0}, ...]}
import json, sys, os, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

def wav_write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def env(n, a=0.005, d=0.2, sus=0.0, r=0.05):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (sus + (1 - sus) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4)))
    tail = int(r * SR)
    if tail and n > tail: e[-tail:] *= np.linspace(1, 0, tail)
    return e

def lp(x, cut):  # one-pole low-pass
    a = np.exp(-2 * np.pi * cut / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y

def lp_fast(x, cut):
    # vectorised 1-pole via scipy-free filtering using exponential smoothing on blocks
    from numpy.lib.stride_tricks import sliding_window_view  # noqa
    a = np.exp(-2 * np.pi * cut / SR)
    k = np.arange(0, int(SR * 6 / max(cut, 1)) + 1)
    h = (1 - a) * a ** k
    return np.convolve(x, h)[: len(x)]

def note(f):  # semitone index from A4
    return 440.0 * 2 ** (f / 12)

# ---------------------------------------------------------------- instruments
def kick(n=int(0.35 * SR)):
    t = np.arange(n) / SR; f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.18)

def snare(n=int(0.25 * SR)):
    t = np.arange(n) / SR
    return (0.6 * rng.standard_normal(n) * env(n, 0.001, 0.08) + 0.4 * np.sin(2 * np.pi * 190 * t) * env(n, 0.001, 0.06)) * 0.7

def hat(n=int(0.06 * SR)):
    x = rng.standard_normal(n); x = x - lp_fast(x, 6000)
    return x * env(n, 0.001, 0.02) * 0.35

def pluck(freq, dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * freq * h * t) / h ** 1.6 for h in range(1, 6))
    return x * env(n, 0.003, 0.12) * 0.6

def brass(freq, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    saw = 2 * ((freq * t) % 1) - 1
    saw2 = 2 * ((freq * 1.004 * t) % 1) - 1
    x = lp_fast(0.5 * saw + 0.5 * saw2, 1400)
    return x * env(n, 0.05, 2.0, 0.7, 0.08) * 0.35

# ---------------------------------------------------------------- SFX
def sfx(kind):
    if kind == "whoosh":
        n = int(0.5 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
        lo = lp_fast(x, 900); hi = lp_fast(x, 3000)
        shape = np.sin(np.pi * t / t[-1]) ** 2
        return (0.7 * lo + 0.3 * hi) * shape * 1.6
    if kind == "pop":
        n = int(0.12 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * (500 + 900 * t / t[-1]) * t) * env(n, 0.001, 0.04)
    if kind == "boing":
        n = int(0.45 * SR); t = np.arange(n) / SR
        f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 5)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.25)
    if kind == "thunk":
        n = int(0.3 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) + 0.3 * lp_fast(rng.standard_normal(n), 500)) * env(n, 0.001, 0.09)
    if kind == "ting":
        n = int(0.9 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * env(n, 0.001, 0.35) * 0.5
    if kind == "clank":
        n = int(0.4 * SR); t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(520, 9), (1170, 12), (1870, 16), (2710, 22)])
        return x * env(n, 0.001, 0.25) * 0.45
    if kind == "sting":  # low hit + dissonant swell for the twist
        n = int(1.4 * SR); t = np.arange(n) / SR
        boom = np.sin(2 * np.pi * (45 + 40 * np.exp(-t * 6)) * t) * env(n, 0.002, 0.6)
        cl = (np.sin(2 * np.pi * 233 * t) + np.sin(2 * np.pi * 247 * t)) * env(n, 0.01, 0.5) * 0.3
        return boom + cl
    if kind == "crowd":
        n = int(2.4 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
        band = lp_fast(x, 1800) - lp_fast(x, 300)
        mod = 1 + 0.35 * np.sin(2 * np.pi * 3.1 * t) * np.sin(2 * np.pi * 0.7 * t)
        return band * mod * env(n, 0.15, 1.8, 0.5, 0.6) * 2.2
    if kind == "moo":
        n = int(1.0 * SR); t = np.arange(n) / SR
        f = 110 + 25 * np.sin(np.pi * t / t[-1]) - 15 * t
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = sum(np.sin(h * ph) * (1.0 / h) for h in range(1, 14))
        x = lp_fast(x, 900) + 0.4 * (lp_fast(x, 2400) - lp_fast(x, 1400))
        return x * env(n, 0.08, 3.0, 0.8, 0.25) * 1.4
    if kind == "chomp":
        out = np.zeros(int(0.7 * SR))
        for k in range(3):
            n = int(0.09 * SR); b = lp_fast(rng.standard_normal(n), 1200) * env(n, 0.001, 0.03)
            out[int(k * 0.2 * SR): int(k * 0.2 * SR) + n] += b * 1.5
        return out
    if kind == "burp":
        n = int(0.6 * SR); t = np.arange(n) / SR
        f = 75 + 20 * np.sin(2 * np.pi * 7 * t)
        x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
        return lp_fast(x, 600) * env(n, 0.02, 0.4, 0.4, 0.1) * 1.6
    if kind == "flash":
        n = int(0.6 * SR); x = rng.standard_normal(n)
        return (x - lp_fast(x, 4000)) * env(n, 0.001, 0.25) * 0.8
    if kind == "grunt":  # strained vocal-ish buzz
        n = int(0.55 * SR); t = np.arange(n) / SR
        f = 105 + 25 * np.sin(np.pi * t / t[-1]) + 4 * np.sin(2 * np.pi * 31 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR; x = sum(np.sin(h * ph) / h for h in range(1, 18))
        x = lp_fast(x, 1100) + 0.5 * (lp_fast(x, 2600) - lp_fast(x, 1800)) + 0.15 * lp_fast(rng.standard_normal(n), 2000)
        return x * env(n, 0.04, 0.5, 0.6, 0.12) * 1.3
    if kind == "pump":  # air pump stroke, rising
        n = int(0.32 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
        band = lp_fast(x, 2500) - lp_fast(x, 600)
        squeak = np.sin(2 * np.pi * np.cumsum(500 + 700 * t / t[-1]) / SR) * 0.25
        return (band + squeak) * env(n, 0.03, 0.18) * 1.6
    if kind == "bang":  # balloon pop
        n = int(0.5 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
        return (x * np.exp(-t * 45) + 0.6 * np.sin(2 * np.pi * (70 + 80 * np.exp(-t * 30)) * t) * np.exp(-t * 9)) * 1.2
    if kind == "fart":  # long deflating pfffbbbt with sputters
        n = int(1.7 * SR); t = np.arange(n) / SR
        f = 150 * np.exp(-t * 0.9) + 38 + 18 * np.sin(2 * np.pi * 5.5 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sign(np.sin(ph)) * 0.6 + 0.4 * np.sin(2 * ph)
        flutter = 0.65 + 0.35 * np.sign(np.sin(2 * np.pi * (9 + 6 * t) * t))
        x = lp_fast(x * flutter, 900) + 0.25 * lp_fast(rng.standard_normal(n), 1500) * (1 - t / t[-1])
        sput = np.ones(n); 
        for a in (1.25, 1.42, 1.55): sput[int(a * SR): int((a + 0.06) * SR)] = 0.15
        return x * env(n, 0.01, 4.0, 0.9, 0.08) * sput * 1.7
    if kind == "squeal":  # balloon whistle zipping around
        n = int(1.6 * SR); t = np.arange(n) / SR
        f = 900 + 400 * np.sin(2 * np.pi * 1.3 * t) + 120 * np.sin(2 * np.pi * 11 * t) - 300 * t
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.02, 3.0, 0.8, 0.2) * 0.35
    if kind == "plop":
        n = int(0.18 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * (260 * np.exp(-t * 14) + 80) * t) * env(n, 0.002, 0.07)
    if kind == "creak":  # rubbery muscle stretch
        n = int(0.4 * SR); t = np.arange(n) / SR
        f = 210 + 90 * t / t[-1] + 30 * np.sin(2 * np.pi * 23 * t)
        x = 2 * ((np.cumsum(f) / SR) % 1) - 1
        return lp_fast(x, 1600) * env(n, 0.03, 0.25, 0.3, 0.06) * 0.6
    if kind == "splat":  # wet slap
        n = int(0.3 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
        return (lp_fast(x, 700) * 1.6 + 0.5 * np.sin(2 * np.pi * (120 + 200 * np.exp(-t * 40)) * t)) * env(n, 0.001, 0.08)
    if kind == "beep":
        n = int(0.09 * SR); t = np.arange(n) / SR
        return np.sign(np.sin(2 * np.pi * 1320 * t)) * 0.35 * env(n, 0.002, 0.2, 1.0, 0.01)
    if kind == "motor":  # treadmill motor whining up
        n = int(2.6 * SR); t = np.arange(n) / SR
        f = 60 + 520 * (t / t[-1]) ** 1.6
        x = 2 * ((np.cumsum(f) / SR) % 1) - 1 + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR)
        return lp_fast(x, 2200) * env(n, 0.2, 9, 1.0, 0.05) * 0.5
    raise ValueError(kind)

def main():
    story, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    P = json.load(open(os.path.join(story, "phrases.json")))
    C = json.load(open(os.path.join(story, "cues.json")))
    starts = [p["start"] for p in P["phrases"]]
    dur = P["duration"] + C.get("tail", 0.9)
    N = int(dur * SR)
    at = lambda a: starts[a[0]] + a[1]
    # ---- music: march-ish loop, stops at the twist, drone after
    m = C["music"]; bpm = m.get("bpm", 112); beat = 60 / bpm
    stop = at(m["stop"]) if m.get("stop") else dur
    resume = at(m["resume"]) if m.get("resume") else None
    music = np.zeros(N + SR)
    root = m.get("root", -9)  # semitones from A4 (C4 = -9)
    prog = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]] if m.get("mode", "major") == "major" else [[0, 3, 7], [5, 8, 12], [7, 10, 14], [0, 3, 7]]
    def put(x, t0):
        i = int(t0 * SR)
        if i >= len(music): return
        music[i:i + len(x)] += x[: len(music) - i]
    def play(t_from, t_to):
        nb = int((t_to - t_from) / beat)
        for b in range(nb):
            t0 = t_from + b * beat
            bar = (b // 4) % 4; ch = prog[bar]
            put(kick() * 0.9, t0) if b % 2 == 0 else put(snare() * 0.8, t0)
            put(hat(), t0 + beat / 2)
            bass = note(root - 24 + ch[(b % 2) * 2])
            put(pluck(bass, beat * 0.9) * 0.9, t0)
            if b % 4 == 0:
                for k in ch: put(brass(note(root + k), beat * 3.6) * 0.33, t0)
            if b % 2 == 1: put(pluck(note(root + 12 + ch[(b // 2) % 3]), beat * 0.5) * 0.35, t0)
    play(0.0, stop)
    if m.get("drone_after", True):
        n = int(((resume or dur) - stop) * SR)
        if n > 0:
            t = np.arange(n) / SR
            drone = (np.sin(2 * np.pi * note(root - 24) * t) + 0.5 * np.sin(2 * np.pi * note(root - 17) * t)) * 0.18 * np.minimum(1, t / 0.4)
            put(drone, stop)
    if resume: play(resume, dur)
    music = music[:N]
    fade = int(0.5 * SR); music[-fade:] *= np.linspace(1, 0, fade)
    # ---- sfx
    fx = np.zeros(N + 3 * SR)
    for c in C["sfx"]:
        x = sfx(c["type"]) * c.get("gain", 1.0); i = int(at(c["at"]) * SR)
        if 0 <= i < len(fx): fx[i:i + len(x)] += x[: len(fx) - i]
    fx = fx[:N]
    wav_write(os.path.join(out, "music.wav"), music / max(1e-6, np.abs(music).max()) * 0.8)
    wav_write(os.path.join(out, "sfx.wav"), fx / max(1e-6, np.abs(fx).max()) * 0.8)
    print("stems", round(dur, 2), "s")

if __name__ == "__main__":
    main()
