# Vibelab: primary source of truth

A working app the person shipped beats any doc describing it. Every Vibelab app they built becomes a project cluster seed, gets cloned locally, and gets a `RUN-LOCALLY.md` so it outlives Vibelab.

## Prerequisites

- Cloudflare WARP connected (`warp-cli status` → Connected).
- Token at `~/.config/vibelab/token` (run the vibelab skill's `scripts/preflight.sh` if missing).
- `gh auth status` OK with access to `miroapp-vibe` / `miroapp-dev`.
- Base URL: `${VIBELAB_URL:-https://vibelab.miro.tools}`.

## 1. Find apps: `scripts/vibelab-apps.sh <email>`

Outputs JSON array to stdout:

```json
[{ "name": "standup-bot", "url": "https://standup-bot.vibelab.miro.tools/", "status": "running",
   "repo": "miroapp-vibe/standup-bot", "match": "owner|commits", "commits": 42 }]
```

Matching order:
1. Owner-like fields on `GET /vlapi/apps` records (`owner`, `owner_email`, `created_by`, `user.email`, `author`), compared case-insensitively to the email and its local part.
2. Commit authorship: `gh api search/commits` with `author-email:<email> org:<org>` for each org in `VIBELAB_ORGS` (default `miroapp-vibe,miroapp-dev`). Repo `vlab-foo` / `foo` → app `foo`.

The script prints diagnostics to stderr. If the API returns 401, re-run the vibelab skill preflight. If commit search returns nothing, ask the user for the person's GitHub login and rerun with `--login <login>`.

## 2-5. Localize: `scripts/vibelab-localize.sh <app> <run-dir> [--email e] [--smoke] [--serve]`

Does:
1. `GET /vlapi/apps/<app>` → `projects/<app>/app.json` (repo_url, build/start commands, runtime, root_dir, status, url).
2. `gh repo clone` into `projects/<app>/repo` (blobless), then disables push: `git remote set-url --push origin DISABLED`.
3. Analyzes: package manager, framework, scripts, `vibelab.toml`, `.env.example` keys, SQLite usage, `PORT` handling, managed AI proxy use, `@mirohq-internal` deps, static output dir, commit stats (total, by subject, first/last date, top messages).
4. Writes `projects/<app>/facts.json`, `projects/<app>/.env.local.example`, and `projects/<app>/RUN-LOCALLY.md` from `templates/RUN-LOCALLY.md`.
5. `--smoke`: installs, builds if needed, starts on a free port with local env (`PORT`, `DATABASE_PATH=./local.db`), waits up to 90 s for HTTP < 500, screenshots to `projects/<app>/smoke.png`, stops. Result `works | needs-secrets | broken` goes into facts.json and the doc.
6. `--serve`: same as smoke but leaves it running and prints `SERVING http://localhost:<port> PID <pid>` (used for screen recordings when the live app is down). Kill the PID when done.

## Refining `RUN-LOCALLY.md` (agent step)

After the script, read the repo and complete:

- **Notes**: anything non-obvious (seed data, external APIs, auth assumptions like Vibelab SSO headers, hardcoded `*.vibelab.miro.tools` URLs).
- **Suggested patches**: unified diffs only, never applied. Typical:
  - Hardcoded port → `process.env.PORT || 3000`
  - SQLite path → `process.env.DATABASE_PATH || './local.db'`
  - Relies on Vibelab-injected identity headers → add a local dev fallback user
  - Managed AI proxy → document `OPENAI_BASE_URL=https://vibelab.miro.tools/vlapi/openai/v1`, `OPENAI_API_KEY=unused` (VPN) or a personal key
  - `@mirohq-internal` packages → Artifactory `.npmrc` instructions (no tokens in files)
- SQLite data: if the user owns the app and wants realistic data, offer `curl -H "Authorization: Bearer $(cat ~/.config/vibelab/token)" "$VIBELAB_URL/vlapi/apps/<app>/sqlite/download" -o projects/<app>/repo/local.db`. Warn that it may contain personal data; never copy it into the site.

## Story value

From facts.json: commit count, active span, first/last commit, top commit messages, README summary, live URL, smoke screenshot. Use for project `meta`, timeline entries, and proof shots ("42 commits over 5 months, live at …").

## Rules

- Read-only: never push, never redeploy, never change Vibelab settings.
- Don't apply suggested patches to the clone.
- Don't copy secrets or `.env` values anywhere.
