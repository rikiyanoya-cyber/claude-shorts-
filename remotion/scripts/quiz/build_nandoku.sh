#!/bin/bash
# 難読地名クイズ Shorts: one command per episode, in the format fixed by the owner on 2026-11-27 (episode ① is the reference).
# usage: bash build_nandoku.sh <part number> <place1> <place2> <place3>   (the part number is shown as "パートN")
#   e.g. bash build_nandoku.sh 2 十三 放出 御徒町   -> /home/user/quiz_jp/nandoku02/nandoku_quiz_02_phone.mp4
# Owner assets live in /home/user/quiz_jp/assets (not committed: the sound-library terms forbid redistribution).
set -e
P=$1; N=$(printf %02d "$1"); shift
Q=$(cd "$(dirname "$0")" && pwd); A=/home/user/quiz_jp/assets; D=/home/user/quiz_jp/nandoku$N
mkdir -p "$D"; cd "$D"
python3 "$Q/nandoku_short.py" video.mp4 "$1" "$2" "$3" "$P"
python3 "$Q/quiz_mix.py" video_events.json "$A/voice_hook_kohei.mp3" "$A/BGM_Warm_Trivia_Breeze.mp3" mix.wav "$A/quiz_question_jingle.mp3" "$A/timer_tick.mp3"
ffmpeg -v error -y -i mix.wav -af "lowpass=f=12000,acompressor=threshold=-24dB:ratio=4:attack=3:release=120:makeup=1" mix_c.wav
I=$(ffmpeg -hide_banner -i mix_c.wav -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep " I:" | awk '{print $2}')
G=$(python3 -c "print(-14-($I)+0.3)")
ffmpeg -v error -y -i mix_c.wav -af "volume=${G}dB,aresample=192000,alimiter=limit=0.76:level=false:attack=1:release=60,aresample=48000" -ar 48000 mix_ln.wav
ffmpeg -v error -y -i video.mp4 -i mix_ln.wav -map 0:v -map 1:a -c:v libx265 -x265-params log-level=error -crf 21 -preset medium -tag:v hvc1 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "nandoku_quiz_${N}_phone.mp4"
ffmpeg -hide_banner -i "nandoku_quiz_${N}_phone.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E " I:|Peak:"
echo "$D/nandoku_quiz_${N}_phone.mp4"
