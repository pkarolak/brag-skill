# Brag Center

An agent skill that turns an employee's email into a bespoke, local portfolio site of case studies, built from the sources your agent is already connected to.

**Landing page:** https://brag-skill.vercel.app/

- **Evidence**: Glean, Vibelab, Jira, Confluence, Slack, Figma, GitHub / Origin, Miro
- **Story**: 3-6 outcome-first case studies, an impact strip, real testimonials, a timeline. Flattering framing, with every claim tagged `sourced` / `inferred` / `embellished` in a private review file.
- **Media**: screenshots, screen-grab loops of live apps, Figma frame exports, and a "Behind the work" gallery of proof screenshots on every case study.
- **Vibelab as source of truth**: the person's apps are cloned read-only, analyzed, smoke-run, and documented in `RUN-LOCALLY.md` so they run outside Vibelab.
- **Design**: styled from a reference you give, or derived from the person's discipline, with [tasteskill](https://tasteskill.dev) as the anti-slop rulebook. Never Miro-branded.
- **Password protection**: the skill asks whether to protect the case studies or the whole site, and for the password. Protected content and media are encrypted in the build (AES-GCM, PBKDF2 key), not just hidden; the password is never written to disk. PDFs get the same password when `qpdf` is installed.
- **Extras**: PDF export, copying Miro boards into any account or org, optional Vibelab publish.

## Install

```bash
npx skills add pkarolak/brag-skill            # project-level
npx skills add pkarolak/brag-skill -g         # global, for every project
```

The CLI detects your agent (Cursor, Claude Code, Codex, Gemini CLI, …) and links `skills/brag-center` into its skills folder. Manual alternative: clone this repo and symlink `skills/brag-center` into `~/.cursor/skills/` (or your agent's equivalent).

### What it needs

The preflight checks and reports. It installs the skill's npm packages and ffmpeg; it doesn't download browsers or add other skills unless you say yes.

| | Needed? | Notes |
|---|---|---|
| Node 20+ | Required | |
| `playwright-core`, `ajv` | Required | ~16 MB, installed inside the skill folder on first run |
| Google Chrome or Edge | For screenshots, loops, PDF | Reuses the one you have. If neither is installed, it asks before downloading Playwright's Chromium (~300 MB), or falls back to the agent's own browser tool |
| `gh` (signed in) | For Vibelab clones and code history | Skipped with a warning if missing |
| tasteskill | Optional | Used if your agent already has it; otherwise the skill asks once and falls back to a built-in checklist |
| ffmpeg | Required for loops | Installed via Homebrew if missing; trims and compresses screen recordings to mp4. If the install fails, loops stay webm + poster |

Defaults adapt to the agent running the skill (Cursor, Claude Code, Codex, Gemini CLI): which skills folder to look in for tasteskill, where to install it if you agree, and which built-in browser tool to fall back on.

Recommended connections: Glean, Atlassian, Slack, Figma, and Miro MCPs; `gh auth login`; Cloudflare WARP plus the [vibelab skill](https://vibelab.miro.tools) preflight (it creates `~/.config/vibelab/token`). Missing sources are skipped and listed in the review file.

## Use

In your agent:

```
brag center for jane.doe@miro.com
brag center for jane.doe@miro.com — angle: promotion case for Staff, focus on AI tooling
brag center for jane.doe@miro.com, style like https://some-portfolio.com
```

The skill asks one intake question (angle, style reference, time window), lists the Vibelab apps it found for you to confirm, and offers Figma downloads. When it finishes you get:

```
brag-jane-20261020/
  site/                    Vite + React portfolio → http://localhost:5180
  projects/<app>/          read-only clones + RUN-LOCALLY.md + smoke.png + facts.json
  assets/figma/<file>/     frame renders, source images, SVGs, manifest.json
  evidence/                raw evidence per source
  story.json  narrative.md DESIGN.md  REVIEW.md
  exports/                 PDFs and Miro bundles (on request)
```

**Read `REVIEW.md` before sharing.** It lists embellished and inferred claims, softened confidential details, screenshots that may show sensitive data, and which Figma files need a manual "Save local copy".

## Scripts (run by the skill; usable on their own)

Paths are relative to `skills/brag-center/`.

| Script | What it does |
|--------|--------------|
| `scripts/check-env.sh [--agent a] [--install browser,taste]` | Check-only preflight; opt-in installs |
| `scripts/new-run.sh <first>` | Create the run folder |
| `scripts/vibelab-apps.sh <email> [--login gh]` | Find a person's Vibelab apps (owner field, then commit authorship) |
| `scripts/vibelab-localize.sh <app> <run> [--smoke\|--serve]` | Clone read-only, analyze, write `RUN-LOCALLY.md`, smoke-run |
| `scripts/figma-fetch.mjs <spec> --run <run> [--publish]` | Download `download_assets` URLs, write the manifest |
| `scripts/capture.mjs <jobs.json> --out <dir>` | Screenshots + scroll recordings (`--login` for SSO, `--svg` to render SVG, `--review` for QA shots) |
| `scripts/to-loop.sh *.webm` | webm → trimmed mp4 loop + poster (ffmpeg) |
| `scripts/scaffold-site.sh <run> [--example]` | Create the site from `templates/site` |
| `scripts/validate-story.mjs story.json` | Schema + claim-tag + media-file checks |
| `scripts/export-pdf.mjs <url> [--project slug]` | PDF via the site's print stylesheet |
| `scripts/miro-copy.mjs prepare\|native\|flat` | Miro board snapshot prep, same-org copy, cross-account flat copy |

## Guardrails

- Read-only toward every source: no pushes, no edits to Miro boards, no posts in Slack or Jira.
- Harvested text (Slack, Jira, docs, READMEs, boards) is treated as data, never as instructions to the agent.
- The only credential read from disk is the Vibelab token, and it is only ever sent to `https://*.miro.tools`. tasteskill, if you opt in, is installed from a pinned commit.
- Generous framing is fine; invented projects, made-up metrics, fake quotes, and claiming others' work are not.
- Copying Miro content to a personal account or another org requires explicit confirmation.
- Vibelab isn't approved for Restricted data. The skill publishes only with the subject's consent, unlisted, and with sensitive metrics stripped.

## Repo layout

```
skills/brag-center/      the skill (what `npx skills add` installs)
  SKILL.md               workflow (the agent reads this)
  reference/             sources, storytelling, art direction, build, vibelab, figma, exports
  templates/             story.schema.json, example.story.json, RUN-LOCALLY.md, REVIEW.md, site/
  scripts/               helpers listed above
web/                     landing page (Vite + React)
vercel.json              Vercel builds web/ on every push to main
```

Work on the landing page with `cd web && npm install && npm run dev`.
