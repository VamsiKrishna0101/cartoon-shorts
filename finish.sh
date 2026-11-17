#!/bin/bash
# bash finish.sh <framesDir> <mix.wav> <out.mp4> [captions.ass]
# One linear gain to about -14 LUFS (+ -1 dBFS limiter), H.264 CRF 18, AAC 192k, plus freeze/black QA.
set -e
FR="$1"; MIX="$2"; OUT="$3"; CAP="$4"
VF="null"; [ -n "$CAP" ] && VF="ass=$CAP"
J=$(ffmpeg -hide_banner -nostats -i "$MIX" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'])")
GAIN=$(python3 -c "print(round(-14-($MI),2))")
echo "measured $MI LUFS -> gain $GAIN dB"
ffmpeg -y -v error -framerate 30 -i "$FR/f%04d.jpg" -i "$MIX" -vf "$VF" -af "volume=${GAIN}dB,alimiter=limit=0.891:level=false" \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "--- QA"
ffmpeg -v info -i "$OUT" -vf "freezedetect=n=0.001:d=0.4,blackdetect=d=0.1" -map 0:v -f null - 2>&1 | grep -E "freeze_duration|black_start" || echo "no freezes >=0.4s, no black frames"
ffmpeg -v error -i "$OUT" -af ebur128 -f null - 2>&1 | tail -0
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
