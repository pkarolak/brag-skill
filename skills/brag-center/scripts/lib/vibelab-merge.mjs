// Merge Vibelab app records with GitHub commit counts into the candidate list (vibelab-apps.sh).
//
//   node vibelab-merge.mjs <apps.json> <repo-counts.tsv> <email> <vibelab-url>
import { readFileSync } from "node:fs";

const [appsFile, countsFile, email, vurl] = process.argv.slice(2);
const read = (f, fallback) => {
  try {
    return readFileSync(f, "utf8");
  } catch {
    return fallback;
  }
};

let apps = [];
try {
  const raw = JSON.parse(read(appsFile, "[]"));
  apps = Array.isArray(raw) ? raw : Array.isArray(raw?.apps) ? raw.apps : [];
} catch {}

const repos = read(countsFile, "")
  .split("\n")
  .filter(Boolean)
  .map((l) => l.split("\t"))
  .map(([repo, n]) => ({ repo, commits: Number(n) || 0 }));

const lc = (s) => String(s).toLowerCase();
const mail = lc(email);
const local = mail.split("@")[0];
const host = new URL(vurl).host;
const liveUrl = (name) => `https://${name}.${host}/`;
const appRepo = (a) => String(a.repo_url ?? a.repo ?? "").replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
const short = (repo) => repo.split("/").pop().replace(/^vlab-/, "");
const ownerStrings = (a) =>
  [a.owner, a.owner_email, a.created_by, a.createdBy, a.author, a.user?.email, a.user?.login, a.owner?.email, a.owner?.login]
    .filter((v) => typeof v === "string")
    .map(lc);
// miroapp-vibe repos are all Vibelab apps; elsewhere only vlab-* repos are, unless an app record confirms it.
const isVibelabRepo = (repo) => repo.startsWith("miroapp-vibe/") || repo.split("/").pop().startsWith("vlab-");

const owned = apps
  .filter((a) => ownerStrings(a).some((s) => s === mail || s === local || s.startsWith(`${local}@`)))
  .map((a) => ({ name: a.name, url: a.url ?? liveUrl(a.name), status: a.status ?? "unknown", repo: appRepo(a), match: "owner", commits: 0 }));

const committed = repos.flatMap((r) => {
  const app = apps.find((a) => appRepo(a) === r.repo || a.name === short(r.repo));
  if (!app && !isVibelabRepo(r.repo)) return [];
  return [{
    name: app?.name ?? short(r.repo),
    url: app?.url ?? liveUrl(short(r.repo)),
    status: app?.status ?? (apps.length ? "no-app-record" : "unknown"),
    repo: r.repo,
    match: "commits",
    commits: r.commits,
  }];
});

const byName = new Map();
for (const x of [...owned, ...committed]) {
  const prev = byName.get(x.name);
  if (!prev) byName.set(x.name, { ...x });
  else {
    const matches = new Set([...prev.match.split("+"), x.match]);
    byName.set(x.name, { ...prev, ...x, match: [...matches].sort().join("+"), commits: Math.max(prev.commits, x.commits) });
  }
}

const out = [...byName.values()]
  .filter((a) => a.status !== "no-app-record" || a.commits >= 3)
  .sort((a, b) => b.commits - a.commits);
console.log(JSON.stringify(out, null, 2));
