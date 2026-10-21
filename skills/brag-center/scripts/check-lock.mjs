#!/usr/bin/env node
// Prove a served portfolio is actually password protected before handing its URL to anyone.
//
//   node check-lock.mjs <siteUrl> [--scope case-studies|site]
//
// Opens the site in a fresh browser (no saved key) with no password and checks that the lock screen ([data-lock])
// guards every case study (or the home page for --scope site) and that no "password not enforced" dev banner shows.
// Exits 1 with the offending URL if anything renders unlocked.
import { launch } from "./lib/browser.mjs";

const argv = process.argv.slice(2);
const siteUrl = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--scope");
const scope = argv.includes("--scope") ? argv[argv.indexOf("--scope") + 1] : "case-studies";
if (!siteUrl || argv.includes("--help")) {
  console.error("usage: check-lock.mjs <siteUrl> [--scope case-studies|site]");
  process.exit(2);
}

const base = new URL(siteUrl);
base.hash = "";
const browser = await launch();
const page = await browser.newPage();
const failures = [];

async function guarded(url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  if (await page.$("[data-unprotected]")) return "dev server with the password not enforced";
  if (!(await page.$("[data-lock]"))) return "content rendered without the password";
  return null;
}

try {
  if (scope === "site") {
    const why = await guarded(base.href);
    if (why) failures.push(`${base.href}: ${why}`);
  } else {
    await page.goto(base.href, { waitUntil: "networkidle" });
    if (await page.$("[data-unprotected]")) failures.push(`${base.href}: dev server with the password not enforced`);
    const routes = [...new Set(await page.$$eval('a[href*="#/work/"]', (as) => as.map((a) => a.getAttribute("href"))))];
    if (!routes.length) failures.push(`${base.href}: no case-study links found to check`);
    for (const r of routes) {
      const url = new URL(r, base).href;
      const why = await guarded(url);
      if (why) failures.push(`${url}: ${why}`);
    }
    if (!failures.length) console.log(`checked ${routes.length} case studies`);
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("NOT PROTECTED\n" + failures.map((f) => "  " + f).join("\n"));
  process.exit(1);
}
console.log(`protected: ${base.href} (${scope})`);
