# brag-center

An agent skill that turns an employee's email into a bespoke, local portfolio site of case studies, built from the sources your agent is already connected to.

- **Evidence**: Glean, Vibelab, Jira, Confluence, Slack, Figma, GitHub / Origin, Miro
- **Story**: 3-6 outcome-first case studies, an impact strip, real testimonials, a timeline. Flattering framing, with every claim tagged `sourced` / `inferred` / `embellished` in a private review file.
- **Media**: screenshots, screen-grab loops of live apps, Figma frame exports, and a "Behind the work" gallery of proof screenshots on every case study.
- **Vibelab as source of truth**: the person's apps are cloned read-only, analyzed, smoke-run, and documented in `RUN-LOCALLY.md` so they run outside Vibelab.
- **Design**: styled from a reference you give, or derived from the person's discipline, with [tasteskill](https://tasteskill.dev) as the anti-slop rulebook. Never Miro-branded.
- **Extras**: PDF export, copying Miro boards into any account or org, optional Vibelab publish.

## Install

```bash
npx skills add <org>/brag-center
# or clone it into your skills folder:
git clone <repo-url> ~/.cursor/skills/brag-center
```

On first run the skill's preflight installs what it needs: Playwright + Chromium (inside the skill folder), ffmpeg (via Homebrew), and tasteskill (`npx skills add Leonxlnx/taste-skill --skill design-taste-frontend`).

Recommended connections: Glean, Atlassian, Slack, Figma, and Miro MCPs; `gh auth login`; Cloudflare WARP plus the [vibelab skill](https://vibelab.miro.tools) preflight (it creates `~/.config/vibelab/token`). Missing sources are skipped and listed in the review file.

## Use

In your agent (Cursor, Claude Code, Codex, …):

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

| Script | What it does |
|--------|--------------|
| `scripts/check-env.sh` | Preflight + installs |
| `scripts/new-run.sh <first>` | Create the run folder |
| `scripts/vibelab-apps.sh <email> [--login gh]` | Find a person's Vibelab apps (owner field, then commit authorship) |
| `scripts/vibelab-localize.sh <app> <run> [--smoke\|--serve]` | Clone read-only, analyze, write `RUN-LOCALLY.md`, smoke-run |
| `scripts/figma-fetch.mjs <spec> --run <run> [--publish]` | Download `download_assets` URLs, write the manifest |
| `scripts/capture.mjs <jobs.json> --out <dir>` | Screenshots + scroll recordings (`--login` for SSO, `--svg` to render SVG, `--review` for QA shots) |
| `scripts/to-loop.sh *.webm` | webm → mp4 loop + poster (+ webp if ffmpeg has libwebp) |
| `scripts/scaffold-site.sh <run> [--example]` | Create the site from `templates/site` |
| `scripts/validate-story.mjs story.json` | Schema + claim-tag + media-file checks |
| `scripts/export-pdf.mjs <url> [--project slug]` | PDF via the site's print stylesheet |
| `scripts/miro-copy.mjs prepare\|native\|flat` | Miro board snapshot prep, same-org copy, cross-account flat copy |

## Guardrails

- Read-only toward every source: no pushes, no edits to Miro boards, no posts in Slack or Jira.
- Generous framing is fine; invented projects, made-up metrics, fake quotes, and claiming others' work are not.
- Copying Miro content to a personal account or another org requires explicit confirmation.
- Vibelab isn't approved for Restricted data. The skill publishes only with the subject's consent, unlisted, and with sensitive metrics stripped.

## Layout

```
SKILL.md                 workflow (the agent reads this)
reference/               sources, storytelling, art direction, build, vibelab, figma, exports
templates/               story.schema.json, example.story.json, RUN-LOCALLY.md, REVIEW.md, site/
scripts/                 helpers listed above
```
