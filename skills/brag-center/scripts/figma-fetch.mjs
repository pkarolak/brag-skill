#!/usr/bin/env node
// Download Figma assets from download_assets responses (URLs are temporary — run right after the MCP calls).
//
//   node figma-fetch.mjs <spec.json> --run <run-dir> [--publish]
//
// spec.json:
// { "file": { "name": "Checkout", "key": "abc...", "url": "https://www.figma.com/design/abc/...", "lastModified": "" },
//   "frames": [ { "name": "Checkout — final", "nodeId": "12:345", "width": 1440, "height": 900,
//                 "export": { "url": "https://...", "format": "png" },
//                 "rawImages": [ { "url": "https://...", "format": "jpeg", "name": "hero" } ],
//                 "svgAssets": [ { "url": "https://...", "name": "logo" } ] } ] }
//
// Writes assets/figma/<file-slug>/{<frame>.png, images/, svg/, manifest.json}.
// --publish also copies frame renders to site/public/media/figma/<file-slug>/.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const specPath = argv.find((a) => !a.startsWith("--"));
const runIdx = argv.indexOf("--run");
if (!specPath || runIdx < 0) {
  console.error("usage: figma-fetch.mjs <spec.json> --run <run-dir> [--publish]");
  process.exit(2);
}
const run = resolve(argv[runIdx + 1]);
const publish = argv.includes("--publish");
const spec = JSON.parse(readFileSync(specPath, "utf8"));

const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "untitled";
const ext = (fmt) => ({ jpeg: "jpg", jpg: "jpg", png: "png", gif: "gif", webp: "webp", svg: "svg", pdf: "pdf" })[String(fmt).toLowerCase()] ?? "bin";

const fileSlug = slug(spec.file?.name ?? spec.file?.key ?? "figma");
const dir = join(run, "assets", "figma", fileSlug);
mkdirSync(join(dir, "images"), { recursive: true });
mkdirSync(join(dir, "svg"), { recursive: true });

const failures = [];
async function download(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch (e) {
    failures.push({ url, dest, error: e.message });
    return false;
  }
}

const used = new Set();
const unique = (base) => {
  let name = base, n = 2;
  while (used.has(name)) name = `${base}-${n++}`;
  used.add(name);
  return name;
};

const frames = [];
for (const f of spec.frames ?? []) {
  const frameSlug = unique(slug(f.name ?? f.nodeId));
  const entry = {
    name: f.name,
    nodeId: f.nodeId,
    url: spec.file?.key ? `https://www.figma.com/design/${spec.file.key}/?node-id=${String(f.nodeId).replace(":", "-")}` : undefined,
    width: f.width,
    height: f.height,
    render: null,
    images: [],
    svgs: [],
  };
  if (f.export?.url) {
    const name = `${frameSlug}.${ext(f.export.format ?? "png")}`;
    if (await download(f.export.url, join(dir, name))) entry.render = name;
  }
  for (const [i, img] of (f.rawImages ?? []).entries()) {
    const name = `images/${frameSlug}-${slug(img.name ?? i + 1)}.${ext(img.format === "original" ? "png" : img.format)}`;
    if (await download(img.url, join(dir, name))) entry.images.push(name);
  }
  for (const [i, svg] of (f.svgAssets ?? []).entries()) {
    const name = `svg/${frameSlug}-${slug(svg.name ?? i + 1)}.svg`;
    if (await download(svg.url, join(dir, name))) entry.svgs.push(name);
  }
  frames.push(entry);
  process.stderr.write(`  ${entry.render ? "✓" : "✗"} ${f.name} (${entry.images.length} images, ${entry.svgs.length} svgs)\n`);
}

const manifestPath = join(dir, "manifest.json");
const prev = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { frames: [] };
const byNode = new Map(prev.frames.map((f) => [f.nodeId, f]));
for (const f of frames) byNode.set(f.nodeId, f);
const manifest = { file: spec.file, downloadedAt: new Date().toISOString(), frames: [...byNode.values()] };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

if (publish) {
  const pub = join(run, "site", "public", "media", "figma", fileSlug);
  mkdirSync(pub, { recursive: true });
  for (const f of frames) if (f.render) copyFileSync(join(dir, f.render), join(pub, f.render));
  process.stderr.write(`  published renders → ${pub}\n`);
}

if (failures.length) {
  writeFileSync(join(dir, "failures.json"), JSON.stringify(failures, null, 2));
  process.stderr.write(`  ${failures.length} downloads failed (expired URLs? re-run download_assets) → failures.json\n`);
}
console.log(manifestPath);
process.exitCode = failures.length ? 1 : 0;
