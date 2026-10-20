#!/usr/bin/env bash
# Scaffold <run-dir>/site from templates/site, wire in story.json, install deps.
# Usage: scaffold-site.sh <run-dir> [--example]   (--example uses templates/example.story.json if the run has none)
set -euo pipefail

RUN="${1:?usage: scaffold-site.sh <run-dir> [--example]}"
EXAMPLE="${2:-}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN="$(cd "$RUN" && pwd)"
SITE="$RUN/site"

if [ -f "$SITE/package.json" ]; then
  echo "site already scaffolded at $SITE (delete it to re-scaffold)" >&2
else
  mkdir -p "$SITE"
  # Copy without clobbering media that may already be in site/public.
  (cd "$SKILL_DIR/templates/site" && find . -type f ! -path './node_modules/*' -print0 | while IFS= read -r -d '' f; do
    mkdir -p "$SITE/$(dirname "$f")"; [ -e "$SITE/$f" ] || cp "$f" "$SITE/$f"; done)
fi
mkdir -p "$SITE/public/media/proof" "$SITE/src/content"

if [ -f "$RUN/story.json" ]; then
  cp "$RUN/story.json" "$SITE/src/content/story.json"
elif [ "$EXAMPLE" = "--example" ]; then
  cp "$SKILL_DIR/templates/example.story.json" "$RUN/story.json"
  cp "$RUN/story.json" "$SITE/src/content/story.json"
else
  echo "no $RUN/story.json yet; write it (step 5) then rerun, or pass --example" >&2
  exit 1
fi

cd "$SITE"
if [ ! -d node_modules ]; then
  echo "installing site dependencies..." >&2
  npm install --silent --no-audit --no-fund
fi
echo "$SITE"
