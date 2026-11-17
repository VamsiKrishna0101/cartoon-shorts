# python3 timing.py voice.mp3 script.txt out/phrases.json
# Splits the script into phrases at sentence/clause punctuation and aligns them to speech found by silence detection.
import sys, re, json, subprocess
voice, script, out = sys.argv[1:4]
txt = re.sub(r"\s+", " ", open(script).read()).strip()
phr = [p.strip() for p in re.split(r"(?<=[.!?])\s+", txt) if p.strip()]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice], capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-i", voice, "-af", "silencedetect=noise=-38dB:d=0.16", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
# speech segments
segs, t = [], 0.0
for a, b in zip(ss, se + [dur] * (len(ss) - len(se))):
    if a - t > 0.05: segs.append([t, a])
    t = b
if dur - t > 0.05: segs.append([t, dur])
syl = lambda s: max(1, len(re.findall(r"[aeiouy]+", s.lower())))
w = [syl(p) for p in phr]
# DP: assign phrases in order to consecutive segment groups, cost = mismatch of syllable rate
import math
S, Pn = len(segs), len(phr)
speech = sum(b - a for a, b in segs); rate = sum(w) / speech
INF = 1e18; best = [[INF] * (S + 1) for _ in range(Pn + 1)]; back = [[0] * (S + 1) for _ in range(Pn + 1)]
best[0][0] = 0
for i in range(1, Pn + 1):
    for j in range(1, S + 1):
        for k in range(i - 1, j):  # phrase i covers segments k..j-1
            if best[i - 1][k] >= INF: continue
            d = sum(b - a for a, b in segs[k:j]); c = (math.log((w[i - 1] / rate + .05) / (d + .05))) ** 2
            if best[i - 1][k] + c < best[i][j]: best[i][j] = best[i - 1][k] + c; back[i][j] = k
res, j = [], S
if best[Pn][S] < INF:
    for i in range(Pn, 0, -1):
        k = back[i][j]; res.append((segs[k][0], segs[j - 1][1])); j = k
    res.reverse()
else:  # fewer pauses than phrases: split segments proportionally by syllables
    tot = sum(w); acc = 0; res = []
    for p in w:
        def at(x):
            x *= speech
            for a, b in segs:
                if x <= b - a: return a + x
                x -= b - a
            return dur
        res.append((at(acc / tot), at((acc + p) / tot))); acc += p
json.dump({"duration": round(dur, 3), "phrases": [{"text": p, "start": round(a, 3), "end": round(b, 3)} for p, (a, b) in zip(phr, res)]}, open(out, "w"), indent=1)
for p, (a, b) in zip(phr, res): print(f"{a:6.2f}-{b:6.2f}  {p}")
