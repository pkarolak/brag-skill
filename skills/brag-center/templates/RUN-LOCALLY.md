# Run {{APP}} locally (outside Vibelab)

- Live (Vibelab): {{LIVE_URL}}
- Repo: {{REPO}}
- Status on Vibelab at snapshot: {{STATUS}}
- Local smoke test: **{{SMOKE}}**
- Snapshot: {{DATE}}

## What it is

{{README_SUMMARY}}

## Prerequisites

{{PREREQS}}

## One-time setup

```bash
cd repo{{ROOT_DIR_CD}}
{{INSTALL_CMD}}
cp ../.env.local.example .env   # fill in values, see below
```

## Environment

{{ENV_TABLE}}

## Run

```bash
{{RUN_CMDS}}
```

Open http://localhost:{{PORT}}

## Differences from Vibelab

{{DIFFS}}

## Notes

{{NOTES}}

## Suggested patches (not applied)

{{PATCHES}}

## Troubleshooting

- Port in use: `lsof -ti:{{PORT}} | xargs kill` or run with `PORT=<other>`.
- `@mirohq-internal` install fails: configure Artifactory in `~/.npmrc` (see internal docs); never commit tokens.
- Managed AI calls fail: connect Cloudflare WARP, or set your own `OPENAI_API_KEY` and unset `OPENAI_BASE_URL`.
- Blank page on a static app: make sure you ran the build and are serving the output dir ({{OUT_DIR}}).
- Smoke log: `smoke.log` next to this file.
