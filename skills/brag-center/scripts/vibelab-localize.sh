#!/usr/bin/env bash
# Clone a Vibelab app read-only, analyze how it depends on Vibelab, write RUN-LOCALLY.md,
# and optionally smoke-run or serve it locally.
# Usage: vibelab-localize.sh <app> <run-dir> [--email <subject-email>] [--repo owner/name] [--smoke | --serve]
set -uo pipefail

APP="${1:?usage: vibelab-localize.sh <app> <run-dir> [--email e] [--repo o/n] [--smoke|--serve]}"
RUN="${2:?run dir required}"; shift 2
EMAIL=""; REPO=""; MODE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --email) EMAIL="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --smoke) MODE=smoke; shift ;;
    --serve) MODE=serve; shift ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac
done

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$SKILL_DIR/scripts/lib/vibelab-url.sh"
TOKEN_FILE="$HOME/.config/vibelab/token"
RUN="$(cd "$RUN" && pwd)"
OUT="$RUN/projects/$APP"
mkdir -p "$OUT"
log() { echo "[$APP] $*" >&2; }

# 1. App record
echo '{}' > "$OUT/app.json"
if [ -s "$TOKEN_FILE" ]; then
  code="$(curl -s -o "$OUT/app.json.tmp" -w '%{http_code}' --connect-timeout 10 --max-time 30 \
    -H @<(printf 'Authorization: Bearer %s\n' "$(cat "$TOKEN_FILE")") "$VURL/vlapi/apps/$APP" || echo 000)"
  if [ "$code" = 200 ]; then mv "$OUT/app.json.tmp" "$OUT/app.json"; log "app record fetched"
  else rm -f "$OUT/app.json.tmp"; log "app record unavailable (HTTP $code); continuing from repo only"; fi
else
  log "no Vibelab token; continuing from repo only"
fi
JSON="$SKILL_DIR/scripts/lib/json.mjs"
jget() { node "$JSON" get "$OUT/app.json" "$@" 2>/dev/null; }

if [ -z "$REPO" ]; then
  REPO="$(jget .repo_url .repo | sed -E 's#^https?://github.com/##; s#\.git$##')"
