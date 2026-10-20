#!/usr/bin/env bash
# Preflight for brag-center. Checks and reports; installs nothing outside the skill folder unless asked.
#
# Usage: check-env.sh [--agent cursor|claude-code|codex|gemini-cli|other] [--install browser,taste] [--no-install]
#
#   default        checks everything; installs the skill's own npm packages (~10 MB, inside the skill folder)
#   --install browser   download Playwright's Chromium (~300 MB) — only needed when Chrome/Edge are missing
#   --install taste     add tasteskill for the detected agent (global skill) — only with the user's consent
#   --no-install        don't even install the skill's npm packages
#
# Ends with KEY=VALUE lines (AGENT, BROWSER, TASTESKILL, FFMPEG, GH, VIBELAB, AGENT_BROWSER_TOOL) for the agent to read.
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT=""
INSTALL=""
DEPS=1
while [ $# -gt 0 ]; do
  case "$1" in
    --agent) AGENT="$2"; shift 2 ;;
    --install) INSTALL=",$2,"; shift 2 ;;
    --no-install) DEPS=0; shift ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac
done
wants() { [[ "$INSTALL" == *",$1,"* ]]; }

ok()   { printf '  ok    %s\n' "$*"; }
info() { printf '  --    %s\n' "$*"; }
warn() { printf '  WARN  %s\n' "$*"; }
fail() { printf '  FAIL  %s\n' "$*"; FAILED=1; }
FAILED=0

# Agent: explicit flag wins, then environment hints.
if [ -z "$AGENT" ]; then
  if [ -n "${CURSOR_AGENT:-}" ]; then AGENT=cursor
  elif [ -n "${CLAUDECODE:-}" ]; then AGENT=claude-code
  elif [ -n "${CODEX_SANDBOX:-}${CODEX_THREAD_ID:-}${CODEX_HOME:-}" ]; then AGENT=codex
  elif [ -n "${GEMINI_CLI:-}" ]; then AGENT=gemini-cli
  else AGENT=other; fi
fi

case "$AGENT" in
  cursor)      SKILL_DIRS="$HOME/.cursor/skills ./.cursor/skills $HOME/.agents/skills ./.agents/skills"
               AGENT_BROWSER="Cursor's built-in browser (screenshots, review)" ;;
  claude-code) SKILL_DIRS="$HOME/.claude/skills ./.claude/skills"
               AGENT_BROWSER="Claude in Chrome or a Playwright MCP, if connected" ;;
  codex)       SKILL_DIRS="$HOME/.codex/skills $HOME/.agents/skills ./.agents/skills"
               AGENT_BROWSER="none built in" ;;
  gemini-cli)  SKILL_DIRS="$HOME/.gemini/skills ./.gemini/skills $HOME/.agents/skills"
               AGENT_BROWSER="none built in" ;;
  *)           SKILL_DIRS=""
               AGENT_BROWSER="unknown" ;;
esac
ALL_SKILL_DIRS="$SKILL_DIRS $HOME/.agents/skills $HOME/.cursor/skills $HOME/.claude/skills $HOME/.codex/skills $HOME/.gemini/skills ./.agents/skills ./.cursor/skills ./.claude/skills"

echo "brag-center preflight (agent: $AGENT, skill: $SKILL_DIR)"

# Node >= 20 (required)
if command -v node >/dev/null; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" -ge 20 ]; then ok "node $(node -v)"; else fail "node $(node -v) is too old (need >= 20)"; fi
else
  fail "node not found (https://nodejs.org)"
fi

# Skill npm packages (required, local to the skill folder)
if [ -d "$SKILL_DIR/node_modules/playwright-core" ] && [ -d "$SKILL_DIR/node_modules/ajv" ]; then
  ok "skill packages"
elif [ "$DEPS" = 1 ]; then
  echo "  ...   installing skill packages into $SKILL_DIR (playwright-core, ajv)"
  (cd "$SKILL_DIR" && npm install --silent --no-audit --no-fund) && ok "skill packages installed" || fail "npm install failed in $SKILL_DIR"
