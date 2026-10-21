export const REPO = "https://github.com/pkarolak/brag-skill";
export const SKILL_PATH = `${REPO}/tree/main/skills/brag-center`;
export const blob = (p: string) => `${REPO}/blob/main/skills/brag-center/${p}`;
export const INSTALL = "npx skills add pkarolak/brag-skill";
export const PROMPT = "brag center for jane@acme.com";

export const stats = [
  { value: "1", label: "email in" },
  { value: "0", label: "required integrations" },
  { value: "3–6", label: "case studies out" },
];

export const statements = [
  "Your best work is scattered across tickets, chat threads, design files, repos and apps on whatever platform your company runs. Nobody has an afternoon to turn it into a story.",
  "Brag Center reads whatever your agent can reach, finds the projects that mattered, and writes them up as case studies with screenshots, screen-grab loops and real quotes.",
  "Every site is built once, for one person, in a style drawn from their craft. No template. No company brand by default.",
];

export type Source = {
  name: string;
  color: string;
  ink: "dark" | "light";
  role: string;
  facts: string[];
  doc: string;
  fragment: "apps" | "people" | "work" | "chat" | "design" | "code" | "boards" | "taste";
};

export const sources: Source[] = [
  {
    name: "Apps",
    color: "var(--color-cyan)",
    ink: "dark",
    role: "Vercel, Netlify, Replit, or your internal platform",
    facts: ["Asks where your company hosts apps and how to get in", "Finds the person's apps by owner or commit, clones and smoke-runs them", "Writes RUN-LOCALLY.md so the work outlives the platform"],
    doc: blob("reference/apps.md"),
    fragment: "apps",
  },
  {
    name: "People & docs",
    color: "var(--color-sprout)",
    ink: "dark",
    role: "Glean, Notion, Confluence, Google Drive, SharePoint",
    facts: ["Title, team, tenure and their ID in every other tool", "Docs they own or edited, vetted for freshness", "Project summaries cross-checked against the source docs"],
    doc: blob("reference/sources.md"),
    fragment: "people",
  },
  {
    name: "Work tracking",
    color: "var(--color-blush)",
    ink: "dark",
    role: "Jira, Linear, GitHub Issues, Asana",
    facts: ["Epics and projects they owned or drove", "Completed work in the window, highest priority first", "Linked design, board and app URLs for the other phases"],
    doc: blob("reference/sources.md"),
    fragment: "work",
  },
  {
    name: "Chat",
    color: "var(--color-iris)",
    ink: "light",
    role: "Slack, Microsoft Teams, Google Chat",
    facts: ["Kudos and shout-outs become attributed testimonials", "Launch announcements date the timeline", "Read-only: never posts, never reacts"],
    doc: blob("reference/sources.md"),
    fragment: "chat",
  },
  {
    name: "Design",
    color: "var(--color-apricot)",
    ink: "dark",
    role: "Figma, Penpot, Framer",
    facts: ["Discovers files through every other source", "Downloads key frames on demand at 2x", "Lists files that need a manual local copy"],
    doc: blob("reference/figma.md"),
    fragment: "design",
  },
  {
    name: "Code",
    color: "var(--color-lilac)",
    ink: "dark",
    role: "GitHub, GitLab, Bitbucket",
    facts: ["Repos ranked by commits, deduplicated by sha", "Notable merged pull requests and their reach", "First and last commit to date every project"],
    doc: blob("reference/sources.md"),
    fragment: "code",
  },
  {
    name: "Whiteboards",
    color: "var(--color-olive)",
    ink: "dark",
    role: "FigJam, Mural, Lucid, Excalidraw",
    facts: ["Boards found by project names and links", "Frames rendered to clean proof screenshots", "Exported for your own records, on request"],
    doc: blob("reference/sources.md"),
    fragment: "boards",
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
  { name: "Localize", line: "Deployed apps cloned, analyzed and made portable", art: "localize" },
  { name: "Capture", line: "Screenshots and screen-grab loops of live work", art: "capture" },
  { name: "Frame", line: "Stories with every claim tagged by confidence", art: "frame" },
  { name: "Taste", line: "A bespoke direction drawn from the person's craft", art: "taste" },
  { name: "Export", line: "PDF, whiteboard copies and publishing", art: "export" },
];

export type Step = { title: string; body: string; log: string[] };

export const steps: Step[] = [
  {
    title: "Connect",
    body: "It lists what your agent can reach, grouped by what each tool does, suggests what's worth adding, and asks where your company hosts apps.",
    log: ["connected   docs · tracker · chat · design · code", "suggest     gh auth login  → commit history", "apps?       “our internal platform, CLI: acme-apps”", "  → 1 platform, read-only"],
  },
  {
    title: "Intake",
    body: "One question: the email, the angle you want told, a style reference or none, a time window, and an optional password.",
    log: ["› brag center for jane@acme.com", "  angle   promotion case for Staff", "  style   surprise me", "  window  last 2 years"],
  },
  {
    title: "Identity",
    body: "Whatever directory is connected returns who they are, where they sit, and the IDs every other source needs.",
    log: ["people lookup jane@acme.com", "  Staff Product Designer · Payments", "  jira 624aa6a8…  slack U039YA…", "  discipline → design"],
  },
  {
    title: "Harvest",
    body: "One subagent per source runs in parallel and writes its evidence with URLs, dates and role signals.",
    log: ["evidence/notion.json       41 items", "evidence/jira.json         28 items", "evidence/slack.json        12 quotes", "evidence/figma.json         9 files"],
  },
  {
    title: "Apps",
    body: "Every app they built is cloned, documented and smoke-run, so it still works outside the platform it lives on.",
    log: ["app-candidates → 18 apps", "localize standup-bot", "  vite · bun · sqlite · 11 env keys", "  smoke: works  → RUN-LOCALLY.md"],
  },
  {
    title: "Story",
    body: "Evidence becomes three to six outcome-first case studies. Every claim carries a private confidence tag.",
    log: ["validate-story story.json", "  sourced 31 · inferred 14 · embellished 4", "  projects 5 · media refs 38", "  OK"],
  },
  {
    title: "Media",
    body: "Live apps are recorded as loops, sources become proof screenshots, design frames come down at 2x.",
    log: ["capture media-jobs.json  (your Chrome)", "  ✓ hero-checkout.webm + poster", "  ✓ proof-epic-PAY-412.png", "  ✓ figma-checkout@2x.png"],
  },
  {
    title: "Direction",
    body: "A design direction from the reference you gave, or from the person's discipline. Written down before anything is built.",
    log: ["DESIGN.md", "  concept  an editorial case-study magazine", "  type     display serif + clean sans", "  accent   taken from their best project"],
  },
  {
    title: "Handoff",
    body: "A local site, a review file listing every embellishment, and optional PDF, whiteboard copies or publishing.",
    log: ["→ http://localhost:5180", "REVIEW.md  4 embellished · 2 softened", "extras?  [PDF] [Board copy] [Publish]", "done"],
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
  { kind: "Editorial", person: "Tom Achebe", title: "Senior Product Designer", line: "Turned a five-step checkout into one page", metric: "~20%", metricLabel: "faster tasks", style: "editorial" },
  { kind: "Poster", person: "Mara Lind", title: "Brand Designer", line: "A launch nobody scrolled past", metric: "3.1M", metricLabel: "impressions", style: "poster" },
  { kind: "Field notes", person: "Ravi Iyer", title: "UX Researcher", line: "Forty interviews, one decision", metric: "40", metricLabel: "interviews", style: "field" },
  { kind: "Control room", person: "Kasia Nowak", title: "Program Manager", line: "Shipped the migration with zero downtime", metric: "0", metricLabel: "minutes down", style: "control" },
  { kind: "Essay", person: "Leo Ferraro", title: "Group Product Manager", line: "Why we stopped building the dashboard", metric: "4", metricLabel: "teams aligned", style: "essay" },
  { kind: "Annotated report", person: "Aiko Mori", title: "Senior Data Analyst", line: "The metric that changed the roadmap", metric: "+18%", metricLabel: "activation", style: "report" },
  { kind: "Playground", person: "Sam Okafor", title: "Creative Engineer", line: "Prototypes you can actually touch", metric: "12", metricLabel: "live demos", style: "play" },
];
