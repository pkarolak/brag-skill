// Browser resolution for brag-center scripts.
// Order: $BRAG_BROWSER_PATH, installed Google Chrome, Microsoft Edge, Playwright's own Chromium (only if already downloaded).
// Nothing is downloaded here; `check-env.sh --install browser` fetches Chromium when the user agrees.
//
//   node lib/browser.mjs --probe      prints the browser that would be used, exits 1 if none
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

const candidates = () => [
  ...(process.env.BRAG_BROWSER_PATH ? [{ label: process.env.BRAG_BROWSER_PATH, opts: { executablePath: process.env.BRAG_BROWSER_PATH } }] : []),
  { label: "chrome", opts: { channel: "chrome" } },
  { label: "msedge", opts: { channel: "msedge" } },
  { label: "playwright-chromium", opts: {} },
];

const NONE =
  "No browser found. Install Google Chrome or Microsoft Edge, set BRAG_BROWSER_PATH, " +
  "or run `check-env.sh --install browser` to download Playwright's Chromium (~300 MB).";

let resolved;

async function resolveBrowser() {
  if (resolved) return resolved;
  for (const c of candidates()) {
    if (c.label === "playwright-chromium" && !existsSync(chromium.executablePath())) continue;
    try {
      const b = await chromium.launch({ headless: true, ...c.opts });
      await b.close();
      resolved = c;
      return c;
    } catch {
      /* try next */
    }
  }
  throw new Error(NONE);
}

export async function launch(opts = {}) {
  const c = await resolveBrowser();
  return chromium.launch({ headless: true, ...c.opts, ...opts });
}

export async function launchPersistent(dir, opts = {}) {
  const c = await resolveBrowser();
  return chromium.launchPersistentContext(dir, { headless: true, ...c.opts, ...opts });
}

if (import.meta.url === `file://${process.argv[1]}` && process.argv.includes("--probe")) {
  resolveBrowser()
    .then((c) => console.log(c.label))
    .catch(() => {
      console.log("none");
      process.exit(1);
    });
}
