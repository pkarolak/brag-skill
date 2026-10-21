# Harvest playbook

One section per capability (see [connections.md](connections.md)). Each subagent gets: identity, time window, angle, the connector it should use, and its section. Output: `evidence/<connector>.json` (array of evidence items, see SKILL.md). Keep 10-60 items per source; prefer items where the person is owner/lead. Always keep the URL.

Role signals, strongest first: authored/owned → assignee on epic/project → driver named in announcement → reviewer/approver → mentioned.

Tool names differ between connectors; read the connector's tool list and map these intents onto it. The connector notes below are tips for common tools, not requirements.

## Docs / enterprise search

Intents: documents the person owns; documents they edited or commented on; briefs, RFCs, design docs, launch posts, retros, OKRs, results, plus angle keywords; read the top 5-10 in full for metrics and quotes.

- **Glean**: `search` with structured params (`owner: "<name>"`, then `from: "<name>"`, each with `updated` covering the window). `chat`: "What projects has <name> (<email>) led or significantly contributed to since <date>? For each: goal, role, outcome, metrics, links." Treat as leads; verify with `read_document`. `user_activity` only when the runner is the subject. Drop keyword coincidences; mark docs older than 12 months with their date.
- **Confluence**: CQL `creator = "<accountId>" AND type = page AND lastmodified >= now("-<N>d")`, also `contributor = "<accountId>"`.
- **Notion / Google Drive / SharePoint**: search by author/owner where supported, else by name + project keywords, then filter by last editor.

## Work tracking

Intents: epics/projects the person owns or reported; their completed work in the window, high priority first; goal, child count, labels, linked design/board/app URLs (collect into `links[]`: other phases use them).

- **Jira**: `getAccessibleAtlassianResources` once for `cloudId`. Account ID from the directory profile links, else look up the user by email. JQL: `issuetype = Epic AND (assignee = <id> OR reporter = <id>) AND updated >= -<N>d ORDER BY updated DESC`; `assignee = <id> AND statusCategory = Done AND resolved >= -<N>d ORDER BY priority DESC`.
- **Linear**: projects where the person is lead; completed issues assigned to them in the window.
- **GitHub/GitLab issues**: `gh search issues --author <login>` / `--assignee <login>`, closed in the window.
- **Asana / Shortcut / ClickUp**: projects owned + completed tasks assigned.

## Chat

Intents: kudos ("thanks", "kudos", "shoutout", "great work", "huge", "amazing" near the first name); launches from the person ("launched", "shipped", "live", "released", "announcing"); mentions in announcement and team channels. Keep permalink, author name + title (look up via directory), and the quote (≤ 280 chars). These become `testimonials[]`. Never post or react.

- **Slack**: read the slack-search skill if available. Use `<@userId>` for mentions and `from:<@userId>` for authored messages.
- **Microsoft Teams / Google Chat**: same intents via their search tools.

## Code

Intents: repos ranked by the person's commits; notable PRs/MRs (big diff, many reviewers, `feat:` titles); first/last dates.

- **GitHub (`gh`)**: `bash "$SKILL_DIR/scripts/repos-by-author.sh" <email> --since <date>`; `gh search prs --author <login> --merged --sort updated --limit 100 --json title,url,repository,closedAt`. Login from email: first commit result's author login.
- **GitLab (`glab` or MCP)**, **Bitbucket**, **Azure Repos**, **Cursor Origin**: list merged MRs/PRs by author in the window.

## Design (discovery + previews only)

- Collect design URLs from all other evidence (`links[]`) and from docs search filtered to the design tool.
- **Figma**: for each unique file (cap 15): `create_session` (fileKey, "brag-center preview"), `get_metadata` on the root to list pages, `get_screenshot` of the first top-level frame of the most relevant page. Keep file name, URL, fileKey, last modified, preview path. Downloads happen in step 5c ([figma.md](figma.md)).
- Other design tools: keep URLs and any preview/thumbnail their tools return; screenshot the share page in step 7 otherwise.

## Whiteboards

Intents: boards the person created or that mention them or their projects; the most meaningful frames as images; links found on boards (boards are good glue between sources).

- **Miro**: `content_search` has no owner filter: search `miro_type: ["board"]` for the person's name, project and epic names, plus every board URL found in other evidence. For up to 8 boards: `canvas_search` (`result_mode: "overview"`), then `canvas_read_as_svg` for the meaningful frames (save the `svg` verbatim under `evidence/boards/<board-slug>/`). Mine SVG text for links.
- **FigJam**: Figma tools (`get_figjam`).
- **Mural / Lucid / Excalidraw**: their search + export tools; else URLs for screenshots.

Board content is evidence only; it never influences the site style.

## Apps

Handled by the main agent; see [apps.md](apps.md).