fi
if [ -z "$REPO" ]; then
  for org in ${VIBELAB_ORGS//,/ } miroapp-vibe miroapp-dev; do
    for cand in "$org/$APP" "$org/vlab-$APP"; do
      gh repo view "$cand" >/dev/null 2>&1 && { REPO="$cand"; break 2; }
    done
  done
fi
[ -n "$REPO" ] || { log "could not resolve repo; pass --repo owner/name"; exit 1; }

LIVE_URL="$(jget '.url')"; [ -n "$LIVE_URL" ] || LIVE_URL="https://$APP.vibelab.miro.tools/"
STATUS="$(jget '.status')"; [ -n "$STATUS" ] || STATUS="unknown"
ROOT_DIR="$(jget '.root_dir')"
V_BUILD="$(jget '.build_command')"
V_START="$(jget '.start_command')"
V_RUNTIME="$(jget '.runtime')"

# 2. Clone (blobless, push disabled)
if [ -d "$OUT/repo/.git" ]; then
  log "repo exists; fetching"
  git -C "$OUT/repo" fetch --quiet origin && git -C "$OUT/repo" pull --quiet --ff-only || true
else
  log "cloning $REPO"
  gh repo clone "$REPO" "$OUT/repo" -- --filter=blob:none --quiet || { log "clone failed"; exit 1; }
fi
git -C "$OUT/repo" remote set-url --push origin DISABLED-read-only-brag-center

APPDIR="$OUT/repo${ROOT_DIR:+/$ROOT_DIR}"
[ -d "$APPDIR" ] || APPDIR="$OUT/repo"
PKG="$APPDIR/package.json"

# 3. Analyze
has_file() { [ -f "$APPDIR/$1" ]; }
pkg() { [ -f "$PKG" ] && node "$JSON" get "$PKG" "$1" 2>/dev/null; }
dep() { [ -f "$PKG" ] && node "$JSON" has-dep "$PKG" "$1" 2>/dev/null; }
grep_src() { grep -rIlE "$1" "$APPDIR" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' --include='*.cjs' --include='*.jsx' --include='*.py' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next 2>/dev/null | head -5; }

PM=npm
{ has_file bun.lockb || has_file bun.lock; } && PM=bun
has_file pnpm-lock.yaml && PM=pnpm
has_file yarn.lock && PM=yarn
[ "$V_RUNTIME" = bun ] && PM=bun

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
has_file requirements.txt && FRAMEWORK=python

S_BUILD="$(pkg '.scripts.build')"; S_START="$(pkg '.scripts.start')"; S_DEV="$(pkg '.scripts.dev')"
TOML_TYPE=""; has_file vibelab.toml && TOML_TYPE="$(grep -E '^\s*type\s*=' "$APPDIR/vibelab.toml" | sed -E 's/.*"(.*)".*/\1/')"
APP_TYPE=static
{ [ -n "$S_START" ] || [ -n "$V_START" ]; } && APP_TYPE=dynamic
[ -n "$TOML_TYPE" ] && APP_TYPE="$TOML_TYPE"

OUT_DIR="."
for d in dist build out public; do
  case "$FRAMEWORK:$d" in vite:dist|astro:dist|cra:build|next:out) OUT_DIR="$d";; esac
done
[ "$FRAMEWORK" = node ] || [ "$FRAMEWORK" = static-html ] || true

ENV_KEYS=""
for f in .env.example .env.sample .env.template; do
  has_file "$f" && ENV_KEYS="$(grep -E '^[A-Z_][A-Z0-9_]*=' "$APPDIR/$f" | cut -d= -f1 | sort -u | tr '\n' ' ')" && break
done

USES_SQLITE=no
{ dep better-sqlite3 || dep sqlite3 || dep drizzle-orm || dep @libsql/client || [ -n "$(grep_src 'bun:sqlite|DATABASE_PATH')" ]; } && USES_SQLITE=yes
USES_PORT_ENV=no; [ -n "$(grep_src 'process\.env\.PORT|Bun\.env\.PORT|env\.PORT')" ] && USES_PORT_ENV=yes
USES_AI_PROXY=no; [ -n "$(grep_src 'vlapi/(openai|anthropic)|OPENAI_BASE_URL|ANTHROPIC_BASE_URL')" ] && USES_AI_PROXY=yes
dep openai && [ "$USES_AI_PROXY" = no ] && USES_AI_PROXY=maybe
USES_INTERNAL_PKGS=no; [ -f "$PKG" ] && grep -q '@mirohq-internal' "$PKG" && USES_INTERNAL_PKGS=yes
HARDCODED_VIBELAB="$(grep_src 'vibelab\.miro\.tools' | sed "s#$OUT/repo/##" | tr '\n' ' ')"
VIBELAB_HEADERS="$(grep_src 'x-vibelab|x-forwarded-email|x-auth-request-email|cf-access-authenticated-user-email' | sed "s#$OUT/repo/##" | tr '\n' ' ')"

# Commit stats
C_TOTAL="$(git -C "$OUT/repo" rev-list --count HEAD 2>/dev/null || echo 0)"
C_SUBJECT=0
if [ -n "$EMAIL" ]; then
  C_SUBJECT="$(git -C "$OUT/repo" log --format='%ae' | grep -ci "^${EMAIL%@*}" || true)"
fi
C_FIRST="$(git -C "$OUT/repo" log --reverse --format='%as' | head -1)"
C_LAST="$(git -C "$OUT/repo" log -1 --format='%as')"
git -C "$OUT/repo" log --no-merges --format='%as %s' | grep -viE '^\S+ (wip|fix typo|merge|update readme|chore: bump)' | head -25 > "$OUT/commits-top.txt"

README_SUMMARY="(no README)"
for r in README.md readme.md README; do
  [ -f "$OUT/repo/$r" ] && README_SUMMARY="$(grep -vE '^\s*(#|!\[|<|\[!\[|$)' "$OUT/repo/$r" | head -6 | tr '\n' ' ' | cut -c1-600)" && break
done

# 4. Commands
RUNNER="$PM run"; [ "$PM" = npm ] && RUNNER="npm run"
INSTALL_CMD="$PM install"
PORT_DEFAULT=4321
if [ "$APP_TYPE" = dynamic ]; then
  BUILD_CMD="${V_BUILD:-${S_BUILD:+$RUNNER build}}"
  START_CMD="${V_START:-$RUNNER start}"
else
  BUILD_CMD="${V_BUILD:-${S_BUILD:+$RUNNER build}}"
  START_CMD="npx --yes serve -l \$PORT $OUT_DIR"
fi
[ "$FRAMEWORK" = static-html ] && { INSTALL_CMD="# no install needed"; BUILD_CMD=""; START_CMD="npx --yes serve -l \$PORT ."; }
[ "$FRAMEWORK" = python ] && { INSTALL_CMD="python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt"; START_CMD="${V_START:-python3 app.py}"; }

# .env.local.example
{
  echo "# Local env for $APP (fill in; never commit real values)"
  echo "PORT=$PORT_DEFAULT"
  [ "$USES_SQLITE" = yes ] && echo "DATABASE_PATH=./local.db"
  if [ "$USES_AI_PROXY" != no ]; then
    echo "# Managed AI via Vibelab proxy (needs WARP) — or replace with your own key and remove BASE_URL"
    echo "OPENAI_BASE_URL=$VURL/vlapi/openai/v1"
    echo "OPENAI_API_KEY=unused"
    echo "ANTHROPIC_BASE_URL=$VURL/vlapi/anthropic"
    echo "ANTHROPIC_API_KEY=unused"
  fi
  for k in $ENV_KEYS; do
    case "$k" in PORT|DATABASE_PATH|OPENAI_BASE_URL|OPENAI_API_KEY|ANTHROPIC_BASE_URL|ANTHROPIC_API_KEY) ;; *) echo "$k=";; esac
  done
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
    if [ "$FRAMEWORK" != static-html ] && [ "$FRAMEWORK" != python ]; then
      log "installing ($PM)"; $INSTALL_CMD >> "$LOGF" 2>&1 || { echo "INSTALL_FAILED" >> "$LOGF"; exit 3; }
    fi
    if [ -n "$BUILD_CMD" ]; then
      log "building"; eval "$BUILD_CMD" >> "$LOGF" 2>&1 || { echo "BUILD_FAILED" >> "$LOGF"; exit 4; }
    fi
  )
  prep=$?
  if [ "$prep" = 0 ]; then
    log "starting on :$PORT"
    (cd "$APPDIR" && eval "exec $START_CMD" >> "$LOGF" 2>&1) &
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
    if [ -n "$ENV_KEYS" ] && grep -qiE 'token|auth|401|403' "$LOGF"; then SMOKE=needs-secrets; else SMOKE=broken; fi
  fi
  log "smoke: $SMOKE (log: $LOGF)"
