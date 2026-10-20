export const REPO = "https://github.com/pkarolak/brag-skill";
export const SKILL_PATH = `${REPO}/tree/main/skills/brag-center`;
export const blob = (p: string) => `${REPO}/blob/main/skills/brag-center/${p}`;
export const INSTALL = "npx skills add pkarolak/brag-skill";
export const PROMPT = "brag center for jane.doe@miro.com";

export const stats = [
  { value: "1", label: "email in" },
  { value: "8", label: "sources read" },
  { value: "3–6", label: "case studies out" },
];

export const statements = [
  "Your best work is scattered across Jira epics, Slack threads, Figma files and apps on Vibelab. Nobody has an afternoon to turn it into a story.",
  "Brag Center reads all of it, finds the projects that mattered, and writes them up as case studies with screenshots, screen-grab loops and real quotes.",
  "Every site is built once, for one person, in a style drawn from their craft. No template. No Miro yellow.",
];

export type Source = {
  name: string;
  color: string;
  ink: "dark" | "light";
  role: string;
  facts: string[];
  doc: string;
  fragment: "vibelab" | "glean" | "jira" | "slack" | "figma" | "code" | "miro" | "taste";
};

export const sources: Source[] = [
  {
    name: "Vibelab",
    color: "var(--color-cyan)",
    ink: "dark",
    role: "Primary source of truth",
    facts: ["Finds every app the person built, by owner or commit", "Clones each one read-only and smoke-runs it locally", "Writes RUN-LOCALLY.md so the work outlives the platform"],
    doc: blob("reference/vibelab.md"),
    fragment: "vibelab",
  },
  {
    name: "Glean",
    color: "var(--color-sprout)",
    ink: "dark",
    role: "Identity and documents",
    facts: ["Title, team, tenure, Jira and Slack IDs from one lookup", "Docs they own or edited, vetted for freshness", "Project summaries cross-checked against the source docs"],
    doc: blob("reference/sources.md"),
    fragment: "glean",
  },
  {
    name: "Jira & Confluence",
    color: "var(--color-blush)",
    ink: "dark",
    role: "Scope and outcomes",
    facts: ["Epics they owned or drove, with goals and child counts", "Pages they authored: briefs, retros, RFCs", "Linked Figma, Miro and Vibelab URLs for the other phases"],
    doc: blob("reference/sources.md"),
    fragment: "jira",
  },
  {
    name: "Slack",
    color: "var(--color-iris)",
    ink: "light",
    role: "Voices",
    facts: ["Kudos and shout-outs become attributed testimonials", "Launch announcements date the timeline", "Read-only: never posts, never reacts"],
    doc: blob("reference/sources.md"),
    fragment: "slack",
  },
  {
    name: "Figma",
    color: "var(--color-apricot)",
    ink: "dark",
    role: "The work itself",
    facts: ["Discovers files through every other source", "Downloads key frames on demand at 2x", "Lists .fig files that need a manual local copy"],
    doc: blob("reference/figma.md"),
    fragment: "figma",
  },
  {
    name: "GitHub & Origin",
    color: "var(--color-lilac)",
    ink: "dark",
    role: "Shipping record",
    facts: ["Repos ranked by commits, deduplicated by sha", "Notable merged pull requests and their reach", "First and last commit to date every project"],
    doc: blob("reference/sources.md"),
    fragment: "code",
  },
  {
    name: "Miro",
    color: "var(--color-olive)",
    ink: "dark",
    role: "Thinking in public",
    facts: ["Boards found by project names and links", "Frames rendered to clean proof screenshots", "Copied to any account or org, on request"],
    doc: blob("reference/exports.md"),
    fragment: "miro",
  },
  {
    name: "tasteskill",
    color: "var(--color-candy)",
    ink: "dark",
    role: "Art direction",
    facts: ["Direction from a reference, or from the person's craft", "Anti-slop rules checked in a real browser", "Desktop and mobile review loop before handoff"],
    doc: "https://tasteskill.dev",
    fragment: "taste",
  },
];

export type Tech = { name: string; line: string; art: "harvest" | "localize" | "capture" | "frame" | "taste" | "export" };

export const tech: Tech[] = [
  { name: "Harvest", line: "Parallel evidence collection across every source", art: "harvest" },
  { name: "Localize", line: "Vibelab apps cloned, analyzed and made portable", art: "localize" },
  { name: "Capture", line: "Screenshots and screen-grab loops of live work", art: "capture" },
  { name: "Frame", line: "Stories with every claim tagged by confidence", art: "frame" },
  { name: "Taste", line: "A bespoke direction drawn from the person's craft", art: "taste" },
  { name: "Export", line: "PDF, Miro board copies and Vibelab publishing", art: "export" },
];

