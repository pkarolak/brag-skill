#!/usr/bin/env node
// Match normalized app records (evidence/apps.json) to a person by owner fields and commit authorship.
//
//   node app-candidates.mjs <apps.json> --email <email> [--login <username>] [--repos repos.json] [--keep-unowned]
//
// apps.json: [{ "name", "url", "platform", "owner"?, "contributors"?: [], "repo"?, "status"?, "meta"? }]
// repos.json: output of repos-by-author.sh ([{ "repo", "commits", "first", "last" }])
// --login: the person's username on the platform or code host (owner fields are often logins, not emails).
// --keep-unowned: keep records with no owner field (use when the user supplied the list themselves).
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const appsFile = args[0];
const email = opt("--email");
if (!appsFile || !email) {
  console.error("usage: app-candidates.mjs <apps.json> --email <email> [--login <username>] [--repos repos.json] [--keep-unowned]");
  process.exit(2);
}
const readJson = (f) => {
  try {
    const d = JSON.parse(readFileSync(f, "utf8"));
    return Array.isArray(d) ? d : Array.isArray(d?.apps) ? d.apps : [];
  } catch {
    return [];
  }
};

const apps = readJson(appsFile);
const repos = opt("--repos") ? readJson(opt("--repos")) : [];
const keepUnowned = args.includes("--keep-unowned");

const lc = (s) => String(s ?? "").toLowerCase();
const mail = lc(email);
const local = mail.split("@")[0];
const login = opt("--login") ? lc(opt("--login")) : null;
const repoKey = (r) =>
  lc(r)
    .replace(/^(https?:\/\/|git@)[^/:]+[/:]/, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
const short = (r) => repoKey(r).split("/").pop();
const owners = (a) =>
  [a.owner, a.owner_email, a.ownerEmail, a.created_by, a.createdBy, a.author, a.lead, a.user?.email, a.user?.login, a.owner?.email, a.owner?.login]
    .filter((v) => typeof v === "string")
    .map(lc);
const isMine = (s) => s === mail || s === local || s.startsWith(`${local}@`) || (login !== null && s === login);

const out = [];
for (const a of apps) {
  if (!a?.name && !a?.url) continue;
  const os = owners(a);
  const commit = a.repo ? repos.find((r) => repoKey(r.repo) === repoKey(a.repo)) : repos.find((r) => short(r.repo) === lc(a.name));
  const match = [];
  if (os.some(isMine)) match.push("owner");
  else if ((a.contributors ?? []).map(lc).some(isMine)) match.push("contributor");
  if (commit) match.push("commits");
  if (!match.length && !os.length && keepUnowned) match.push("listed");
  if (!match.length) continue;
  out.push({
    name: a.name ?? new URL(a.url).hostname.split(".")[0],
    url: a.url ?? null,
    platform: a.platform ?? null,
    status: a.status ?? "unknown",
    repo: a.repo ? repoKey(a.repo) : commit?.repo ?? null,
    match: match.join("+"),
    commits: commit?.commits ?? 0,
    active: commit ? `${commit.first}..${commit.last}` : null,
  });
}
out.sort((a, b) => b.commits - a.commits || a.name.localeCompare(b.name));
console.log(JSON.stringify(out, null, 2));
