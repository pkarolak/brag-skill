#!/usr/bin/env bash
# Repos a person committed to, ranked by commit count (GitHub via gh). JSON array on stdout, diagnostics on stderr.
# Usage: repos-by-author.sh <email> [--login <github-login>] [--orgs org1,org2] [--since YYYY-MM-DD]
set -euo pipefail

EMAIL="${1:?usage: repos-by-author.sh <email> [--login gh-login] [--orgs a,b] [--since YYYY-MM-DD]}"; shift
LOGIN=""; ORGS=""; SINCE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --login) LOGIN="$2"; shift 2 ;;
    --orgs) ORGS="$2"; shift 2 ;;
    --since) SINCE="$2"; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ "$SINCE" =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2})?$ ]] || { echo "--since must be YYYY-MM-DD" >&2; exit 2; }

if ! command -v gh >/dev/null || ! gh auth status >/dev/null 2>&1; then
  echo "github: gh not authenticated; nothing to search" >&2
  echo '[]'; exit 0
fi

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
: > "$TMP/repos.txt"

# Search API has a strict secondary rate limit: space queries out, retry once after a pause.
search() {
  local q="$1" attempt
  for attempt in 1 2; do
    if gh api -X GET search/commits -f q="$q" -f per_page=100 --paginate \
         --jq '.items[] | .repository.full_name + "\t" + .sha + "\t" + (.commit.author.date[0:10])' > "$TMP/q.txt" 2> "$TMP/q.err"; then
      grep -E '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+	[0-9a-f]+	' "$TMP/q.txt" >> "$TMP/repos.txt" || true
      return 0
    fi
    if grep -qi 'rate limit' "$TMP/q.err" && [ "$attempt" = 1 ]; then
      echo "github: rate limited on '$q', waiting 60s" >&2; sleep 60
    else
      echo "github: commit search failed for '$q': $(tail -1 "$TMP/q.err")" >&2; return 0
    fi
  done
}

DATE_Q="${SINCE:+ committer-date:>=$SINCE}"
WHO=("author-email:$EMAIL")
[ -n "$LOGIN" ] && WHO+=("author:$LOGIN")
if [ -n "$ORGS" ]; then
  IFS=',' read -ra org_list <<< "$ORGS"
  for org in "${org_list[@]}"; do
    for w in "${WHO[@]}"; do search "$w org:$org$DATE_Q"; sleep 3; done
  done
else
  for w in "${WHO[@]}"; do search "$w$DATE_Q"; sleep 3; done
fi

# Dedupe by sha (email and login queries overlap), then aggregate per repo.
sort -u -t$'\t' -k2,2 "$TMP/repos.txt" | node -e '
  const rows = require("fs").readFileSync(0, "utf8").split("\n").filter(Boolean).map((l) => l.split("\t"));
  const by = new Map();
  for (const [repo, , date] of rows) {
    const r = by.get(repo) ?? { repo, commits: 0, first: date, last: date };
    r.commits++; if (date < r.first) r.first = date; if (date > r.last) r.last = date;
    by.set(repo, r);
  }
  const out = [...by.values()].sort((a, b) => b.commits - a.commits);
  console.error(`github: ${out.length} repos with commits`);
  console.log(JSON.stringify(out, null, 2));
'
