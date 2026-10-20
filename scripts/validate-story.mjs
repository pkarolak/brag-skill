#!/usr/bin/env node
// Validate story.json against the schema plus cross-field rules.
// Usage: node validate-story.mjs <story.json> [--public <site/public dir>]
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const storyPath = args.find((a) => !a.startsWith("--"));
if (!storyPath) {
  console.error("Usage: validate-story.mjs <story.json> [--public <dir>]");
  process.exit(2);
}
const publicIdx = args.indexOf("--public");
const publicDir = resolve(
  publicIdx >= 0 ? args[publicIdx + 1] : join(dirname(resolve(storyPath)), "site", "public"),
);

const schema = JSON.parse(readFileSync(join(here, "..", "templates", "story.schema.json"), "utf8"));
const story = JSON.parse(readFileSync(storyPath, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const errors = [];
const warnings = [];

if (!validate(story)) {
  for (const e of validate.errors) errors.push(`schema ${e.instancePath || "/"} ${e.message}`);
}

const slugs = new Set();
for (const p of story.projects ?? []) {
  if (slugs.has(p.slug)) errors.push(`duplicate project slug: ${p.slug}`);
  slugs.add(p.slug);
  if (!p.proof?.length) warnings.push(`project ${p.slug} has no proof screenshots`);
  if (!p.media?.some((m) => m.role === "hero")) warnings.push(`project ${p.slug} has no hero media`);
}

const claims = [];
const walk = (node, path) => {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
  if (node && typeof node === "object") {
    if ("confidence" in node) claims.push({ node, path });
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
  }
};
walk(story, "$");

for (const { node, path } of claims) {
  if (node.confidence === "embellished" && !node.note)
    errors.push(`${path}: embellished claim needs a note`);
  if (node.confidence === "sourced" && !node.sources?.length && !node.url)
    errors.push(`${path}: sourced claim needs sources[]`);
  if (node.confidence === "inferred" && !node.sources?.length && !node.url)
    warnings.push(`${path}: inferred claim has no sources[]`);
}

const mediaRefs = [];
const collectMedia = (m) => {
  if (!m) return;
  mediaRefs.push(m.src);
  if (m.poster) mediaRefs.push(m.poster);
  if (m.webp) mediaRefs.push(m.webp);
};
collectMedia(story.hero?.media);
for (const p of story.projects ?? []) {
  (p.media ?? []).forEach(collectMedia);
  (p.proof ?? []).forEach((x) => mediaRefs.push(x.src));
}
if (existsSync(publicDir)) {
  for (const ref of mediaRefs) {
    if (/^https?:/.test(ref)) continue;
    if (!existsSync(join(publicDir, ref))) errors.push(`missing media file: ${ref} (in ${publicDir})`);
  }
} else {
  warnings.push(`public dir not found (${publicDir}); media files not checked`);
}

const counts = claims.reduce((acc, { node }) => ((acc[node.confidence] = (acc[node.confidence] ?? 0) + 1), acc), {});
console.log(`claims: ${JSON.stringify(counts)}  projects: ${story.projects?.length ?? 0}  media refs: ${mediaRefs.length}`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
if (errors.length) process.exit(1);
console.log("OK");
