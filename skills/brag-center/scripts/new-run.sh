#!/usr/bin/env bash
# Create a run folder in the current directory and print its absolute path.
# Usage: new-run.sh <firstname>
set -euo pipefail

name="${1:?usage: new-run.sh <firstname>}"
slug="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
base="brag-${slug}-$(date +%Y%m%d)"
dir="$base"
n=2
while [ -e "$dir" ]; do dir="${base}-${n}"; n=$((n + 1)); done

mkdir -p "$dir"/{evidence/boards,projects,assets/design,exports,review}
cat > "$dir/.gitignore" <<'EOF'
projects/*/repo/
projects/*/repo/**/node_modules/
site/node_modules/
site/dist/
*.db
.env
EOF
cd "$dir" && pwd
