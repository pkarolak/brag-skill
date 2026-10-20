#!/usr/bin/env bash
# Preflight for brag-center. Installs what's missing, reports what can't be installed.
# Usage: check-env.sh [--no-install]
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL=1
[ "${1:-}" = "--no-install" ] && INSTALL=0

ok()   { printf '  ok    %s\n' "$*"; }
warn() { printf '  WARN  %s\n' "$*"; }
fail() { printf '  FAIL  %s\n' "$*"; FAILED=1; }
FAILED=0

echo "brag-center preflight (skill: $SKILL_DIR)"

# Node >= 20
if command -v node >/dev/null; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" -ge 20 ]; then ok "node $(node -v)"; else fail "node $(node -v) is too old (need >= 20)"; fi
else
  fail "node not found (install from https://nodejs.org or 'brew install node')"
fi

# Skill deps (playwright, ajv)
if [ -d "$SKILL_DIR/node_modules/playwright" ] && [ -d "$SKILL_DIR/node_modules/ajv" ]; then
  ok "skill node_modules"
elif [ "$INSTALL" = 1 ]; then
  echo "  ...   installing skill dependencies"
  (cd "$SKILL_DIR" && npm install --silent --no-audit --no-fund) && ok "skill node_modules installed" || fail "npm install failed in $SKILL_DIR"
else
  fail "skill node_modules missing (run npm install in $SKILL_DIR)"
fi

# Playwright chromium
if [ -d "$SKILL_DIR/node_modules/playwright" ]; then
  if (cd "$SKILL_DIR" && node -e "const {chromium}=require('playwright');require('fs').accessSync(chromium.executablePath())" 2>/dev/null); then
    ok "playwright chromium"
  elif [ "$INSTALL" = 1 ]; then
    echo "  ...   installing playwright chromium"
    (cd "$SKILL_DIR" && npx --yes playwright install chromium >/dev/null) && ok "playwright chromium installed" || fail "playwright install chromium failed"
  else
    fail "playwright chromium missing"
  fi
fi

# ffmpeg
if command -v ffmpeg >/dev/null; then
  ok "ffmpeg"
elif [ "$INSTALL" = 1 ] && command -v brew >/dev/null; then
  echo "  ...   installing ffmpeg via brew (can take a few minutes)"
  brew install ffmpeg >/dev/null 2>&1 && ok "ffmpeg installed" || warn "ffmpeg install failed; loops will stay as webm"
else
  warn "ffmpeg missing; loops will stay as webm (brew install ffmpeg)"
fi

# gh, jq, curl, git
for bin in git curl jq gh; do
  if command -v "$bin" >/dev/null; then ok "$bin"; else
    if [ "$INSTALL" = 1 ] && command -v brew >/dev/null && [ "$bin" != git ]; then
      brew install "$bin" >/dev/null 2>&1 && ok "$bin installed" || warn "$bin missing"
    else warn "$bin missing"; fi
  fi
done
command -v gh >/dev/null && { gh auth status >/dev/null 2>&1 && ok "gh authenticated" || warn "gh not authenticated (gh auth login) — code + Vibelab clone steps will be skipped"; }

# tasteskill
TASTE=""
for p in \
  "$HOME/.agents/skills/design-taste-frontend/SKILL.md" \
  "$HOME/.cursor/skills/design-taste-frontend/SKILL.md" \
  "$HOME/.claude/skills/design-taste-frontend/SKILL.md" \
  "./.agents/skills/design-taste-frontend/SKILL.md" \
  "./.cursor/skills/design-taste-frontend/SKILL.md"; do
  [ -f "$p" ] && { TASTE="$p"; break; }
done
if [ -z "$TASTE" ] && [ "$INSTALL" = 1 ]; then
  echo "  ...   installing tasteskill (design-taste-frontend)"
  (cd "$HOME" && npx --yes skills add Leonxlnx/taste-skill --skill design-taste-frontend -g -y >/dev/null 2>&1) || \
  (cd "$HOME" && npx --yes skills add Leonxlnx/taste-skill --skill design-taste-frontend -y >/dev/null 2>&1) || true
  TASTE="$(find "$HOME/.agents/skills" "$HOME/.cursor/skills" "$HOME/.claude/skills" -path '*design-taste-frontend*/SKILL.md' 2>/dev/null | head -1)"
fi
if [ -n "$TASTE" ]; then ok "tasteskill: $TASTE"; echo "TASTESKILL=$TASTE"; else
  warn "tasteskill not found. Install: npx skills add Leonxlnx/taste-skill --skill design-taste-frontend"
fi

# Vibelab
VURL="${VIBELAB_URL:-https://vibelab.miro.tools}"
if [ -s "$HOME/.config/vibelab/token" ]; then ok "vibelab token"; else warn "vibelab token missing (run the vibelab skill preflight) — Vibelab step will be skipped"; fi
if command -v warp-cli >/dev/null && warp-cli status 2>/dev/null | grep -qi connected; then ok "WARP connected"
else
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$VURL/vlapi/health" || true)"
  if [ "$code" != "000" ] && [ -n "$code" ]; then ok "vibelab reachable ($code)"; else warn "Vibelab not reachable — connect WARP (warp-cli connect)"; fi
fi

echo
[ "$FAILED" = 0 ] && echo "preflight: OK" || { echo "preflight: FAILED (fix the FAIL lines above)"; exit 1; }
