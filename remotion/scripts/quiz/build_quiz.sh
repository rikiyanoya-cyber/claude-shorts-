#!/bin/bash
# All-category quiz Shorts: one episode JSON -> phone mp4 (same audio chain as build_nandoku.sh).
# usage: bash build_quiz.sh /home/user/quiz_jp/episodes/kanji_p1.json   -> /home/user/quiz_jp/shorts/kanji_p1/kanji_p1.mp4
set -e
J=$1; N=$(basename "$J" .json)
Q=$(cd "$(dirname "$0")" && pwd); A=/home/user/quiz_jp/assets; D=/home/user/quiz_jp/shorts/$N
mkdir -p "$D"; cd "$D"
python3 "$Q/quiz_short.py" "$J" video.mp4
python3 "$Q/quiz_mix.py" video_events.json "$A/voice_hook_kohei.mp3" "$A/BGM_Warm_Trivia_Breeze.mp3" mix.wav "$A/quiz_question_jingle.mp3" "$A/timer_tick.mp3"
ffmpeg -v error -y -i mix.wav -af "lowpass=f=12000,acompressor=threshold=-24dB:ratio=4:attack=3:release=120:makeup=1" mix_c.wav
I=$(ffmpeg -hide_banner -i mix_c.wav -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep " I:" | awk '{print $2}')
G=$(python3 -c "print(-14-($I)+0.3)")
ffmpeg -v error -y -i mix_c.wav -af "volume=${G}dB,aresample=192000,alimiter=limit=0.76:level=false:attack=1:release=60,aresample=48000" -ar 48000 mix_ln.wav
ffmpeg -v error -y -i video.mp4 -i mix_ln.wav -map 0:v -map 1:a -c:v libx265 -x265-params log-level=error -crf 24 -preset medium -tag:v hvc1 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$N.mp4"
echo "$N $(ffmpeg -hide_banner -i "$N.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E ' I:|Peak:' | tr -s ' ' | tr '\n' ' ')"
