# Build

## Stack

Scaffolded by `scripts/scaffold-site.sh`: Vite + React + TypeScript + Tailwind CSS v4 + Motion (`motion/react`). Static output (`dist/`), no server. Content lives in `site/src/content/story.json` (copied from the run folder by the scaffold; re-copy after edits with `cp story.json site/src/content/`).

Scaffold already provides (keep these, restyle freely):

- `src/content/story.ts`: typed loader for `story.json`
- `src/lib/route.ts`: tiny hash router: `#/` home, `#/work/<slug>` case study; `?print=1` print mode, `?project=<slug>` single-project print
- `src/styles/print.css`: print rules used by `export-pdf.mjs` (page breaks per case study, video → poster, links as footnotes)

- `src/lib/print.ts`: print-mode footnotes + `window.__printReady` (export-pdf waits for it)
- `src/lib/motion.ts`: `reveal()` props for scroll reveals; inert in print mode and for reduced motion. Use it (or the same guard) for every entrance animation, otherwise PDFs and review shots capture invisible content.
- `src/components/Media.tsx`: image / looping video with print poster swap
- `src/components/ProofGallery.tsx`: proof grid + lightbox with `classNames` styling hooks
- `src/components/ExternalLink.tsx`: external anchor with `data-href` for print footnotes
- `src/pages/Home.tsx`, `src/pages/CaseStudy.tsx`, `src/index.css`: neutral baseline structure. **Rewrite these completely** per `DESIGN.md`; they exist only so the scaffold builds and prints.

Everything visual is written fresh per run. Chrome doesn't paint the ground color into `@page` margins: if the ground isn't white, set `@page { margin: 0 }` in print.css and pad the content blocks instead.

## Required sections

Home (`#/`):
- Hero (hero line, name, title, team, optional portrait-free typographic treatment — no avatar placeholder)
- Impact strip (`impact[]`)
- Work index linking to each case study (with the hero media of each)
- Voices (`testimonials[]`)
- Timeline (`timeline[]`)
- Toolbox (`skills[]`)

Case study (`#/work/<slug>`):
- Title, one-line summary, meta (dates, role, team, collaborators)
- Hero media (loop mp4 with poster, `autoplay muted loop playsInline`)
- Context → Challenge → Role → Moves → Outcome → Impact, laid out with rhythm (not one long text column unless that's the concept)
- Media gallery (`media[]`)
- **Proof gallery** (`proof[]`): grid of real-artifact screenshots; each with source type label (Jira, Confluence, Figma, Miro, Vibelab, GitHub), caption, link. Lightbox on click. `data-print="proof"` on the section.
- For Vibelab projects: "Try it" link to live URL and a small "runs locally" note pointing to `projects/<app>/RUN-LOCALLY.md`
- Next project link

## Rules

- Never render `confidence`, `sources`, or `note` fields.
- Images: `loading="lazy"`, explicit width/height from media metadata, `alt` from captions.
- Video: always `poster`; print mode swaps to poster `<img>`.
- Each case study root gets `data-print="case-study"` and `id="<slug>"`; print.css relies on it.
- Every anchor to an external URL gets `data-href` mirroring `href` (print footnotes use it).
- Respect `prefers-reduced-motion`.
- Lighthouse-sane: no layout shift from media, fonts with `font-display: swap`.
- Dual theme only if `DESIGN.md` says so; otherwise commit to one.

## Commands

```bash
cd site
npm run dev -- --port 5180     # review + PDF export
npm run build                  # static dist/ (for Vibelab or zip)
npm run preview -- --port 5181
```