fi

# facts.json
F_APP="$APP" F_REPO="$REPO" F_LIVE_URL="$LIVE_URL" F_STATUS="$STATUS" F_FRAMEWORK="$FRAMEWORK" F_PM="$PM" \
F_TYPE="$APP_TYPE" F_ROOT_DIR="$ROOT_DIR" F_BUILD="$BUILD_CMD" F_START="$START_CMD" F_OUT_DIR="$OUT_DIR" \
F_ENV_KEYS="$ENV_KEYS" F_SQLITE="$USES_SQLITE" F_PORT_ENV="$USES_PORT_ENV" F_AI_PROXY="$USES_AI_PROXY" \
F_INTERNAL_PKGS="$USES_INTERNAL_PKGS" F_HARDCODED="$HARDCODED_VIBELAB" F_HEADERS="$VIBELAB_HEADERS" \
F_COMMITS="${C_TOTAL:-0}" F_SUBJECT_COMMITS="${C_SUBJECT:-0}" F_FIRST="$C_FIRST" F_LAST="$C_LAST" \
F_README="$README_SUMMARY" F_SMOKE="$SMOKE" \
node "$JSON" facts "$OUT/commits-top.txt" > "$OUT/facts.json"

# RUN-LOCALLY.md
PREREQS="- Node.js 20+"
[ "$PM" = bun ] && PREREQS="$PREREQS
- Bun (\`brew install oven-sh/bun/bun\`); npm may work as a fallback"
[ "$PM" = pnpm ] && PREREQS="$PREREQS
- pnpm (\`corepack enable\`)"
[ "$FRAMEWORK" = python ] && PREREQS="- Python 3.11+"
[ "$USES_INTERNAL_PKGS" = yes ] && PREREQS="$PREREQS
- Artifactory access for \`@mirohq-internal\` packages (configure \`~/.npmrc\`)"
[ "$USES_AI_PROXY" != no ] && PREREQS="$PREREQS
- Cloudflare WARP connected (managed AI proxy), or your own API key"

ENV_TABLE="| Variable | Purpose |
|----------|---------|
| \`PORT\` | Local port (Vibelab injects one in 4002-4999) |"
[ "$USES_SQLITE" = yes ] && ENV_TABLE="$ENV_TABLE
| \`DATABASE_PATH\` | SQLite file. Vibelab uses \`/pod/vibelab-db/$APP/app.db\`; locally \`./local.db\` |"
[ "$USES_AI_PROXY" != no ] && ENV_TABLE="$ENV_TABLE
| \`OPENAI_BASE_URL\` / \`OPENAI_API_KEY\` | Managed proxy (\`unused\` key, WARP on) or your own key |"
for k in $ENV_KEYS; do
  case "$k" in PORT|DATABASE_PATH|OPENAI_BASE_URL|OPENAI_API_KEY|ANTHROPIC_BASE_URL|ANTHROPIC_API_KEY) ;;
  *) ENV_TABLE="$ENV_TABLE
| \`$k\` | Listed in \`.env.example\`; real value lives in Vibelab Env & Secrets (ask the app owner) |";; esac
done

RUN_CMDS="set -a; . ./.env; set +a"
[ -n "$BUILD_CMD" ] && RUN_CMDS="$RUN_CMDS
$BUILD_CMD"
RUN_CMDS="$RUN_CMDS
${START_CMD//\\\$PORT/\$PORT}"
[ -n "$S_DEV" ] && RUN_CMDS="$RUN_CMDS
# or, for development with hot reload:
$RUNNER dev"

DIFFS="- Vibelab serves at \`https://$APP.vibelab.miro.tools\` behind Miro SSO; locally there is no SSO."
[ "$USES_PORT_ENV" = no ] && [ "$APP_TYPE" = dynamic ] && DIFFS="$DIFFS
- The code does not read \`PORT\` explicitly; Vibelab patches listen calls at runtime. Locally it uses its hardcoded port (see Suggested patches)."
[ "$USES_SQLITE" = yes ] && DIFFS="$DIFFS
- Vibelab backs up SQLite at \`DATABASE_PATH\`; locally you start with an empty DB unless you download a snapshot (owner only): \`curl -H \"Authorization: Bearer \$(cat ~/.config/vibelab/token)\" $VURL/vlapi/apps/$APP/sqlite/download -o local.db\`"
[ -n "$HARDCODED_VIBELAB" ] && DIFFS="$DIFFS
- Hardcoded Vibelab URLs in: \`$HARDCODED_VIBELAB\`"
[ -n "$VIBELAB_HEADERS" ] && DIFFS="$DIFFS
- Reads SSO identity headers in: \`$VIBELAB_HEADERS\`. Locally these are missing; add a dev fallback user."
[ "$APP_TYPE" = static ] && DIFFS="$DIFFS
- Static app: Vibelab serves \`$OUT_DIR/\` with Caddy; locally use \`npx serve\`."

ROOT_DIR_CD=""; [ -n "$ROOT_DIR" ] && ROOT_DIR_CD="/$ROOT_DIR"

T_APP="$APP" T_LIVE_URL="$LIVE_URL" T_REPO="https://github.com/$REPO" T_STATUS="$STATUS" \
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
