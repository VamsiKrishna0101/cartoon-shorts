# python3 captions.py <phrases.json> <out.ass>
# TikTok-style burned-in captions: 1-3 words at a time, bold white with a thick black outline, the spoken word in yellow,
# a small pop-in on each chunk. Word times are spread inside each phrase by syllable count (phrases come from timing.py).
# Burn in with: ffmpeg -i in.mp4 -vf "ass=out.ass" ...   (finish.sh does this when given a 4th argument)
import json, re, sys

P = json.load(open(sys.argv[1]))
out = sys.argv[2]
syl = lambda w: max(1, len(re.findall(r"[aeiouy]+", w.lower().strip(".,!?'\""))))
FONT, SIZE, Y = "Poppins", 118, 1330  # Y = vertical centre of the caption line (clear of TikTok's bottom UI)

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

events = []
for ph in P["phrases"]:
    words = ph["text"].split()
    a, b = ph["start"], ph["end"]
    w = [syl(x) + 0.6 for x in words]; tot = sum(w)
    times, acc = [], a
    for x in w:
        d = (b - a) * x / tot; times.append((acc, acc + d)); acc += d
    # chunk: up to 3 words, break after punctuation, keep chunks short in characters
    chunks, cur = [], []
    for i, word in enumerate(words):
        cur.append(i)
        if len(cur) == 3 or re.search(r"[,.!?]$", word) or sum(len(words[j]) for j in cur) >= 13:
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    for ci, ch in enumerate(chunks):
        c0 = times[ch[0]][0]
        c1 = times[chunks[ci + 1][0]][0] if ci + 1 < len(chunks) else b + 0.12
        for k, wi in enumerate(ch):
            s = times[wi][0] if k else c0
            e = times[ch[k + 1]][0] if k + 1 < len(ch) else c1
            parts = []
            for wj in ch:
                txt = re.sub(r"[.,!?]+$", "", words[wj]).upper()
                parts.append(("{\\c&H00E5FF&}" + txt + "{\\c&HFFFFFF&}") if wj == wi else txt)
            pop = "{\\fscx88\\fscy88\\t(0,80,\\fscx104\\fscy104)\\t(80,140,\\fscx100\\fscy100)}" if k == 0 else ""
            events.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{pop}" + " ".join(parts))

head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT},{SIZE},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,11,5,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
# alignment 5 = middle-centre; position each line at Y with \pos
events = [e.replace(",Cap,,0,0,0,,", ",Cap,,0,0,0,,{\\pos(540," + str(Y) + ")}", 1) for e in events]
open(out, "w").write(head + "\n".join(events) + "\n")
print(len(events), "caption events")
