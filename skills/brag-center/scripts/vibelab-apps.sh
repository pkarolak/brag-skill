#!/usr/bin/env bash
# List Vibelab apps that belong to a person. JSON array on stdout, diagnostics on stderr.
# Usage: vibelab-apps.sh <email> [--login <github-login>] [--orgs miroapp-vibe,miroapp-dev]
set -euo pipefail

EMAIL="${1:?usage: vibelab-apps.sh <email> [--login gh-login] [--orgs a,b]}"; shift
LOGIN=""
ORGS="${VIBELAB_ORGS:-miroapp-vibe,miroapp-dev}"
while [ $# -gt 0 ]; do
  case "$1" in
    --login) LOGIN="$2"; shift 2 ;;
    --orgs) ORGS="$2"; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac
done

. "$(dirname "${BASH_SOURCE[0]}")/lib/vibelab-url.sh"
TOKEN_FILE="$HOME/.config/vibelab/token"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
echo '[]' > "$TMP/apps.json"

# 1. Vibelab app records
if [ -s "$TOKEN_FILE" ]; then
  code="$(curl -s -o "$TMP/raw.json" -w '%{http_code}' --connect-timeout 10 --max-time 30 \
    -H @<(printf 'Authorization: Bearer %s\n' "$(cat "$TOKEN_FILE")") "$VURL/vlapi/apps" || echo 000)"
  if [ "$code" = 200 ]; then
    cp "$TMP/raw.json" "$TMP/apps.json"
    echo "vibelab: app records fetched" >&2
  else
    echo "vibelab: GET /vlapi/apps returned $code (401/403 → run vibelab preflight; 000 → connect WARP). Falling back to GitHub only." >&2
  fi
else
  echo "vibelab: no token at $TOKEN_FILE; falling back to GitHub only" >&2
fi

# 2. Commit authorship in Vibelab orgs
: > "$TMP/repos.txt"
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  # Search API has a strict secondary rate limit: space queries out, retry once after a pause.
  search() {
    local q="$1" attempt
    for attempt in 1 2; do
      if gh api -X GET search/commits -f q="$q" -f per_page=100 --paginate \
           --jq '.items[] | .repository.full_name + "\t" + .sha' > "$TMP/q.txt" 2> "$TMP/q.err"; then
        grep -E '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+	[0-9a-f]+$' "$TMP/q.txt" >> "$TMP/repos.txt" || true
        return 0
      fi
      if grep -qi 'rate limit' "$TMP/q.err" && [ "$attempt" = 1 ]; then
        echo "github: rate limited on '$q', waiting 60s" >&2; sleep 60
      else
        echo "github: commit search failed for '$q': $(tail -1 "$TMP/q.err")" >&2; return 0
      fi
    done
  }
  IFS=',' read -ra org_list <<< "$ORGS"
  for org in "${org_list[@]}"; do
    for q in "author-email:$EMAIL org:$org" ${LOGIN:+"author:$LOGIN org:$org"}; do
      search "$q"; sleep 3
    done
  done
  # Dedupe by commit sha (email and login queries overlap), then count per repo.
  sort -u "$TMP/repos.txt" | cut -f1 | sort | uniq -c | awk '{print $2"\t"$1}' > "$TMP/repo-counts.tsv"
  echo "github: $(wc -l < "$TMP/repo-counts.tsv" | tr -d ' ') repos with commits by $EMAIL${LOGIN:+ / $LOGIN}" >&2
else
  : > "$TMP/repo-counts.tsv"
  echo "github: gh not authenticated; skipping commit matching" >&2
fi

# 3. Merge
node "$(dirname "${BASH_SOURCE[0]}")/lib/vibelab-merge.mjs" "$TMP/apps.json" "$TMP/repo-counts.tsv" "$EMAIL" "$VURL"
