# Figma: on-demand download

## When

After harvest (step 4c) or whenever the user asks ("download the Figma for project X"). Ask first: **all / pick files / previews only**. Show each file's name, last-modified date, and preview.

## Per file

1. `create_session` with the fileKey and task "brag-center download". Reuse the session id for the file's calls.
2. `get_metadata` on the root (`0:0` or the page ids) to list pages and top-level frames.
3. Pick key frames (cap ~12 per file):
   - Prefer pages named like `Final`, `Ready for dev`, `Handoff`, `Shipped`, `Hi-fi`, `Cover`, `Flows`.
   - Prefer frames at device sizes (1440, 1280, 390, 375 wide) and cover frames.
   - Skip `Archive`, `Old`, `WIP`, `Scratch`, `Components`, `Playground` pages and tiny frames.
   - One frame per distinct screen; avoid near-duplicates (same name with `copy`, `v2`).
4. For each frame call `download_assets` (`sessionId`, `fileKey`, `nodeId`, `defaultScale: 2` — the portfolio needs retina renders). The response holds temporary URLs: `export`, `rawImages[]`, `svgAssets[]`. Collect them for all frames of the file into a spec file (format in the script header) and **immediately** run:

   ```bash
   node "$SKILL_DIR/scripts/figma-fetch.mjs" evidence/figma-<file-slug>.spec.json --run . --publish
   ```

   It saves the render to `assets/figma/<file-slug>/<frame-slug>.png`, source images to `images/`, vector SVGs to `svg/`, merges `manifest.json`, and with `--publish` copies renders to `site/public/media/figma/<file-slug>/`. Expired URLs end up in `failures.json`; re-call `download_assets` for those frames and re-run.
   If `download_assets` fails for a frame, fall back to `get_screenshot` and save its image as the render.
5. The resulting `assets/figma/<file-slug>/manifest.json`:

```json
{
  "file": { "name": "", "key": "", "url": "", "lastModified": "" },
  "frames": [
    { "name": "Checkout — final", "nodeId": "12:345", "url": "https://www.figma.com/design/<key>/?node-id=12-345",
      "render": "checkout-final.png", "images": ["images/hero.jpg"], "svgs": ["svg/logo.svg"], "width": 1440, "height": 900 }
  ]
}
```

6. Reference published renders (`media/figma/<file-slug>/<frame>.png`) in `story.json` (`media[]` for hero/gallery, `proof[]` with `source: "figma"` and the frame URL).

## Limits

- Native `.fig` files are not downloadable via MCP or API. Add each file link to `REVIEW.md` → "Manual: Save local copy in Figma (File → Save local copy…)".
- Respect file permissions: if a file errors with access denied, note it and skip.
- Large files: never request the whole page as one render; frame by frame only.
