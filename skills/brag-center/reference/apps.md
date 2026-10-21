# Deployed apps: the strongest proof

A working app the person shipped beats any doc describing it. Every app they built becomes a project cluster seed, gets cloned locally, and gets a `RUN-LOCALLY.md` so it outlives the platform it runs on.

The platform can be anything: a public PaaS (Vercel, Netlify, Render, Fly.io, Replit, Streamlit…), or an internal app platform the org built. The skill doesn't assume one; it uses what [connections.md](connections.md) found or the user pointed to.

## 1. Collect app records → `evidence/apps.json`

Use the platform's own access path (MCP tools, CLI, API, a list page, or URLs the user pasted). Normalize every record into:

```json
[{ "name": "standup-bot", "url": "https://standup-bot.example.app/", "platform": "Vercel",
   "owner": "jane@acme.com", "repo": "acme/standup-bot", "status": "running",
   "meta": { "rootDir": "", "build": "npm run build", "start": "npm start", "runtime": "node", "envKeys": ["SLACK_TOKEN"] } }]
```

Only `name` or `url` is required. Keep env var **names** only, never values. If the platform has no owner field, leave `owner` out.

Platform tips (examples):

- **Vercel**: `vercel project ls`, `vercel ls <project>`; the Git repo is in project settings.
- **Netlify**: `netlify sites:list --json` (has `build_settings.repo_url`).
- **Render / Fly / Heroku**: their CLIs list services/apps with repo links where configured.
- **Internal platform**: its MCP or skill if one exists; else its API with the token location the user gave. Call only the base URL the user confirmed; send the token only to that host.
- **Just URLs**: name = first hostname label; find repos with code search (step 2) or ask.

## 2. Match to the person

```bash
bash "$SKILL_DIR/scripts/repos-by-author.sh" "<email>" [--login <gh-login>] [--orgs <org1,org2>] [--since <YYYY-MM-DD>] > evidence/repos.json
node "$SKILL_DIR/scripts/app-candidates.mjs" evidence/apps.json --email "<email>" [--login <username>] --repos evidence/repos.json [--keep-unowned] > evidence/app-candidates.json
```

- `repos-by-author.sh` uses `gh` commit search (GitHub only). For GitLab/Bitbucket/other hosts, use their MCP/CLI and write the same `[{repo, commits, first, last}]` shape.
- Matching: owner fields equal to the email, its local part, or `--login` (many platforms store usernames), then `contributors[]`, then repos with commits by the person. `--keep-unowned` keeps records without owner info (use it when the user pasted the list).
- If commit search returns nothing, ask for the person's GitHub login and rerun with `--login`.

Show candidates (name, live URL, platform, match reason, commit count) in one multi-select `AskQuestion`; preselect all.

## 3. Localize: `scripts/app-localize.sh`

```bash
bash "$SKILL_DIR/scripts/app-localize.sh" "<name>" "<run-dir>" --repo <owner/name|git-url> [--url <live-url>] \
  [--platform "<Platform name>"] [--meta projects/<name>/meta.json] [--email "<email>"] [--smoke | --serve]
```

Write the record's `meta` to `projects/<name>/meta.json` first if you have it. The script:

1. Clones into `projects/<name>/repo` (blobless; `gh` for GitHub `owner/name`, plain `git` for other URLs using the user's own git credentials), then disables push.
2. Analyzes: package manager, framework, scripts, deploy config files (`vercel.json`, `netlify.toml`, `fly.toml`, `Dockerfile`, unknown `*.toml`/`*.yaml` descriptors…), env var names, SQLite, `PORT` handling, custom AI endpoints, private package registries, SSO identity headers, hardcoded platform URLs (derived from the live URL's domain), commit stats.
3. Writes `projects/<name>/facts.json`, `.env.local.example`, and `RUN-LOCALLY.md` from `templates/RUN-LOCALLY.md`.
4. `--smoke`: installs, builds, starts on a free port with local env, waits up to 90 s for HTTP < 500, screenshots to `smoke.png`, stops. Result `works | needs-secrets | needs-registry-access | broken`.
5. `--serve`: same but leaves it running and prints `SERVING http://localhost:<port> PID <pid>` (for screen recordings when the live app is down or behind SSO). Kill the PID when done.

No repo? Skip localizing; the live URL still feeds screenshots and loops.

## 4. Refine `RUN-LOCALLY.md` (agent step)

Read the repo and the deploy config, then complete:

- **Notes**: anything non-obvious: seed data, external APIs, auth assumptions, services the platform provides (managed DB, queues, AI proxy, auth), what an internal platform injects at runtime.
- **Suggested patches**: unified diffs only, never applied. Typical: hardcoded port → `process.env.PORT || 3000`; SQLite path → env var with local default; SSO identity headers → local dev fallback user; company AI proxy → document using a personal key; private registry → user-level config instructions (no tokens in files).
- Production data: never download it by default. If the user owns the app and asks, use the platform's own export and warn that it may contain personal data; never copy it into the site.

## Story value

From `facts.json`: commit count, active span, first/last commit, top commit messages, README summary, live URL, smoke screenshot. Use for project `meta`, timeline entries, and proof shots ("42 commits over 5 months, live at …"). Set the project's `app` field in `story.json`.

## Rules

- Read-only: never push, redeploy, or change platform settings.
- Don't apply suggested patches to the clone.
- Don't copy secrets or `.env` values anywhere.
