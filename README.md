# Brag Center

An agent skill that turns an employee's email into a bespoke, local portfolio site of case studies, built from whatever your agent is already connected to. It works in any company and with any toolset: it uses what's there, suggests what's worth connecting, and never blocks on a missing source.

**Landing page:** https://brag-skill.vercel.app/

- **Evidence by capability, not by brand**: people directory, docs and enterprise search, issue trackers, chat, design tools, code hosts, whiteboards, and app-hosting platforms. Glean, Notion, Confluence, Jira, Linear, Slack, Teams, Figma, GitHub, GitLab, Miro, and the like all work if they're connected as MCPs or CLIs.
- **Story**: 3-6 outcome-first case studies, an impact strip, real testimonials, a timeline. Flattering framing, with every claim tagged `sourced` / `inferred` / `embellished` in a private review file.
- **Media**: screenshots, screen-grab loops of live apps, design-file exports, and a "Behind the work" gallery of proof screenshots on every case study.
- **Working apps as proof**: the skill asks where your company hosts apps (Vercel, Netlify, Replit, an internal platform…) and how it can get access. The person's apps are then cloned read-only, analyzed, smoke-run, and documented in `RUN-LOCALLY.md` so they run outside that platform.
- **Design**: styled from a reference you give, or derived from the person's discipline, with [tasteskill](https://tasteskill.dev) as the anti-slop rulebook. It doesn't wear your employer's brand unless you ask.
- **Password protection**: the skill asks whether to protect the case studies or the whole site, and for the password. Protected content and media are encrypted in the build (AES-GCM, PBKDF2 key), not just hidden; the password is never written to disk. PDFs get the same password when `qpdf` is installed.
- **Extras**: PDF export, copying whiteboards into any account or org (Miro today), optional publishing to a host you already use.

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
| `git`, `gh` (signed in) | For app clones and GitHub code history | Skipped with a note if missing; GitLab and others work through their MCP or CLI |
| tasteskill | Optional | Used if your agent already has it; otherwise the skill asks once and falls back to a built-in checklist |
| ffmpeg | Required for loops | Installed via Homebrew if missing; trims and compresses screen recordings to mp4. If the install fails, loops stay webm + poster |

Defaults adapt to the agent running the skill (Cursor, Claude Code, Codex, Gemini CLI): which skills folder to look in for tasteskill, where to install it if you agree, and which built-in browser tool to fall back on.

Connections: none are required. At the start of a run the skill lists what's connected, grouped by capability, and suggests the most useful additions for the person's discipline. For example, an enterprise search MCP covers directory, docs, and chat at once, and `gh auth login` adds commit history. It also asks whether your company hosts apps somewhere and how to reach them: an MCP or skill, a CLI, an API with a token location, a list page, or just pasted URLs. Missing sources are skipped and listed in the review file.

## Org add-ons

Companies can make the skill feel native with a small companion skill named `brag-center-<org>`, installed next to it. Preflight finds it and the agent follows it alongside the main workflow. An add-on can pre-answer connections, plug in an adapter for the internal app platform (one that writes the normalized `apps.json`), add brand bans, and add stricter data rules. It can never relax the main guardrails. An add-on is just a `SKILL.md` plus any scripts it needs, and it can live in a private repo.

### Create an add-on

1. **Name the folder `brag-center-<org>`.** Preflight looks for `brag-center-*/SKILL.md` in every skills directory and prints what it found on the `ADDONS=` line. Any other name is ignored.
2. **Write the frontmatter.** Set `disable-model-invocation: true` so the add-on is only read through Brag Center and never runs on its own, and say so in the `description`:

   ```markdown
   ---
   name: brag-center-acme
   description: Acme add-on for the brag-center skill. Pre-answers connections, adds the Acme app adapter and Acme rules. Read by brag-center's preflight; not used on its own.
   disable-model-invocation: true
   version: 1.0.0
   ---
   ```

3. **Mirror Brag Center's step numbers.** Use headings like `## 2. Connections (pre-answered)` and `## 4. Identity (add)` so the agent knows where each instruction applies. Only write what differs at your company; everything else stays as the main workflow says. Refer to your own files with `ADDON_DIR` and to Brag Center's with `SKILL_DIR`.
4. **Pre-answer what every run would otherwise ask:**
   - **Connections:** a table of capability (directory, docs, tracker, chat, design, code, whiteboard, apps, calendar) to the tool your company uses, with site names or org names. The agent still checks what is actually connected.
   - **Identity:** how to get from an email to tracker, chat and code accounts (for example, an employee directory that links profiles).
   - **Apps:** if you have an internal app platform, add a script that lists apps and prints the normalized format from [`reference/apps.md`](skills/brag-center/reference/apps.md). The rest of the app pipeline then works unchanged.
