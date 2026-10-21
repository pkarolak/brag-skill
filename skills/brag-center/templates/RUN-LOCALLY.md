# Run {{APP}} locally (outside {{PLATFORM}})

- Live: {{LIVE_URL}}
- Repo: {{REPO}}
- Status on {{PLATFORM}} at snapshot: {{STATUS}}
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

## Differences from {{PLATFORM}}

{{DIFFS}}

## Notes

{{NOTES}}

## Suggested patches (not applied)

{{PATCHES}}

## Troubleshooting

- Port in use: `lsof -ti:{{PORT}} | xargs kill` or run with `PORT=<other>`.
- Install fails with 401/403: the app uses a private package registry; configure access in your user-level config, never commit tokens.
- AI calls fail: production may route through a company proxy; set your own provider key and unset any `*_BASE_URL` override.
- Blank page on a static app: make sure you ran the build and are serving the output dir ({{OUT_DIR}}).
- Smoke log: `smoke.log` next to this file.
