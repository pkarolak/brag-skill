# Art direction

Goal: a site that looks like it was designed for this one person by someone who knows their craft. Never a template. Never Miro-branded.

## Inputs, in priority order

1. Style reference from intake (URL, image, Figma). Extract: type families/classes, scale contrast, palette (5 roles: ground, surface, ink, muted, accent), grid, density, imagery treatment, motion. Translate; don't clone.
2. Discipline + persona (identity.json, evidence tone, the work itself — the colors and forms in their own Figma/apps are a strong signal).
3. Angle notes (e.g. "promotion to Staff" → calmer, more authoritative; "AI tooling" → technical, live demos up front).

## Discipline starting points (pick one, then twist)

| Discipline | Direction | Type | Layout | Motion |
|-----------|-----------|------|--------|--------|
| Backend / infra / platform | Technical document, spec-sheet | Grotesk + mono for data | Strict 12-col grid, rules, tabular numbers | Minimal; counters, line draws |
| Frontend / creative eng | Interactive playground | Variable sans with personality | Asymmetric, big live demos | Rich; scroll-linked, hover states |
| Data / analytics | Annotated report | Neo-grotesk + mono figures | Chart-led, margin notes | Data reveals |
| Product design | Editorial case-study magazine | Serif display + clean sans | Large imagery, generous whitespace | Smooth image reveals |
| Brand / visual design | Bold poster / gallery | Expressive display | Full-bleed, oversized type | Confident, cinematic |
| Product management | Long-form narrative essay | Readable serif body | Single column, pull quotes, timeline | Calm |
| Research | Field notes / journal | Humanist serif + handwritten accents sparingly | Notebook rhythm, quotes forward | Gentle |
| Marketing / growth | Campaign microsite | Punchy sans | Big numbers, before/after | Energetic |
| Ops / program | Control-room dashboard | Condensed sans + mono | Modular panels, status | Ticking metrics |

Twist with one personal element from the evidence: a color from their best project, a motif from their domain (e.g. grid lines for infra, ink texture for brand), a typeface echoing their product.

## Hard bans

- Miro yellow (#FFD02F and near hues as accent), Miro's typeface, sticky-note / infinite-canvas aesthetics.
- Purple-to-blue gradients, glassmorphism cards everywhere, emoji bullets, generic "hero with blob", three identical feature cards, stock illustrations, Inter-on-white-with-indigo-button.
- Centered everything. Lorem ipsum. Placeholder images.

## Fallback taste checklist (when tasteskill isn't installed)

tasteskill is preferred. If the user declined installing it, hold the build to these instead and run them in the review loop:

- One idea per section; no section exists only to fill space. Headings at most two lines.
- Real content everywhere: actual screenshots, loops, quotes, numbers from `story.json`. No placeholder shapes standing in for the work.
- Type: two families max (plus mono only if the direction calls for data). Clear scale contrast between display and body; body 16-19px, 60-75ch measure.
- Color: the 5 palette roles from `DESIGN.md`, one accent used sparingly. Check text contrast (4.5:1 body, 3:1 large).
- Layout: vary rhythm between sections (not a stack of identical cards); align to a grid; generous but consistent spacing scale.
- Motion: purposeful and short (200-800ms), never blocking content; everything works with `prefers-reduced-motion`.
- No eyebrow labels over every heading, no numbered "01 / 02" section markers, no decorative emoji, no gradient text.
- Mobile: no horizontal overflow, tap targets ≥ 44px, media keeps aspect ratio.

## `DESIGN.md` template

```markdown
# Design direction — <name>
Concept: <one line, e.g. "A spec sheet for a systems builder">
Why: <2-3 lines tying to discipline/persona/reference>
Type: display <family, source>, text <family>, mono <family>; scale ratio <x>
Palette: ground #, surface #, ink #, muted #, accent #  (dark mode equivalents)
Layout family: <grid, density, signature layout move>
Imagery: <how screenshots/loops are framed: device frames? bleed? borders? captions?>
Motion: <depth level 0-3, signature interactions>
Signature detail: <the one personal twist>
Anti-goals: <what this must not look like>
```

Fonts: self-host via `@fontsource/*` or Google Fonts CSS; prefer families outside the top-5 defaults when they fit.
