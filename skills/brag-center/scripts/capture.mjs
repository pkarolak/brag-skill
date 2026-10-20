#!/usr/bin/env node
// Playwright capture tool for brag-center.
//
//   node capture.mjs <jobs.json> --out <dir> [--profile <dir>] [--only id1,id2]
//   node capture.mjs --login [url ...]                     headed browser to sign in once (persistent profile)
//   node capture.mjs --svg <file.svg ...> --out <dir>      render SVG files to PNG
//   node capture.mjs --review <siteUrl> --out <dir>        desktop + mobile full-page shots of every route
//
// Job format (array):
//   { "id": "hero-app", "url": "https://...", "type": "screenshot" | "video",
//     "viewport": [1440, 900], "scale": 2, "auth": false, "waitFor": 1500 | ".selector",
//     "fullPage": false, "selector": ".clip-to-this", "hide": [".cookie"], "blur": [".private"],
//     "duration": 8, "scroll": true, "actions": [{ "click": "sel" }, { "hover": "sel" },
//     { "type": ["sel", "text"] }, { "wait": 800 }, { "scrollTo": "sel" }, { "press": "Enter" }] }
import { chromium } from "playwright";
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && ["--out", "--profile", "--only", "--review"].includes(argv[i - 1])));

const PROFILE = resolve(opt("--profile", join(homedir(), ".cache", "brag-center", "profile")));
const OUT = resolve(opt("--out", "media"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (flag("--help") || argv.length === 0) {
  const lines = readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1);
  console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(0);
}

async function launch({ auth, viewport = [1440, 900], scale = 2, video }) {
  const contextOpts = {
    viewport: { width: viewport[0], height: viewport[1] },
    deviceScaleFactor: video ? 1 : scale,
    colorScheme: "light",
    reducedMotion: "no-preference",
    ...(video ? { recordVideo: { dir: video, size: { width: viewport[0], height: viewport[1] } } } : {}),
  };
  if (auth) {
    mkdirSync(PROFILE, { recursive: true });
    const context = await chromium.launchPersistentContext(PROFILE, { headless: true, ...contextOpts });
    return { context, close: () => context.close() };
  }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOpts);
  return { context, close: async () => { await context.close(); await browser.close(); } };
}

async function prepare(page, job) {
  const css = [
    ...(job.hide ?? []).map((s) => `${s}{visibility:hidden!important}`),
    ...(job.blur ?? []).map((s) => `${s}{filter:blur(10px)!important}`),
    "*{caret-color:transparent!important}",
    "::-webkit-scrollbar{display:none}",
  ].join("\n");
  await page.addStyleTag({ content: css }).catch(() => {});
}

async function settle(page, job) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  if (typeof job.waitFor === "string") await page.waitForSelector(job.waitFor, { timeout: 15000 }).catch(() => {});
  else await sleep(job.waitFor ?? 1500);
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
}

async function runActions(page, actions = []) {
  for (const a of actions) {
    if (a.click) await page.click(a.click, { timeout: 8000 }).catch(() => {});
    else if (a.hover) await page.hover(a.hover, { timeout: 8000 }).catch(() => {});
    else if (a.type) await page.fill(a.type[0], "").then(() => page.type(a.type[0], a.type[1], { delay: 60 })).catch(() => {});
    else if (a.press) await page.keyboard.press(a.press);
    else if (a.scrollTo) await page.locator(a.scrollTo).first().scrollIntoViewIfNeeded().catch(() => {});
    else if (a.wait) await sleep(a.wait);
    await sleep(350);
  }
}

async function smoothScroll(page, seconds) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  if (total <= 0) return sleep(seconds * 1000);
  const steps = Math.max(1, Math.round(seconds * 30));
  const down = Math.round(steps * 0.8);
  for (let i = 1; i <= down; i++) {
    const t = i / down;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.evaluate((y) => scrollTo(0, y), Math.round(total * eased * 0.85));
    await sleep(1000 / 30);
  }
  await sleep((steps - down) * (1000 / 30));
}

async function screenshotJob(job) {
  const { context, close } = await launch(job);
  try {
    const page = await context.newPage();
    await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await prepare(page, job);
    await settle(page, job);
    await runActions(page, job.actions);
    const file = join(OUT, `${job.id}.png`);
    if (job.selector) await page.locator(job.selector).first().screenshot({ path: file });
    else await page.screenshot({ path: file, fullPage: !!job.fullPage });
    const finalUrl = page.url();
    return { id: job.id, file, finalUrl, loginWall: /login|signin|sso|auth/i.test(new URL(finalUrl).pathname + new URL(finalUrl).host) && !/login|signin|sso|auth/i.test(job.url) };
  } finally {
    await close();
  }
}

