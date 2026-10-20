# Harvest playbook

One section per source. Each subagent gets: identity, time window, angle, and its section. Output: `evidence/<source>.json` (array of evidence items, see SKILL.md). Keep 10-60 items per source; prefer items where the person is owner/lead. Always keep the URL.

Role signals, strongest first: authored/owned → assignee on epic → driver named in announcement → reviewer/approver → mentioned.

## Glean (`user-glean`)

- `search` with structured params: `owner: "<name>"`, then `from: "<name>"` (edited/commented), each with `updated` covering the window. Queries: `"project"`, `"launch"`, `"RFC"`, `"design doc"`, `"retro"`, `"OKR"`, `"results"`, plus angle keywords.
- `chat`: "What projects has <name> (<email>) led or significantly contributed to since <date>? For each: goal, their role, outcome, metrics, links." Treat the answer as leads, then verify via `read_document` on the top 5-10 docs.
- `read_document` on docs that look like project briefs, launch posts, retros, perf summaries. Pull metrics and quotes.
- `user_activity`: only when the runner is the subject.
- Vet per the Glean vetting rule: drop keyword coincidences; prefer docs < 12 months, mark older ones with their date.

## Atlassian (`plugin-atlassian-atlassian`)

- `getAccessibleAtlassianResources` once → `cloudId`.
- Account ID: take it from Glean `employee_search` → `datasourceToProfileLink.JIRA` (`.../jira/people/<accountId>`). Fallback: `discover` "find user by email".
- JQL (paginate, `responseFields` to slim):
  - `issuetype = Epic AND (assignee = <id> OR reporter = <id>) AND updated >= -<N>d ORDER BY updated DESC`
  - `assignee = <id> AND statusCategory = Done AND resolved >= -<N>d ORDER BY priority DESC`
- `searchConfluence` (CQL): `creator = "<id>" AND type = page AND lastmodified >= now("-<N>d")`, also `contributor = "<id>"`.
- Keep: epic summary + description (goal), child count, labels, linked Figma/Miro/Vibelab URLs (collect into `links[]` — other phases use them).

## Slack (`plugin-slack-slack`)

Read the slack-search skill first. The Slack user ID is in Glean `employee_search` → `datasourceToProfileLink.SLACK` (`.../team/<userId>`); use `<@userId>` for mentions. Queries (from the window start):

- Kudos: `"<first name>" (thanks OR kudos OR shoutout OR "great work" OR "huge" OR "amazing")`
- Launches: `from:<@user> (launched OR shipped OR "live" OR released OR announcing)`
- Mentions in announcement channels (`#announcements`, team channels found via Glean).

Keep: message permalink, author name + title (look up via Glean `employee_search`), the quote (trim to ≤ 280 chars). These become `testimonials[]`. Never post or react.

## Code (`gh` CLI, `cursor-origin`)

- `gh api -X GET search/commits -f q="author-email:<email> committer-date:>=<date>" --paginate -q '.items[].repository.full_name' | sort | uniq -c | sort -rn`
- `gh search prs --author <login> --merged --sort updated --limit 100 --json title,url,repository,closedAt,additions,deletions`
- Login from email: first commit result's `.author.login`.
- Origin: `list_namespaces` → `list_pull_requests` filtered by author where available.
- Keep: repos ranked by commits, notable PRs (big diff, many reviewers, "feat:" titles), first/last dates.

## Figma (`user-figma`) — discovery + previews only

- Collect Figma URLs from all other evidence (`links[]`), Glean `search` with `app: "figma"` and `owner`/`from` set to the person.
- For each unique file (cap 15): `create_session` (fileKey, "brag-center preview"), `get_metadata` on the root to list pages, `get_screenshot` of the first top-level frame of the most relevant page.
- Keep: file name, URL, fileKey, last modified, preview path. Downloads happen in step 4c ([figma.md](figma.md)).

## Miro (`user-miro-mcp`)

- `content_search` has no owner filter: search with `miro_type: ["board"]` for the person's name, project names, Vibelab app names, and Jira epic names, plus every miro.com board URL found in other evidence. Board text and descriptions often mention who generated or owns them.
- For up to 8 boards: `canvas_search` (`result_mode: "overview"`) to find frames/regions, then `canvas_read_as_svg` for the most meaningful ones (save the returned `svg` verbatim under `evidence/miro/<board-slug>/`).
- Mine the SVG text for links (Vibelab URLs, Jira keys, Figma links) and add them to `links[]`: boards are good glue between sources.
- Keep: board name, URL, last modified, frames saved. Miro content is evidence only; it never influences the site style.

## Vibelab

Handled by the main agent; see [vibelab.md](vibelab.md).