else
  fail "skill packages missing (npm install in $SKILL_DIR)"
fi

# Browser: reuse Chrome/Edge; Playwright's Chromium only on request
BROWSER=none
if [ -d "$SKILL_DIR/node_modules/playwright-core" ]; then
  if wants browser; then
    echo "  ...   downloading Playwright Chromium (~300 MB)"
    (cd "$SKILL_DIR" && node node_modules/playwright-core/cli.js install chromium >/dev/null) || warn "chromium download failed"
  fi
  BROWSER="$(cd "$SKILL_DIR" && node scripts/lib/browser.mjs --probe 2>/dev/null || echo none)"
  case "$BROWSER" in
    none) warn "no Chrome or Edge found. Ask the user: install Chrome, or rerun with --install browser (~300 MB). Without a browser: use $AGENT_BROWSER for screenshots, skip loops and PDF." ;;
    *) ok "browser: $BROWSER" ;;
  esac
fi

# ffmpeg (optional; only used if already present)
if command -v ffmpeg >/dev/null; then FFMPEG=yes; ok "ffmpeg (optional: loops get converted to mp4)"
else FFMPEG=no; info "no ffmpeg — fine, loops stay webm with a jpg poster"; fi

# git / gh (gh needed for Vibelab clones and code harvest; never auto-installed)
command -v git >/dev/null && ok "git" || warn "git missing — Vibelab clones will be skipped"
if command -v gh >/dev/null; then
  if gh auth status >/dev/null 2>&1; then GH=ok; ok "gh authenticated"
  else GH=unauthenticated; warn "gh not signed in (gh auth login) — Vibelab clone and code steps will be skipped"; fi
else
  GH=missing; warn "gh missing (https://cli.github.com) — Vibelab clone and code steps will be skipped"
fi

# tasteskill: use if present (agent's own skills folder first); install only on request
find_taste() {
  for d in $ALL_SKILL_DIRS; do
    [ -f "$d/design-taste-frontend/SKILL.md" ] && { echo "$d/design-taste-frontend/SKILL.md"; return; }
  done
}
TASTE="$(find_taste)"
if [ -z "$TASTE" ] && wants taste; then
  if [ "$AGENT" = other ]; then
    warn "unknown agent; install tasteskill yourself: npx skills add Leonxlnx/taste-skill --skill design-taste-frontend -g"
  else
    echo "  ...   adding tasteskill for $AGENT"
    (cd "$HOME" && npx --yes skills add Leonxlnx/taste-skill --skill design-taste-frontend -g -a "$AGENT" -y >/dev/null 2>&1) || warn "tasteskill install failed"
    TASTE="$(find_taste)"
  fi
fi
if [ -n "$TASTE" ]; then ok "tasteskill: $TASTE"
else info "tasteskill not installed — ask the user once (--install taste), otherwise use the fallback checklist in reference/art-direction.md"; fi

# Vibelab (optional source)
VURL="${VIBELAB_URL:-https://vibelab.miro.tools}"
VIBELAB=ok
if [ ! -s "$HOME/.config/vibelab/token" ]; then
  VIBELAB=no-token; warn "vibelab token missing (run the vibelab skill preflight) — Vibelab step will be skipped"
else
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$VURL/vlapi/health" || true)"
  if [ "$code" != "000" ] && [ -n "$code" ]; then ok "vibelab reachable"; else VIBELAB=unreachable; warn "Vibelab not reachable — connect WARP"; fi
fi

echo
echo "AGENT=$AGENT"
echo "BROWSER=$BROWSER"
echo "TASTESKILL=${TASTE:-none}"
echo "FFMPEG=$FFMPEG"
echo "GH=$GH"
echo "VIBELAB=$VIBELAB"
echo "AGENT_BROWSER_TOOL=$AGENT_BROWSER"
echo
[ "$FAILED" = 0 ] && echo "preflight: OK" || { echo "preflight: FAILED (fix the FAIL lines above)"; exit 1; }
