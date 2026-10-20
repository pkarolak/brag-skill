#!/usr/bin/env bash
# Convert Playwright webm recordings into web-ready loops.
# For each <name>.webm produces <name>.mp4 (h264), <name>.webp (animated), <name>.jpg (poster).
# Reads <name>.webm.json sidecar ({ "trimStart": s }) written by capture.mjs.
# Usage: to-loop.sh [--max 10] [--width 1440] file.webm ...
set -euo pipefail

MAX=10
WIDTH=1440
files=()
while [ $# -gt 0 ]; do
  case "$1" in
    --max) MAX="$2"; shift 2 ;;
    --width) WIDTH="$2"; shift 2 ;;
    *) files+=("$1"); shift ;;
  esac
done
[ ${#files[@]} -gt 0 ] || { echo "usage: to-loop.sh [--max s] [--width px] file.webm ..." >&2; exit 2; }

if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg not found; keeping webm only (brew install ffmpeg)" >&2
  exit 0
fi

HAS_WEBP=0
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libwebp && HAS_WEBP=1
[ "$HAS_WEBP" = 1 ] || echo "note: ffmpeg has no libwebp encoder; skipping animated webp (mp4 + poster are enough)" >&2

for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  base="${f%.webm}"
  trim=0
  if [ -f "$f.json" ] && command -v jq >/dev/null; then trim="$(jq -r '.trimStart // 0' "$f.json")"; fi
  vf="scale='min(${WIDTH},iw)':-2:flags=lanczos,fps=30"

  ffmpeg -y -loglevel error -ss "$trim" -t "$MAX" -i "$f" -an \
    -vf "$vf" -c:v libx264 -pix_fmt yuv420p -preset slow -crf 22 -movflags +faststart "$base.mp4"

  if [ "$HAS_WEBP" = 1 ]; then
    ffmpeg -y -loglevel error -ss "$trim" -t "$MAX" -i "$f" -an \
      -vf "scale='min(960,iw)':-2:flags=lanczos,fps=15" -c:v libwebp -loop 0 -q:v 70 -compression_level 6 "$base.webp"
  fi

  ffmpeg -y -loglevel error -ss "$(awk "BEGIN{print $trim+0.8}")" -i "$f" -frames:v 1 \
    -vf "scale='min(${WIDTH},iw)':-2" -q:v 3 "$base.jpg"

  dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$base.mp4" 2>/dev/null || echo "?")"
  extra=""; [ "$HAS_WEBP" = 1 ] && extra=" + .webp"
  echo "✓ $base.mp4 ($dims)$extra + .jpg poster"
done
