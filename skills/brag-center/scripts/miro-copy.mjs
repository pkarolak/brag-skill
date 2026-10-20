#!/usr/bin/env node
// Miro board copy helpers. The source board is only ever read.
//
//   node miro-copy.mjs prepare --bundle <dir>
//       Build/refresh <dir>/manifest.json from frames/*.svg (+ png/*.png), and write clean/*.svg
//       (data-miro-id stripped) ready for canvas_create_from_svg on a new board. Flags frames > 190k chars.
//
//   MIRO_TOKEN=... node miro-copy.mjs native --board <sourceBoardId|url> --name "<name>" [--team <teamId>] [--description "..."]
//       Same-org exact copy via PUT /v2/boards?copy_from=<id>.
//
//   MIRO_TARGET_TOKEN=... node miro-copy.mjs flat --bundle <dir> --name "<name>" [--team <teamId>]
//       Any account/org: create a board and place each frame's PNG inside a titled frame at its original position.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const API = "https://api.miro.com/v2";
const [cmd, ...rest] = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : fallback;
};
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

const boardIdFrom = (s) => {
  const m = String(s).match(/board\/([^/?#]+)/);
  return decodeURIComponent(m ? m[1] : s);
};

async function miro(token, method, path, body, isForm = false) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(isForm ? {} : { "Content-Type": "application/json" }), Accept: "application/json" },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json.message ?? text.slice(0, 200)}`);
  return json;
}

function pngSize(file) {
  const b = readFileSync(file);
  if (b.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function svgBox(svg) {
  const vb = svg.match(/viewBox="\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*"/);
  if (vb) return { x: +vb[1], y: +vb[2], w: +vb[3], h: +vb[4] };
  const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/), h = svg.match(/<svg[^>]*\sheight="([\d.]+)/);
  return { x: 0, y: 0, w: w ? +w[1] : 1600, h: h ? +h[1] : 900 };
}

async function prepare() {
  const dir = resolve(opt("--bundle") ?? die("--bundle required"));
  const framesDir = join(dir, "frames");
  if (!existsSync(framesDir)) die(`no ${framesDir}; save canvas_read_as_svg output there first`);
  mkdirSync(join(dir, "clean"), { recursive: true });
  const manifestPath = join(dir, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { board: {}, frames: [], images: [] };
  const known = new Map((manifest.frames ?? []).map((f) => [f.svg, f]));
  const frames = [];
  for (const f of readdirSync(framesDir).filter((n) => n.endsWith(".svg")).sort()) {
    const svg = readFileSync(join(framesDir, f), "utf8");
    const clean = svg.replace(/\sdata-miro-id="[^"]*"/g, "");
    writeFileSync(join(dir, "clean", f), clean);
    const box = svgBox(svg);
    const png = join("png", f.replace(/\.svg$/, ".png"));
    const prev = known.get(join("frames", f)) ?? {};
    const size = existsSync(join(dir, png)) ? pngSize(join(dir, png)) : null;
    frames.push({
      name: prev.name ?? basename(f, ".svg").replace(/^\d+-/, "").replace(/-/g, " "),
      svg: join("frames", f),
      clean: join("clean", f),
      png: size ? png : prev.png,
      x: prev.x ?? box.x,
      y: prev.y ?? box.y,
      w: prev.w ?? box.w,
      h: prev.h ?? box.h,
      chars: clean.length,
      tooLarge: clean.length > 190000,
    });
  }
  manifest.frames = frames;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  for (const f of frames) console.error(`  ${f.tooLarge ? "!" : "✓"} ${f.svg} (${f.chars} chars${f.tooLarge ? " — split by child frames/areas before create" : ""})`);
  console.log(manifestPath);
}

async function native() {
  const token = process.env.MIRO_TOKEN ?? die("MIRO_TOKEN (boards:read + boards:write) required");
  const source = boardIdFrom(opt("--board") ?? die("--board required"));
  const body = { name: opt("--name", "Portfolio copy") };
  if (opt("--description")) body.description = opt("--description");
  if (opt("--team")) body.teamId = opt("--team");
  const board = await miro(token, "PUT", `/boards?copy_from=${encodeURIComponent(source)}`, body);
  console.log(JSON.stringify({ method: "native", source, id: board.id, viewLink: board.viewLink }, null, 2));
}

async function flat() {
  const token = process.env.MIRO_TARGET_TOKEN ?? die("MIRO_TARGET_TOKEN (target account, boards:write) required");
  const dir = resolve(opt("--bundle") ?? die("--bundle required"));
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  const body = { name: opt("--name", manifest.board?.name ? `${manifest.board.name} (copy)` : "Portfolio copy") };
  if (opt("--team")) body.teamId = opt("--team");
  if (manifest.board?.url) body.description = `Copied from ${manifest.board.url}`;
  const board = await miro(token, "POST", "/boards", body);
  console.error(`created board ${board.viewLink}`);

  const done = [], skipped = [];
  for (const f of manifest.frames) {
    if (!f.png || !existsSync(join(dir, f.png))) {
      skipped.push({ frame: f.name, reason: "no png (run capture.mjs --svg on the frame svg)" });
      continue;
    }
    const size = pngSize(join(dir, f.png)) ?? { width: f.w, height: f.h };
    const w = Math.round(f.w || size.width / 2);
    const h = Math.round(f.h || (w * size.height) / size.width);
    try {
      const frame = await miro(token, "POST", `/boards/${board.id}/frames`, {
        data: { title: f.name, format: "custom", type: "freeform" },
        position: { x: Math.round(f.x + w / 2), y: Math.round(f.y + h / 2), origin: "center" },
        geometry: { width: w, height: h },
      });
      const form = new FormData();
      form.append("resource", new Blob([readFileSync(join(dir, f.png))], { type: "image/png" }), basename(f.png));
      form.append("data", new Blob([JSON.stringify({
        title: f.name,
        position: { x: Math.round(w / 2), y: Math.round(h / 2), origin: "center" },
        geometry: { width: w },
        parent: { id: frame.id },
      })], { type: "application/json" }));
      await miro(token, "POST", `/boards/${board.id}/images`, form, true);
      done.push(f.name);
      console.error(`  ✓ ${f.name}`);
    } catch (e) {
      skipped.push({ frame: f.name, reason: e.message });
      console.error(`  ✗ ${f.name}: ${e.message}`);
    }
  }
  console.log(JSON.stringify({ method: "flat", id: board.id, viewLink: board.viewLink, frames: done.length, skipped }, null, 2));
  if (skipped.length) process.exitCode = 1;
}

const commands = { prepare, native, flat };
if (!commands[cmd]) {
  const lines = readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1);
  console.error(lines.slice(0, lines.findIndex((l) => !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(cmd ? 2 : 0);
}
await commands[cmd]();
