#!/usr/bin/env bash
# Clone a deployed app's repo read-only, analyze how it depends on its hosting platform, write RUN-LOCALLY.md,
# and optionally smoke-run or serve it locally.
# Usage: app-localize.sh <name> <run-dir> --repo <owner/name | git URL> [--url <live-url>] [--platform <name>]
#                        [--meta <app-meta.json>] [--email <subject-email>] [--smoke | --serve]
# app-meta.json (optional, written by the agent from the platform's API/CLI/MCP):
#   { "status", "rootDir", "build", "start", "runtime", "envKeys": [] }
set -uo pipefail

APP="${1:?usage: app-localize.sh <name> <run-dir> --repo R [--url U] [--platform P] [--meta F] [--email E] [--smoke|--serve]}"
RUN="${2:?run dir required}"; shift 2
EMAIL=""; REPO=""; MODE=""; LIVE_URL=""; PLATFORM=""; META=""
while [ $# -gt 0 ]; do
  case "$1" in
    --email) EMAIL="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --url) LIVE_URL="$2"; shift 2 ;;
    --platform) PLATFORM="$2"; shift 2 ;;
    --meta) META="$2"; shift 2 ;;
    --smoke) MODE=smoke; shift ;;
    --serve) MODE=serve; shift ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ "$APP" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "app name must be [A-Za-z0-9._-]" >&2; exit 2; }
