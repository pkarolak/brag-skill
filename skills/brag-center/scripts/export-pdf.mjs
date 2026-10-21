#!/usr/bin/env node
// Export the portfolio site to PDF using its print stylesheet.
//
//   node export-pdf.mjs <siteUrl> [--out exports/portfolio.pdf] [--project <slug>] [--format A4|Letter] [--landscape]
//
// Loads <siteUrl>?print=1[&project=<slug>], waits for window.__printReady (set by the site's print.ts),
// emulates print media, and writes a PDF with backgrounds.
import { launch } from "./lib/browser.mjs";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

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
const password = process.env.BRAG_PASSWORD;

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
if (await page.locator("[data-lock]").count()) {
  if (!password) {
    console.error("error: site is password protected; set BRAG_PASSWORD (or export from the dev server)");
    await browser.close();
    process.exit(1);
  }
  await page.fill('[data-lock] input[name="password"]', password);
  await page.press('[data-lock] input[name="password"]', "Enter");
  await page.locator("[data-lock]").waitFor({ state: "detached", timeout: 30000 });
  // Reload so print preparation runs on the unlocked content (the tab keeps the key in sessionStorage).
  await page.reload({ waitUntil: "networkidle" });
}
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

// With BRAG_PASSWORD, protect the PDF too (AES-256) when qpdf is available; never pass the password on argv.
let protectedPdf = false;
if (password) {
  const qpdf = spawnSync("qpdf", ["--version"], { stdio: "ignore" }).status === 0;
  if (qpdf) {
    const dir = mkdtempSync(join(tmpdir(), "brag-pdf-"));
    const args = join(dir, "args");
    writeFileSync(args, ["--encrypt", password, password, "256", "--", out, "--replace-input"].join("\n"), { mode: 0o600 });
    const r = spawnSync("qpdf", [`@${args}`], { stdio: "inherit" });
    rmSync(dir, { recursive: true, force: true });
    protectedPdf = r.status === 0 || r.status === 3;
    if (!protectedPdf) console.error("warning: qpdf failed; the PDF is NOT password protected");
  } else {
    console.error("warning: qpdf not installed (brew install qpdf); the PDF is NOT password protected");
  }
}

const kb = Math.round(statSync(out).size / 1024);
console.log(JSON.stringify({ out, caseStudies, sizeKb: kb, passwordProtected: protectedPdf, pageErrors: errors }, null, 2));
if (errors.length) process.exitCode = 1;
