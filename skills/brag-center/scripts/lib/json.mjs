// Tiny JSON helpers for the shell scripts (so they don't need jq).
//
//   node json.mjs get <file> <.path> [<.path> ...]     first non-empty string/number at any path
//   node json.mjs has-dep <package.json> <name>       exit 0 if listed in dependencies/devDependencies
//   node json.mjs length <file>                       array length (0 if not an array)
//   node json.mjs facts <commits-top.txt>             facts.json from F_* env vars (app-localize.sh)
import { readFileSync } from "node:fs";

const [cmd, ...args] = process.argv.slice(2);
const read = (f) => {
  try {
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    return null;
  }
};
const at = (obj, path) => path.replace(/^\./, "").split(".").filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), obj);
const words = (s) => (s ?? "").split(/\s+/).filter(Boolean);

switch (cmd) {
  case "get": {
    const [file, ...paths] = args;
    const data = read(file);
    for (const p of paths) {
      const v = at(data, p);
      if ((typeof v === "string" && v !== "") || typeof v === "number") {
        console.log(v);
        break;
      }
    }
    break;
  }
  case "has-dep": {
    const pkg = read(args[0]) ?? {};
    process.exit({ ...pkg.dependencies, ...pkg.devDependencies }[args[1]] ? 0 : 1);
  }
  case "length": {
    const d = read(args[0]);
    console.log(Array.isArray(d) ? d.length : 0);
    break;
  }
  case "facts": {
    const e = process.env;
    let top = [];
    try {
      top = readFileSync(args[0], "utf8").split("\n").filter(Boolean);
    } catch {}
    const facts = {
      app: e.F_APP, repo: e.F_REPO, repoUrl: e.F_REPO_URL, liveUrl: e.F_LIVE_URL ?? "", platform: e.F_PLATFORM,
      platformStatus: e.F_STATUS, framework: e.F_FRAMEWORK,
      packageManager: e.F_PM, type: e.F_TYPE, rootDir: e.F_ROOT_DIR ?? "", build: e.F_BUILD ?? "", start: e.F_START ?? "",
      outDir: e.F_OUT_DIR, envKeys: words(e.F_ENV_KEYS), usesSqlite: e.F_SQLITE === "yes", readsPortEnv: e.F_PORT_ENV === "yes",
      aiEndpointFiles: words(e.F_AI_ENDPOINT), privateRegistries: words(e.F_REGISTRY), platformFiles: words(e.F_PLATFORM_FILES),
      hardcodedPlatformUrls: words(e.F_HARDCODED), identityHeaderFiles: words(e.F_HEADERS),
      commits: { total: Number(e.F_COMMITS || 0), bySubject: Number(e.F_SUBJECT_COMMITS || 0), first: e.F_FIRST ?? "", last: e.F_LAST ?? "", top },
      readmeSummary: e.F_README ?? "", smoke: e.F_SMOKE, localDoc: `projects/${e.F_APP}/RUN-LOCALLY.md`,
    };
    console.log(JSON.stringify(facts, null, 2));
    break;
  }
  default:
    console.error("usage: json.mjs get|has-dep|length|facts ...");
    process.exit(2);
}
