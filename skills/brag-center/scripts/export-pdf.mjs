#!/usr/bin/env node
// Export the portfolio site to PDF using its print stylesheet.
//
//   node export-pdf.mjs <siteUrl> [--out exports/portfolio.pdf] [--project <slug>] [--format A4|Letter] [--landscape]
//
// Loads <siteUrl>?print=1[&project=<slug>], waits for window.__printReady (set by the site's print.ts),
// emulates print media, and writes a PDF with backgrounds.
import { launch } from "./lib/browser.mjs";
import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const siteUrl = argv.find((a) => !a.startsWith("--") && !["--out", "--project", "--format"].includes(argv[argv.indexOf(a) - 1]));
if (!siteUrl || argv.includes("--help")) {
  console.error("usage: export-pdf.mjs <siteUrl> [--out file.pdf] [--project slug] [--format A4|Letter] [--landscape]");
  process.exit(2);
}
const project = opt("--project");
const out = resolve(opt("--out", project ? `exports/${project}.pdf` : "exports/portfolio.pdf"));
const format = opt("--format", "A4");

const url = new URL(siteUrl);
url.hash = "";
url.searchParams.set("print", "1");
if (project) url.searchParams.set("project", project);

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1800 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 60000 });
const ready = await page
  .waitForFunction(() => window.__printReady === true, null, { timeout: 30000 })
  .then(() => true)
  .catch(() => false);
if (!ready) console.error("warning: site never set window.__printReady; is src/lib/print.ts wired in main.tsx? exporting anyway");

const caseStudies = await page.locator('[data-print="case-study"]').count();
if (project && caseStudies === 0) {
  console.error(`error: no case study rendered for --project ${project}`);
  await browser.close();
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });
await page.pdf({
  path: out,
  format,
  landscape: argv.includes("--landscape"),
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate:
    '<div style="width:100%;font-size:7pt;color:#888;padding:0 12mm;display:flex;justify-content:flex-end"><span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></div>',
});
await browser.close();

const kb = Math.round(statSync(out).size / 1024);
console.log(JSON.stringify({ out, caseStudies, sizeKb: kb, pageErrors: errors }, null, 2));
if (errors.length) process.exitCode = 1;
