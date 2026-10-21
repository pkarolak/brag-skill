# Exports

## Proof screenshots (always on)

Every project's `proof[]` shows the real artifacts behind the story.

1. For each project, list source URLs from its evidence: docs, tracker items, design frames, board areas, live apps, PRs/repos.
2. Write jobs into `media-jobs.json` (format in `scripts/capture.mjs --help`):

```json
[
  { "id": "proof-checkout-jira", "url": "https://acme.atlassian.net/browse/ABC-1", "type": "screenshot",
    "viewport": [1440, 900], "fullPage": false, "auth": true, "waitFor": 2500, "hide": [".atlaskit-portal"] },
  { "id": "hero-standup", "url": "https://standup-bot.example.app/", "type": "video",
    "viewport": [1440, 900], "auth": true, "duration": 9, "scroll": true }
]
```

3. Sources behind SSO (company wiki, tracker, internal app platform, private repos): run `node scripts/capture.mjs --login <url> [<url> …]` once with the sign-in pages of the hosts your jobs use. A headed browser opens with a persistent profile at `~/.cache/brag-center/profile`; the user signs in to each site, then closes the window. Jobs with `"auth": true` reuse that profile.
4. Design tools: prefer downloaded renders or the tool's own screenshot API (Figma `get_screenshot`) over browser screenshots.
5. Miro (if connected): `canvas_read_as_svg` for the meaningful frame or region → save `.svg` → `node scripts/capture.mjs --svg board.svg --out site/public/media/proof`. The renderer converts Miro's composer dialect (textAreas, markdown docs, labelled shapes, embedded-item placeholders) into a clean PNG fitted to the content. For a pixel-true shot of the real board instead, add a job with the board URL plus `?moveToWidget=<frameId>`, `"auth": true`, `"waitFor": 8000`, and `"hide": ["[data-testid='board-header']", ".toolbar"]` (include `https://miro.com/login/` in `--login` first). Other whiteboards: export frames as PNG with their tools, or screenshot the board URL.
6. Add to `story.json`: `{ "src": "media/proof/proof-checkout-jira.png", "source": "jira", "caption": "Epic that scoped the rebuild", "url": "…" }`.
7. In `REVIEW.md`, flag shots that might show confidential data (names of customers, revenue, other people's DMs, security issues). Add `"blur": [".selector"]` to the job and recapture, or drop the shot.

## PDF (optional)

```bash
node scripts/export-pdf.mjs http://localhost:5180 --out exports/portfolio.pdf
node scripts/export-pdf.mjs http://localhost:5180 --project <slug> --out exports/<slug>.pdf
```

Loads `?print=1` (or `?print=1&project=<slug>`), emulates print media, waits for fonts and images, renders A4 (override `--format Letter`), with backgrounds. The site's `print.css` handles page breaks, video posters, and link footnotes. Open the PDF and check it visually (read a page as an image) before reporting.

## Whiteboard copy (optional)

Only when a whiteboard tool is connected. The steps below are for Miro (MCP + REST API). For other tools (FigJam, Mural, Lucid), use their duplicate/export features the same way: snapshot first, never modify the source, confirm before copying outside the company.

### Miro

#### Snapshot (always first)

0. Load Miro's canvas guidance once: `canvas_get_canvas_composer_skill` (the SVG dialect has rules worth knowing before writing it back).
1. User picks boards from whiteboard evidence.
2. For each board: `canvas_search` with `result_mode: "overview"` → containers (frames) and loose-content regions, each with a `scope`. For each frame, `canvas_read_as_svg` (`miro_url`, `widget_ids: [frameId]`, `invocation_source: "skill"`); for frameless boards, read each region with its `scope_x/y/width/height`. Save the returned `svg` string verbatim (no retyping) to `exports/miro/<board-slug>/frames/<nn>-<name-slug>.svg`. Download image items with `image_get_url` → `curl -L -o exports/miro/<board-slug>/images/<id>.png`.
3. Seed `exports/miro/<board-slug>/manifest.json` with `{ "board": { "id", "name", "url" }, "frames": [{ "name", "svg": "frames/<file>.svg", "x", "y", "w", "h" }] }` using the bounds from `canvas_search`.
4. Render each frame to PNG (flat fallback + proof shots): `node scripts/capture.mjs --svg exports/miro/<board-slug>/frames/*.svg --out exports/miro/<board-slug>/png`.
5. `node scripts/miro-copy.mjs prepare --bundle exports/miro/<board-slug>`: writes `clean/*.svg` (ids stripped so they create new items instead of referencing source ones), fills PNG paths, and flags frames over ~190k chars (the create call caps at 200k; read those as several smaller areas/child frames instead).

The source board is never modified.

#### Pick target

`AskQuestion`: same org (pick team/space) / my personal Miro account / another org.

**Same org — native copy (exact):**

```bash
MIRO_TOKEN=<token with boards:write> node scripts/miro-copy.mjs native --board <sourceBoardId> --name "<name> — portfolio copy" [--team <teamId>]
```

Uses `PUT https://api.miro.com/v2/boards?copy_from=<id>`. Without a REST token, fall back to the cross-account path while still signed in to the same account.

**Personal account or another org:**

Confirm first: "This copies company content outside your organization. Do you have permission to do this? (yes / cancel)". Then choose one:

- **MCP path (best fidelity):** ask the user to re-authenticate the Miro MCP to the target account (e.g. in Cursor: `mcp_auth` on the Miro namespace, sign in with the target account). Verify with `user_who_am_i` that it's the target account. Then `board_create` → for each frame in the manifest, `canvas_create_from_svg` with the frame's `clean/*.svg` onto the new board (frames keep their original coordinates) → for images that didn't come across, `image_get_upload_url` + upload the local file + `image_create`. Afterwards tell the user to switch the MCP back to their work account (`mcp_auth` again).
- **REST path (no re-auth; flat):** user provides `MIRO_TARGET_TOKEN` for the target account:
  ```bash
  MIRO_TARGET_TOKEN=<token> node scripts/miro-copy.mjs flat --bundle exports/miro/<board-slug> --name "<name>"
  ```
  Creates a board and places each frame as a PNG image at its original position, with a frame title. Not editable, but visually faithful.

#### Fidelity note

MCP path recreates shapes, stickies, text, frames, connectors, tables, images. Comments, embeds, app cards, voting, and some widget styles may be simplified or dropped. Write a per-board summary to `REVIEW.md` (frames copied, items skipped, target board URL).
