// Password protection for production builds.
//
// story.json `lock.scope` = "case-studies" | "site" turns it on; the password comes from BRAG_PASSWORD at build time
// and is never written to disk. Protected content is AES-GCM encrypted with a PBKDF2-derived key. Media referenced by
// the protected part of story.json (and not by the public part) is encrypted to media/locked/<id>.enc (names hidden);
// everything else in public/media, such as atmosphere photos used by the home page, ships as plain files.
// The build fails if protected text leaks into dist.
// `vite dev` with BRAG_PASSWORD seals the text too (media stay plain, dev is localhost only); without it, dev serves
// the site unlocked under a visible "not password protected" banner.
import { createHash, webcrypto } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type { Plugin } from "vite";

const ID = "virtual:brag-story";
const RESOLVED = "\0" + ID;
const ITERATIONS = 600_000;
const subtle = webcrypto.subtle;
const b64 = (u: Uint8Array) => Buffer.from(u).toString("base64");

type Json = Record<string, any>;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const blankClaim = { text: "", confidence: "sourced" };

function teaser(p: Json) {
  return {
    slug: p.slug, title: p.title, period: p.period, tags: p.tags ?? [], locked: true,
    summary: blankClaim, context: blankClaim, challenge: blankClaim, role: blankClaim, outcome: blankClaim,
    moves: [], impact: [], media: [], proof: [],
  };
}

function split(story: Json, scope: string) {
  if (scope === "site") {
    return {
      preview: { person: { name: story.person.name, title: story.person.title }, design: story.design, lock: story.lock, projects: [], impact: [], hero: { line: blankClaim } },
      sealed: story,
    };
  }
  const { projects, testimonials, timeline, ...rest } = story;
  return {
    preview: { ...rest, projects: projects.map(teaser) },
    sealed: { projects, testimonials, timeline },
  };
}

const mediaRefs = (o: unknown, out = new Set<string>()) => {
  if (typeof o === "string" && /^\/?media\//.test(o)) out.add(o.replace(/^\//, ""));
  else if (Array.isArray(o)) o.forEach((x) => mediaRefs(x, out));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => mediaRefs(x, out));
  return out;
};

const strings = (o: unknown, out: string[] = []) => {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) o.forEach((x) => strings(x, out));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => strings(x, out));
  return out;
};

/** Sentences that only exist in the sealed part; if any shows up in dist, protection leaked. */
const leakProbes = (sealed: Json, preview: Json) => {
  const visible = new Set(strings(preview));
  return strings(sealed)
    .filter((t) => t.length >= 24 && !/^(https?:|\/?media\/)/.test(t) && !visible.has(t))
    .slice(0, 300);
};

export function bragLock(): Plugin {
  let root = process.cwd();
  let isBuild = false;
  let state: { key: CryptoKey; files: Record<string, string>; probes: string[] } | null = null;

  return {
    name: "brag-lock",
    configResolved(c) {
      root = c.root;
      isBuild = c.command === "build";
    },
    resolveId: (id) => (id === ID ? RESOLVED : null),
    async load(id) {
      if (id !== RESOLVED) return null;
      const story = JSON.parse(readFileSync(resolve(root, "src/content/story.json"), "utf8"));
      const scope = story.lock?.scope;
      if (!scope) return `export default ${JSON.stringify({ locked: false, story })};`;

      const password = process.env.BRAG_PASSWORD;
      if (!password) {
        if (isBuild) throw new Error(`story.json has lock.scope="${scope}" but BRAG_PASSWORD is not set. Refusing to build an unprotected site.`);
        return `export default ${JSON.stringify({ locked: false, story, unprotected: scope })};`;
      }

      const salt = webcrypto.getRandomValues(new Uint8Array(16));
      const base = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
      const key = await subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);

      const { preview, sealed } = split(story, scope);
      const publicFiles = mediaRefs(preview);
      const sealedFiles = mediaRefs(sealed);
      const files: Record<string, string> = {};
      for (const abs of isBuild ? walk(resolve(root, "public/media")) : []) {
        const rel = relative(resolve(root, "public"), abs).split("\\").join("/");
        if (!sealedFiles.has(rel) || publicFiles.has(rel)) continue;
        files[rel] = `media/locked/${createHash("sha256").update(b64(salt) + rel).digest("hex").slice(0, 20)}.enc`;
      }

      const iv = webcrypto.getRandomValues(new Uint8Array(12));
      const plain = new TextEncoder().encode(JSON.stringify({ sealed, files }));
      const data = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
      state = { key, files, probes: leakProbes(sealed, preview) };

      return `export default ${JSON.stringify({
        locked: true,
        scope,
        preview,
        box: { v: 1, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) },
      })};`;
    },
    async closeBundle() {
      if (!isBuild) return;
      const dist = resolve(root, "dist");
      // capture.mjs leaves capture-results.json and <id>.webm.json in public/media; they hold local paths and source URLs
      for (const f of walk(join(dist, "media")).filter((f) => f.endsWith(".json"))) rmSync(f);
      if (!state) return;
      mkdirSync(join(dist, "media/locked"), { recursive: true });
      for (const [rel, enc] of Object.entries(state.files)) {
        const src = join(dist, rel);
        if (!existsSync(src)) continue;
        const iv = webcrypto.getRandomValues(new Uint8Array(12));
        const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, state.key, readFileSync(src)));
        const out = new Uint8Array(iv.length + ct.length);
        out.set(iv);
        out.set(ct, iv.length);
        writeFileSync(join(dist, enc), out);
        rmSync(src);
      }
      const shipped = walk(dist).filter((f) => /\.(html|js|css|json|txt|map)$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");
      const leaked = state.probes.filter((t) => shipped.includes(t));
      if (leaked.length) throw new Error(`brag-lock: protected text found in dist (e.g. "${leaked[0].slice(0, 60)}…"). Remove it from public parts.`);
      const plainMedia = Object.keys(state.files).filter((rel) => existsSync(join(dist, rel)));
      if (plainMedia.length) throw new Error(`brag-lock: unencrypted protected media left in dist: ${plainMedia.join(", ")}`);
      console.log(`brag-lock: content sealed, ${Object.keys(state.files).length} media files encrypted, no leaks found`);
    },
  };
}
