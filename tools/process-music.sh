#!/usr/bin/env bash
# 把一首完整的歌剪成“直接从副歌开始”的处理版本，并压缩成适合网页的大小。
# 用法：  tools/process-music.sh 原始文件 输出文件 起始秒 结束秒 [风格]
# 例子：  tools/process-music.sh ~/Music/爱无所不在.flac music/love.mp3 62 185 warm
# 风格：  clean（默认，只剪切+响度统一） | warm（柔和温暖） | dream（朦胧回忆感） | lofi（旧收音机感）
# 处理后在 js/config.js 里把这首的 start 改成 0、end 改成 null 即可（因为已经剪好了）。
set -euo pipefail
in="$1"; out="$2"; ss="$3"; to="$4"; style="${5:-clean}"
dur=$(awk "BEGIN{print $to-$ss}")
fo=$(awk "BEGIN{print $dur-3}")
case "$style" in
  warm)  fx="lowpass=f=9000,bass=g=2:f=120,aecho=0.8:0.6:60:0.15," ;;
  dream) fx="lowpass=f=3500,aecho=0.8:0.8:90|180:0.35|0.2,chorus=0.6:0.9:50:0.3:0.25:2," ;;
  lofi)  fx="highpass=f=250,lowpass=f=3200,acrusher=bits=12:mix=0.3," ;;
  *)     fx="" ;;
esac
ffmpeg -hide_banner -y -ss "$ss" -t "$dur" -i "$in" \
  -af "${fx}afade=t=in:d=1.5,afade=t=out:st=${fo}:d=3,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ac 2 -ar 44100 -codec:a libmp3lame -b:a 160k "$out"
echo "完成：$out  （长度 ${dur}s）"