async function videoJob(job) {
  const tmp = join(tmpdir(), `brag-video-${job.id}-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  const started = Date.now();
  const { context, close } = await launch({ ...job, video: tmp });
  let page;
  let trimStart = 0;
  try {
    page = await context.newPage();
    await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await prepare(page, job);
    await settle(page, job);
    trimStart = (Date.now() - started) / 1000;
    await sleep(1200);
    await runActions(page, job.actions);
    if (job.scroll !== false) await smoothScroll(page, job.duration ?? 8);
    else await sleep((job.duration ?? 6) * 1000);
  } finally {
    const video = page?.video();
    await close();
    if (video) {
      const src = await video.path();
      const file = join(OUT, `${job.id}.webm`);
      renameSync(src, file);
      writeFileSync(join(OUT, `${job.id}.webm.json`), JSON.stringify({ trimStart: Math.max(0, trimStart - 0.2), duration: job.duration ?? 8 }));
      rmSync(tmp, { recursive: true, force: true });
      return { id: job.id, file, trimStart };
    }
  }
  return { id: job.id, error: "no video produced" };
}

async function runJobs(path) {
  const jobs = JSON.parse(readFileSync(path, "utf8"));
  const only = opt("--only") ? new Set(opt("--only").split(",")) : null;
  mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const job of jobs) {
    if (only && !only.has(job.id)) continue;
    process.stderr.write(`→ ${job.type ?? "screenshot"} ${job.id} ${job.url}\n`);
    try {
      const r = job.type === "video" ? await videoJob(job) : await screenshotJob(job);
      if (r.loginWall) process.stderr.write(`  ! landed on a login page (${r.finalUrl}); run --login and set "auth": true\n`);
      results.push(r);
    } catch (e) {
      process.stderr.write(`  ✗ ${e.message.split("\n")[0]}\n`);
      results.push({ id: job.id, error: e.message.split("\n")[0] });
    }
  }
  writeFileSync(join(OUT, "capture-results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (results.some((r) => r.error)) process.exitCode = 1;
}

async function login(urls) {
  mkdirSync(PROFILE, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE, { headless: false, viewport: null });
  const targets = urls.length ? urls : [
    "https://vibelab.miro.tools/",
    "https://miro.atlassian.net/",
    "https://app.glean.com/",
    "https://github.com/login",
  ];
  const [first] = context.pages();
  await first.goto(targets[0]).catch(() => {});
  for (const u of targets.slice(1)) await (await context.newPage()).goto(u).catch(() => {});
  console.log(`Sign in to each tab, then close the browser window. Profile: ${PROFILE}`);
  await new Promise((r) => context.on("close", r));
  console.log("Saved session.");
}

// Miro's canvas-composer SVG isn't directly renderable: text lives in <textArea>, docs are markdown inside
// <foreignObject data-type="doc">, shapes carry their label in data-content, and the viewBox is a fixed canvas.
// Convert those into HTML-in-SVG and fit the viewBox to the content before screenshotting.
function normalizeComposerSvg(maxWidth) {
  const NS = "http://www.w3.org/2000/svg";
  const XH = "http://www.w3.org/1999/xhtml";
  const svg = document.querySelector("svg");
  if (!svg) return false;
  const font = (f) => (f && f !== "open_sans" ? `${f.replace(/_/g, " ")}, ` : "") + "'Open Sans', Helvetica, Arial, sans-serif";
  const num = (el, a, d = 0) => parseFloat(el.getAttribute(a) ?? d) || d;
  const fo = (x, y, w, h, html, style) => {
    const f = document.createElementNS(NS, "foreignObject");
    for (const [k, v] of Object.entries({ x, y, width: w, height: h })) f.setAttribute(k, String(v));
    f.setAttribute("overflow", "visible");
    const d = document.createElementNS(XH, "div");
    d.setAttribute("style", `box-sizing:border-box;width:100%;height:100%;overflow:hidden;line-height:1.35;${style}`);
    d.innerHTML = html;
    f.append(d);
    return f;
  };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>").replace(/`(.+?)`/g, "<code>$1</code>");
  const md = (src) =>
    src
      .replace(/\\([\\`*_{}\[\]()#+\-.!<>&|])/g, "$1")
      .split("\n")
      .map((l) => {
        const h = l.match(/^(#{1,4})\s+(.*)/);
        if (h) return `<div style="font-weight:700;font-size:${[0, 30, 22, 18, 16][h[1].length]}px;margin:.6em 0 .25em">${inline(h[2])}</div>`;
        const li = l.match(/^\s*[-*]\s+(.*)/);
        if (li) return `<div style="padding-left:1em;text-indent:-.7em">• ${inline(li[1])}</div>`;
        return l.trim() ? `<div style="margin:.2em 0">${inline(l)}</div>` : "";
      })
      .join("");

  for (const t of [...svg.querySelectorAll("textarea, textArea")]) {
    const style = `color:${t.getAttribute("fill") ?? "#1a1a1a"};font-size:${num(t, "font-size", 16)}px;font-family:${font(t.getAttribute("font-family"))};text-align:${t.getAttribute("text-align") ?? "left"}`;
    t.replaceWith(fo(num(t, "x"), num(t, "y"), num(t, "width", 200), Math.max(num(t, "height", 20), num(t, "font-size", 16) * 1.4), t.textContent, style));
  }
  for (const d of [...svg.querySelectorAll('foreignObject[data-type="doc"]')]) {
    const text = d.textContent;
    d.replaceWith(fo(num(d, "x"), num(d, "y"), num(d, "width", 784), num(d, "height", 1000), md(text),
      "background:#fff;border:1px solid #e3e3e3;border-radius:8px;padding:28px 32px;font-size:14px;color:#1a1a1a;font-family:'Open Sans',Helvetica,Arial,sans-serif"));
  }
  for (const r of [...svg.querySelectorAll('[data-type="foreign"]')]) {
    r.setAttribute("fill", "#fafafa");
    r.setAttribute("stroke", "#cfcfcf");
    r.setAttribute("stroke-dasharray", "8 6");
    r.after(fo(num(r, "x"), num(r, "y"), num(r, "width"), 40, esc((r.getAttribute("data-widget-type") ?? "embedded item").replace(/_/g, " ")),
      "padding:12px 16px;color:#888;font:13px Helvetica,Arial,sans-serif;text-transform:capitalize"));
  }
  for (const r of [...svg.querySelectorAll("[data-content]")]) {
    const v = r.getAttribute("data-text-align-vertical") ?? "middle";
    const style = `display:flex;flex-direction:column;justify-content:${v === "top" ? "flex-start" : v === "bottom" ? "flex-end" : "center"};padding:12px 16px;color:${r.getAttribute("data-text-color") ?? "#1a1a1a"};font-size:${num(r, "data-font-size", 14)}px;font-family:${font(r.getAttribute("data-font-family"))};text-align:${r.getAttribute("data-text-align") ?? "center"}`;
    r.after(fo(num(r, "x"), num(r, "y"), num(r, "width"), num(r, "height"), r.getAttribute("data-content"), style));
  }

  const b = svg.getBBox();
  const pad = 32;
  const w = b.width + pad * 2;
  const h = b.height + pad * 2;
  svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${w} ${h}`);
  const outW = Math.min(w, maxWidth);
  svg.setAttribute("width", String(Math.round(outW)));
  svg.setAttribute("height", String(Math.round((outW * h) / w)));
  return true;
}

async function renderSvgs(files) {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 2400, height: 1600 } });
  const out = [];
  for (const f of files) {
    const svg = readFileSync(f, "utf8");
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>foreignObject p{margin:0}</style></head><body style="margin:0;background:#fff">${svg}</body></html>`, { waitUntil: "networkidle" }).catch(() => {});
    const isComposer = /data-miro-id|<textArea|data-type="doc"/.test(svg);
    if (isComposer) await page.evaluate(normalizeComposerSvg, Number(opt("--max-width", 2400)));
    const el = page.locator("svg").first();
    const box = await el.boundingBox();
    if (!box) { process.stderr.write(`  ✗ no <svg> in ${f}\n`); continue; }
    await page.setViewportSize({ width: Math.ceil(Math.min(box.width, 4000)), height: Math.ceil(Math.min(box.height, 4000)) });
    const file = join(OUT, basename(f, extname(f)) + ".png");
    await el.screenshot({ path: file });
    out.push(file);
    process.stderr.write(`  ✓ ${file}\n`);
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
}

async function review(siteUrl) {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const base = siteUrl.replace(/#.*$/, "");
  const probe = await browser.newPage();
  await probe.goto(base, { waitUntil: "networkidle" });
  const routes = ["#/", ...new Set(await probe.$$eval('a[href^="#/"]', (as) => as.map((a) => a.getAttribute("href"))))];
  await probe.close();
  const sizes = { desktop: [1440, 900], mobile: [390, 844] };
  const shots = [];
  for (const [label, [w, h]] of Object.entries(sizes)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    for (const r of routes) {
      await page.goto(base + r, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        scrollTo(0, 0);
      });
      await sleep(600);
      const name = `${label}-${r.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}.png`;
      await page.screenshot({ path: join(OUT, name), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      shots.push({ file: join(OUT, name), route: r, viewport: label, horizontalOverflow: overflow });
    }
    if (consoleErrors.length) shots.push({ viewport: label, consoleErrors: [...new Set(consoleErrors)].slice(0, 20) });
    await ctx.close();
  }
  await browser.close();
  writeFileSync(join(OUT, "review.json"), JSON.stringify(shots, null, 2));
  console.log(JSON.stringify(shots, null, 2));
}

if (flag("--login")) await login(positional);
else if (flag("--svg")) await renderSvgs(positional.filter((f) => existsSync(f)));
else if (flag("--review")) await review(opt("--review"));
else await runJobs(positional[0]);