export type Step = { title: string; body: string; log: string[] };

export const steps: Step[] = [
  {
    title: "Intake",
    body: "One question: the email, the angle you want told, a style reference or none, and a time window.",
    log: ["› brag center for jane.doe@miro.com", "  angle   promotion case for Staff", "  style   surprise me", "  window  last 2 years"],
  },
  {
    title: "Identity",
    body: "Glean returns who they are, where they sit, and the IDs every other source needs.",
    log: ["employee_search jane.doe@miro.com", "  Staff Product Designer · Admin Experience", "  jira 624aa6a8…  slack U039YA…", "  discipline → design"],
  },
  {
    title: "Harvest",
    body: "One subagent per source runs in parallel and writes its evidence with URLs, dates and role signals.",
    log: ["evidence/glean.json        41 items", "evidence/jira.json         28 items", "evidence/slack.json        12 quotes", "evidence/figma.json         9 files"],
  },
  {
    title: "Vibelab",
    body: "Every app they built is cloned, documented and smoke-run, so it still works outside Vibelab.",
    log: ["vibelab-apps.sh → 18 candidates", "localize meet-log", "  vite · bun · sqlite · 11 env keys", "  smoke: works  → RUN-LOCALLY.md"],
  },
  {
    title: "Story",
    body: "Evidence becomes three to six outcome-first case studies. Every claim carries a private confidence tag.",
    log: ["validate-story story.json", "  sourced 31 · inferred 14 · embellished 4", "  projects 5 · media refs 38", "  OK"],
  },
  {
    title: "Media",
    body: "Live apps are recorded as loops, sources become proof screenshots, Figma frames come down at 2x.",
    log: ["capture media-jobs.json", "  ✓ hero-bulk-actions.webm", "  ✓ proof-epic-ADM-412.png", "to-loop → mp4 + poster"],
  },
  {
    title: "Direction",
    body: "A design direction from the reference you gave, or from the person's discipline. Written down before anything is built.",
    log: ["DESIGN.md", "  concept  an editorial case-study magazine", "  type     display serif + clean sans", "  accent   taken from their best project"],
  },
  {
    title: "Handoff",
    body: "A local site, a review file listing every embellishment, and optional PDF, Miro copies or Vibelab publish.",
    log: ["→ http://localhost:5180", "REVIEW.md  4 embellished · 2 softened", "extras?  [PDF] [Miro copy] [Vibelab]", "done"],
  },
];

export type Portfolio = {
  kind: string;
  person: string;
  title: string;
  line: string;
  metric: string;
  metricLabel: string;
  style: "spec" | "editorial" | "poster" | "field" | "control" | "essay" | "report" | "play";
};

export const portfolios: Portfolio[] = [
  { kind: "Spec sheet", person: "Ines Varga", title: "Staff Platform Engineer", line: "Cut deploy time from 40 to 6 minutes", metric: "6 min", metricLabel: "p50 deploy", style: "spec" },
  { kind: "Editorial", person: "Tom Achebe", title: "Senior Product Designer", line: "Made bulk board management a two-click job", metric: "~20%", metricLabel: "faster tasks", style: "editorial" },
  { kind: "Poster", person: "Mara Lind", title: "Brand Designer", line: "A launch nobody scrolled past", metric: "3.1M", metricLabel: "impressions", style: "poster" },
  { kind: "Field notes", person: "Ravi Iyer", title: "UX Researcher", line: "Forty interviews, one decision", metric: "40", metricLabel: "interviews", style: "field" },
  { kind: "Control room", person: "Kasia Nowak", title: "Program Manager", line: "Shipped the migration with zero downtime", metric: "0", metricLabel: "minutes down", style: "control" },
  { kind: "Essay", person: "Leo Ferraro", title: "Group Product Manager", line: "Why we stopped building the dashboard", metric: "4", metricLabel: "teams aligned", style: "essay" },
  { kind: "Annotated report", person: "Aiko Mori", title: "Senior Data Analyst", line: "The metric that changed the roadmap", metric: "+18%", metricLabel: "activation", style: "report" },
  { kind: "Playground", person: "Sam Okafor", title: "Creative Engineer", line: "Prototypes you can actually touch", metric: "12", metricLabel: "live demos", style: "play" },
];