[ -n "$REPO" ] || { echo "--repo is required (owner/name or git URL)" >&2; exit 2; }
[[ "$REPO" =~ ^([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+|https://[^[:space:]]+|git@[^[:space:]]+)$ ]] || { echo "unsupported --repo: $REPO" >&2; exit 2; }
PLATFORM="${PLATFORM:-its hosting platform}"

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JSON="$SKILL_DIR/scripts/lib/json.mjs"
RUN="$(cd "$RUN" && pwd)"
OUT="$RUN/projects/$APP"
mkdir -p "$OUT"
log() { echo "[$APP] $*" >&2; }

# 1. Platform metadata (optional)
if [ -n "$META" ] && [ -f "$META" ]; then cp "$META" "$OUT/app.json"; else echo '{}' > "$OUT/app.json"; fi
jget() { node "$JSON" get "$OUT/app.json" "$@" 2>/dev/null; }
STATUS="$(jget .status)"; [ -n "$STATUS" ] || STATUS="unknown"
ROOT_DIR="$(jget .rootDir .root_dir)"
P_BUILD="$(jget .build .build_command .buildCommand)"
P_START="$(jget .start .start_command .startCommand)"
P_RUNTIME="$(jget .runtime)"
[ -n "$LIVE_URL" ] || LIVE_URL="$(jget .url)"
LIVE_HOST=""; [ -n "$LIVE_URL" ] && LIVE_HOST="$(printf '%s' "$LIVE_URL" | sed -E 's#^[a-z]+://([^/:]+).*#\1#')"
# Platform domain = live host minus the app's own label (app.platform.example → platform.example).
PLATFORM_DOMAIN="$(printf '%s' "$LIVE_HOST" | awk -F. 'NF>2{sub(/^[^.]+\./,"")}1')"

# 2. Clone (blobless, push disabled)
REPO_URL="$REPO"
if [ -d "$OUT/repo/.git" ]; then
  log "repo exists; fetching"
  git -C "$OUT/repo" fetch --quiet origin && git -C "$OUT/repo" pull --quiet --ff-only || true
else
  log "cloning $REPO"
  if [[ "$REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
    REPO_URL="https://github.com/$REPO"
    if command -v gh >/dev/null; then gh repo clone "$REPO" "$OUT/repo" -- --filter=blob:none --quiet
    else git clone --filter=blob:none --quiet -- "$REPO_URL" "$OUT/repo"; fi || { log "clone failed"; exit 1; }
  else
    git clone --filter=blob:none --quiet -- "$REPO" "$OUT/repo" || { log "clone failed"; exit 1; }
  fi
fi
git -C "$OUT/repo" remote set-url --push origin DISABLED-read-only-brag-center

APPDIR="$OUT/repo${ROOT_DIR:+/$ROOT_DIR}"
[ -d "$APPDIR" ] || APPDIR="$OUT/repo"
PKG="$APPDIR/package.json"

# 3. Analyze
has_file() { [ -f "$APPDIR/$1" ]; }
pkg() { [ -f "$PKG" ] && node "$JSON" get "$PKG" "$1" 2>/dev/null; }
dep() { [ -f "$PKG" ] && node "$JSON" has-dep "$PKG" "$1" 2>/dev/null; }
grep_src() { grep -rIlE "$1" "$APPDIR" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' --include='*.cjs' --include='*.jsx' --include='*.py' --include='*.go' --include='*.rb' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next --exclude-dir=.venv 2>/dev/null | head -5 | sed "s#$OUT/repo/##" | tr '\n' ' '; }

PM=npm
{ has_file bun.lockb || has_file bun.lock; } && PM=bun
has_file pnpm-lock.yaml && PM=pnpm
has_file yarn.lock && PM=yarn
[ "$P_RUNTIME" = bun ] && PM=bun

FRAMEWORK=static-html
if [ -f "$PKG" ]; then
  FRAMEWORK=node
  dep vite && FRAMEWORK=vite
  dep next && FRAMEWORK=next
  dep astro && FRAMEWORK=astro
  dep react-scripts && FRAMEWORK=cra
  dep @remix-run/node && FRAMEWORK=remix
  dep express && [ "$FRAMEWORK" = node ] && FRAMEWORK=express
  dep hono && [ "$FRAMEWORK" = node ] && FRAMEWORK=hono
fi
{ has_file requirements.txt || has_file pyproject.toml; } && [ ! -f "$PKG" ] && FRAMEWORK=python

S_BUILD="$(pkg '.scripts.build')"; S_START="$(pkg '.scripts.start')"; S_DEV="$(pkg '.scripts.dev')"
APP_TYPE=static
{ [ -n "$S_START" ] || [ -n "$P_START" ] || [ "$FRAMEWORK" = python ]; } && APP_TYPE=dynamic

OUT_DIR="."
case "$FRAMEWORK" in vite|astro) OUT_DIR=dist ;; cra) OUT_DIR=build ;; next) OUT_DIR=out ;; esac

# Deploy/platform config files (known PaaS + anything else that looks like a deploy descriptor).
PLATFORM_FILES=""
for f in vercel.json netlify.toml fly.toml render.yaml app.yaml app.json Procfile railway.json railway.toml wrangler.toml \
         firebase.json amplify.yml .replit replit.nix Dockerfile docker-compose.yml compose.yaml Caddyfile; do
  has_file "$f" && PLATFORM_FILES="$PLATFORM_FILES$f "
done
for f in "$APPDIR"/*.toml "$APPDIR"/*.yaml "$APPDIR"/*.yml; do
  [ -f "$f" ] || continue
  b="$(basename "$f")"
  case "$b" in pyproject.toml|Cargo.toml|netlify.toml|fly.toml|railway.toml|wrangler.toml|render.yaml|app.yaml|docker-compose.yml|compose.yaml|pnpm-lock.yaml|pnpm-workspace.yaml|.*) ;;
    *) PLATFORM_FILES="$PLATFORM_FILES$b " ;; esac
done

ENV_KEYS="$(node -e 'try{const m=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log((m.envKeys||[]).filter(k=>/^[A-Z_][A-Z0-9_]*$/.test(k)).join(" "))}catch{}' "$OUT/app.json")"
for f in .env.example .env.sample .env.template; do
  has_file "$f" && ENV_KEYS="$ENV_KEYS $(grep -E '^[A-Z_][A-Z0-9_]*=' "$APPDIR/$f" | cut -d= -f1 | tr '\n' ' ')" && break
done
ENV_KEYS="$(printf '%s\n' $ENV_KEYS | sort -u | tr '\n' ' ')"

USES_SQLITE=no
{ dep better-sqlite3 || dep sqlite3 || dep @libsql/client || [ -n "$(grep_src 'bun:sqlite|DATABASE_PATH|sqlite3\.connect')" ]; } && USES_SQLITE=yes
USES_PORT_ENV=no; [ -n "$(grep_src 'process\.env\.PORT|Bun\.env\.PORT|env\.PORT|environ.*PORT|getenv\(.PORT')" ] && USES_PORT_ENV=yes
AI_ENDPOINT="$(grep_src 'OPENAI_BASE_URL|ANTHROPIC_BASE_URL|baseURL:\s*["'"'"']https?://')"
PRIVATE_REGISTRY=""
for f in "$APPDIR/.npmrc" "$OUT/repo/.npmrc"; do
  [ -f "$f" ] && PRIVATE_REGISTRY="$PRIVATE_REGISTRY$(grep -oE '^(@[a-z0-9_.-]+:)?registry=[^ ]+' "$f" | sed -E 's#(registry=https?://[^/]+).*#\1#' | tr '\n' ' ')"
done
grep -qsE '^\s*--?(extra-)?index-url' "$APPDIR/requirements.txt" && PRIVATE_REGISTRY="${PRIVATE_REGISTRY}pip-index "
PRIVATE_REGISTRY="$(printf '%s\n' $PRIVATE_REGISTRY | sort -u | tr '\n' ' ')"
HARDCODED=""
[ -n "$PLATFORM_DOMAIN" ] && HARDCODED="$(grep_src "$(printf '%s' "$PLATFORM_DOMAIN" | sed 's/\./\\./g')")"
HEADERS="$(grep_src 'x-forwarded-(email|user)|x-auth-request-(email|user)|cf-access-(authenticated-user-email|jwt-assertion)|x-goog-authenticated-user|x-ms-client-principal|x-amzn-oidc|remote-user|x-user-email')"

# Commit stats
C_TOTAL="$(git -C "$OUT/repo" rev-list --count HEAD 2>/dev/null || echo 0)"
C_SUBJECT=0
if [ -n "$EMAIL" ]; then
  C_SUBJECT="$(git -C "$OUT/repo" log --format='%ae' | grep -ciF "${EMAIL%@*}" || true)"
fi
C_FIRST="$(git -C "$OUT/repo" log --reverse --format='%as' | head -1)"
C_LAST="$(git -C "$OUT/repo" log -1 --format='%as')"
git -C "$OUT/repo" log --no-merges --format='%as %s' | grep -viE '^\S+ (wip|fix typo|merge|update readme|chore: bump)' | head -25 > "$OUT/commits-top.txt"

README_SUMMARY="(no README)"
for r in README.md readme.md README; do
  [ -f "$OUT/repo/$r" ] && README_SUMMARY="$(grep -vE '^\s*(#|!\[|<|\[!\[|$)' "$OUT/repo/$r" | head -6 | tr '\n' ' ' | cut -c1-600)" && break
done

# 4. Commands
RUNNER="$PM run"
INSTALL_CMD="$PM install"
PORT_DEFAULT=4321
BUILD_CMD="${P_BUILD:-${S_BUILD:+$RUNNER build}}"
if [ "$APP_TYPE" = dynamic ]; then START_CMD="${P_START:-$RUNNER start}"
else START_CMD="npx --yes serve -l \$PORT $OUT_DIR"; fi
[ "$FRAMEWORK" = static-html ] && { INSTALL_CMD="# no install needed"; BUILD_CMD=""; START_CMD="npx --yes serve -l \$PORT ."; }
if [ "$FRAMEWORK" = python ]; then
  INSTALL_CMD="python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt"
  has_file requirements.txt || INSTALL_CMD="python3 -m venv .venv && . .venv/bin/activate && pip install ."
  START_CMD="${P_START:-python3 app.py}"
fi

LOCAL_KEYS="PORT DATABASE_PATH"
{
  echo "# Local env for $APP (fill in; never commit real values)"
  echo "PORT=$PORT_DEFAULT"
  [ "$USES_SQLITE" = yes ] && echo "DATABASE_PATH=./local.db"
  for k in $ENV_KEYS; do case " $LOCAL_KEYS " in *" $k "*) ;; *) echo "$k=";; esac; done
} > "$OUT/.env.local.example"

# 5. Smoke / serve
SMOKE=skipped
free_port() { python3 -c 'import socket;s=socket.socket();s.bind(("",0));print(s.getsockname()[1]);s.close()'; }
if [ -n "$MODE" ]; then
  FREE="$(free_port)"
  LOGF="$OUT/smoke.log"; : > "$LOGF"
  set -a; . "$OUT/.env.local.example" 2>/dev/null; set +a
  PORT="$FREE"
  export PORT DATABASE_PATH="$APPDIR/local.db"
  (
    cd "$APPDIR" || exit 1
    if [ "$FRAMEWORK" != static-html ]; then
      log "installing"; eval "$INSTALL_CMD" >> "$LOGF" 2>&1 || { echo "INSTALL_FAILED" >> "$LOGF"; exit 3; }
    fi
    if [ -n "$BUILD_CMD" ]; then
      log "building"; eval "$BUILD_CMD" >> "$LOGF" 2>&1 || { echo "BUILD_FAILED" >> "$LOGF"; exit 4; }
    fi
  )
  prep=$?
  if [ "$prep" = 0 ]; then
    log "starting on :$PORT"
    (cd "$APPDIR" && { [ "$FRAMEWORK" != python ] || . .venv/bin/activate; } && eval "exec $START_CMD" >> "$LOGF" 2>&1) &
    PID=$!
    up=0
    for _ in $(seq 1 90); do
      code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://localhost:$PORT/" || true)"
      if [ -n "$code" ] && [ "$code" != 000 ] && [ "$code" -lt 500 ]; then up=1; break; fi
      kill -0 "$PID" 2>/dev/null || break
      sleep 1
    done
    if [ "$up" = 1 ]; then
      SMOKE=works
      printf '[{"id":"smoke","url":"http://localhost:%s/","type":"screenshot","viewport":[1440,900],"waitFor":2500}]' "$PORT" > "$OUT/smoke-job.json"
      node "$SKILL_DIR/scripts/capture.mjs" "$OUT/smoke-job.json" --out "$OUT" >/dev/null 2>&1 && log "screenshot: $OUT/smoke.png"
      rm -f "$OUT/smoke-job.json" "$OUT/capture-results.json"
    else
      if grep -qiE 'missing|required|undefined.*(key|token|secret)|api[_ ]?key|ECONNREFUSED' "$LOGF" && [ -n "$ENV_KEYS" ]; then SMOKE=needs-secrets; else SMOKE=broken; fi
    fi
    if [ "$MODE" = serve ] && [ "$up" = 1 ]; then
      echo "SERVING http://localhost:$PORT PID $PID"
    else
      pkill -P "$PID" 2>/dev/null; kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null
    fi
  else
    if grep -qiE 'E401|E403|401 Unauthorized|403 Forbidden|authentication' "$LOGF" && [ -n "$PRIVATE_REGISTRY" ]; then SMOKE=needs-registry-access
    elif [ -n "$ENV_KEYS" ] && grep -qiE 'token|auth|401|403' "$LOGF"; then SMOKE=needs-secrets
    else SMOKE=broken; fi
  fi
  log "smoke: $SMOKE (log: $LOGF)"
fi

# facts.json
F_APP="$APP" F_REPO="$REPO" F_REPO_URL="$REPO_URL" F_LIVE_URL="$LIVE_URL" F_PLATFORM="$PLATFORM" F_STATUS="$STATUS" \
F_FRAMEWORK="$FRAMEWORK" F_PM="$PM" F_TYPE="$APP_TYPE" F_ROOT_DIR="$ROOT_DIR" F_BUILD="$BUILD_CMD" F_START="$START_CMD" \
F_OUT_DIR="$OUT_DIR" F_ENV_KEYS="$ENV_KEYS" F_SQLITE="$USES_SQLITE" F_PORT_ENV="$USES_PORT_ENV" F_AI_ENDPOINT="$AI_ENDPOINT" \
F_REGISTRY="$PRIVATE_REGISTRY" F_PLATFORM_FILES="$PLATFORM_FILES" F_HARDCODED="$HARDCODED" F_HEADERS="$HEADERS" \
F_COMMITS="${C_TOTAL:-0}" F_SUBJECT_COMMITS="${C_SUBJECT:-0}" F_FIRST="$C_FIRST" F_LAST="$C_LAST" \
F_README="$README_SUMMARY" F_SMOKE="$SMOKE" \
node "$JSON" facts "$OUT/commits-top.txt" > "$OUT/facts.json"

# RUN-LOCALLY.md
PREREQS="- Node.js 20+"
[ "$PM" = bun ] && PREREQS="$PREREQS
- Bun (https://bun.sh); npm may work as a fallback"
[ "$PM" = pnpm ] && PREREQS="$PREREQS
- pnpm (\`corepack enable\`)"
[ "$FRAMEWORK" = python ] && PREREQS="- Python 3.11+"
[ -n "$PRIVATE_REGISTRY" ] && PREREQS="$PREREQS
- Access to the private package registry (\`$PRIVATE_REGISTRY\`): configure it in your user-level \`~/.npmrc\` / pip config, never in the repo"
[ -n "$AI_ENDPOINT" ] && PREREQS="$PREREQS
- An API key for the AI provider the app calls (it may use a company proxy in production)"

ENV_TABLE="| Variable | Purpose |
|----------|---------|
| \`PORT\` | Local port (platforms usually inject one) |"
[ "$USES_SQLITE" = yes ] && ENV_TABLE="$ENV_TABLE
| \`DATABASE_PATH\` | SQLite file; locally \`./local.db\` |"
for k in $ENV_KEYS; do
  case " $LOCAL_KEYS " in *" $k "*) ;; *) ENV_TABLE="$ENV_TABLE
| \`$k\` | Set in $PLATFORM's env/secrets in production; ask the app owner |";; esac
done

RUN_CMDS="set -a; . ./.env; set +a"
[ "$FRAMEWORK" = python ] && RUN_CMDS="$RUN_CMDS
. .venv/bin/activate"
[ -n "$BUILD_CMD" ] && RUN_CMDS="$RUN_CMDS
$BUILD_CMD"
RUN_CMDS="$RUN_CMDS
${START_CMD//\\\$PORT/\$PORT}"
[ -n "$S_DEV" ] && RUN_CMDS="$RUN_CMDS
# or, for development with hot reload:
$RUNNER dev"

DIFFS="- In production it runs on $PLATFORM${LIVE_URL:+ at \`$LIVE_URL\`}, possibly behind company SSO; locally there is no SSO."
[ -n "$PLATFORM_FILES" ] && DIFFS="$DIFFS
- Deploy config in the repo: \`$PLATFORM_FILES\`. Read it for build steps, routes, or services the platform provides."
[ "$USES_PORT_ENV" = no ] && [ "$APP_TYPE" = dynamic ] && DIFFS="$DIFFS
- The code does not read \`PORT\`; it listens on a hardcoded port (see Suggested patches)."
[ "$USES_SQLITE" = yes ] && DIFFS="$DIFFS
- Uses SQLite; locally you start with an empty database."
[ -n "$HARDCODED" ] && DIFFS="$DIFFS
- Hardcoded platform URLs (\`$PLATFORM_DOMAIN\`) in: \`$HARDCODED\`"
[ -n "$HEADERS" ] && DIFFS="$DIFFS
- Reads SSO identity headers in: \`$HEADERS\`. Locally these are missing; add a dev fallback user."
[ "$APP_TYPE" = static ] && DIFFS="$DIFFS
- Static app: serve \`$OUT_DIR/\` with any static server (\`npx serve\`)."

ROOT_DIR_CD=""; [ -n "$ROOT_DIR" ] && ROOT_DIR_CD="/$ROOT_DIR"

T_APP="$APP" T_PLATFORM="$PLATFORM" T_LIVE_URL="${LIVE_URL:-(none)}" T_REPO="$REPO_URL" T_STATUS="$STATUS" \
T_SMOKE="$SMOKE" T_DATE="$(date +%Y-%m-%d)" T_README_SUMMARY="$README_SUMMARY" T_PREREQS="$PREREQS" \
T_ROOT_DIR_CD="$ROOT_DIR_CD" T_INSTALL_CMD="$INSTALL_CMD" T_ENV_TABLE="$ENV_TABLE" T_RUN_CMDS="$RUN_CMDS" \
T_PORT="$PORT_DEFAULT" T_DIFFS="$DIFFS" T_OUT_DIR="$OUT_DIR" \
T_NOTES="_To be completed by the agent after reading the repo._" \
T_PATCHES="_To be completed by the agent (unified diffs, not applied)._" \
python3 - "$SKILL_DIR/templates/RUN-LOCALLY.md" "$OUT/RUN-LOCALLY.md" <<'PY'
import os, re, sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src).read()
t = re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: os.environ.get("T_" + m.group(1), m.group(0)), t)
open(dst, "w").write(t)
PY

log "wrote $OUT/RUN-LOCALLY.md and facts.json (smoke: $SMOKE)"
echo "$OUT"