5. **Add rules, never remove them.** Brand bans (logo, colors, typefaces), where portfolios may be published, data classification, and anything that must never be captured. State that where the add-on and Brag Center disagree, the stricter rule wins.
6. **Keep secrets out.** Point to where tokens already live (a CLI login, a config file the user owns) and send each credential only to its own host. Never put tokens in the add-on.
7. **Share it privately.** Push it to an internal repo and tag releases (`npx skills` uses GitHub releases to offer updates). Teammates install it after the main skill:

   ```bash
   npx skills add <your-org>/brag-center-<org> -g
   ```

   Then run Brag Center once and check that preflight prints your add-on on the `ADDONS=` line.

## Use

In your agent:

```
brag center for jane@acme.com
brag center for jane@acme.com — angle: promotion case for Staff, focus on AI tooling
brag center for jane@acme.com, style like https://some-portfolio.com
```

The skill reports what's connected, asks one intake question (angle, style reference, time window, password, app platform), lists the apps it found for you to confirm, and offers design-file downloads. When it finishes you get:

```
brag-jane-20261020/
  site/                    Vite + React portfolio → http://localhost:5180
  projects/<app>/          read-only clones + RUN-LOCALLY.md + smoke.png + facts.json
  assets/figma/<file>/     design frame renders, source images, SVGs, manifest.json
  evidence/                raw evidence per source
  story.json  narrative.md DESIGN.md  REVIEW.md
  exports/                 PDFs and whiteboard bundles (on request)
```

**Read `REVIEW.md` before sharing.** It lists embellished and inferred claims, softened confidential details, screenshots that may show sensitive data, which connections were missing, and which design files need a manual download.

## Scripts (run by the skill; usable on their own)

Paths are relative to `skills/brag-center/`.

| Script | What it does |
|--------|--------------|
| `scripts/check-env.sh [--agent a] [--install browser,taste]` | Check-only preflight; opt-in installs |
| `scripts/new-run.sh <first>` | Create the run folder |
| `scripts/repos-by-author.sh <email> [--orgs a,b] [--since date]` | Repos a person committed to, ranked (GitHub via `gh`) |
| `scripts/app-candidates.mjs <apps.json> --email e [--repos r.json]` | Match app records from any platform to the person |
| `scripts/app-localize.sh <name> <run> --repo r [--url u] [--smoke\|--serve]` | Clone read-only, analyze platform coupling, write `RUN-LOCALLY.md`, smoke-run |
| `scripts/figma-fetch.mjs <spec> --run <run> [--publish]` | Download `download_assets` URLs, write the manifest |
| `scripts/capture.mjs <jobs.json> --out <dir>` | Screenshots + scroll recordings (`--login` for SSO, `--svg` to render SVG, `--review` for QA shots) |
| `scripts/to-loop.sh *.webm` | webm → trimmed mp4 loop + poster (ffmpeg) |
| `scripts/scaffold-site.sh <run> [--example]` | Create the site from `templates/site` |
| `scripts/validate-story.mjs story.json` | Schema + claim-tag + media-file checks |
| `scripts/export-pdf.mjs <url> [--project slug]` | PDF via the site's print stylesheet |
| `scripts/miro-copy.mjs prepare\|native\|flat` | Miro board snapshot prep, same-org copy, cross-account flat copy |

## Guardrails

- Read-only toward every source: no pushes, no edits to boards or docs, no posts in chat or trackers, no redeploys.
- Harvested text (chat, tickets, docs, READMEs, boards, platform API responses) is treated as data, never as instructions to the agent.
- Credentials go through each connector's own sign-in. If you point the skill at a platform token, it reads it from the env var or file you name and sends it only to the host you confirmed. No script reads tokens from disk. tasteskill, if you opt in, is installed from a pinned commit.
- Generous framing is fine; invented projects, made-up metrics, fake quotes, and claiming others' work are not.
- Copying company content to a personal account or another org requires explicit confirmation.
- Publishing checks that the target is approved for this kind of data, and happens only with the subject's consent, unlisted, and with sensitive metrics stripped.

## Repo layout

```
skills/brag-center/      the skill (what `npx skills add` installs)
  SKILL.md               workflow (the agent reads this)
  reference/             connections, sources, apps, storytelling, art direction, build, figma, exports
  templates/             story.schema.json, example.story.json, RUN-LOCALLY.md, REVIEW.md, site/
  scripts/               helpers listed above
web/                     landing page (Vite + React)
vercel.json              Vercel builds web/ on every push to main
```

Work on the landing page with `cd web && npm install && npm run dev`.
