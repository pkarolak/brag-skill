export const REPO = "https://github.com/pkarolak/brag-skill";
export const SKILL_PATH = `${REPO}/tree/main/skills/brag-center`;
export const blob = (p: string) => `${REPO}/blob/main/skills/brag-center/${p}`;
export const INSTALL = "npx skills add pkarolak/brag-skill";
export const PROMPT = "brag center for jane@acme.com";
export const ADDONS_URL = `${REPO}#org-add-ons`;

export const flow = [
  { title: "Ask", line: "Give your agent one email: yours, or a teammate's." },
  { title: "Gather", line: "It reads the tickets, docs, designs, code and chat you've connected. Read-only." },
  { title: "Review", line: "Every claim is tagged sourced, inferred or embellished. Nothing goes out until you approve." },
  { title: "Share", line: "A one-off site in a style drawn from their craft, a PDF, or a password-protected link." },
];

export type Source = {
  name: string;
  examples: string;
  line: string;
  doc: string;
  fragment: "apps" | "people" | "work" | "chat" | "design" | "code" | "boards" | "taste";
};

export const sources: Source[] = [
  {
    name: "Apps",
    examples: "Vercel, Netlify, Replit, your internal platform",
    line: "Every app they shipped, cloned read-only, smoke-run, and documented so it runs anywhere.",
    doc: blob("reference/apps.md"),
    fragment: "apps",
  },
  {
    name: "People & docs",
    examples: "Glean, Notion, Confluence, Google Drive",
    line: "Who they are, the IDs every other tool needs, and the briefs and retros they wrote.",
    doc: blob("reference/connections.md"),
    fragment: "people",
  },
  {
    name: "Work tracking",
    examples: "Jira, Linear, GitHub Issues, Asana",
    line: "The epics and projects they owned, with scope, dates and outcomes.",
    doc: blob("reference/sources.md"),
    fragment: "work",
  },
  {
    name: "Chat",
    examples: "Slack, Microsoft Teams, Google Chat",
    line: "Kudos and launch posts become attributed quotes. Never posts, never reacts.",
    doc: blob("reference/sources.md"),
    fragment: "chat",
  },
  {
    name: "Design",
    examples: "Figma, Penpot, Framer",
    line: "The work itself: key frames downloaded at 2x on request.",
    doc: blob("reference/figma.md"),
    fragment: "design",
  },
  {
    name: "Code",
    examples: "GitHub, GitLab, Bitbucket",
    line: "Repos ranked by commits and the pull requests that mattered.",
    doc: blob("reference/sources.md"),
    fragment: "code",
  },
  {
    name: "Whiteboards",
    examples: "FigJam, Mural, Lucid, Excalidraw",
    line: "Workshops and maps rendered into clean proof screenshots.",
    doc: blob("reference/sources.md"),
    fragment: "boards",
  },
  {
    name: "Art direction",
    examples: "tasteskill",
    line: "A direction from your reference or their craft, checked in a real browser.",
    doc: "https://tasteskill.dev",
    fragment: "taste",
  },
];

export type Step = { title: string; body: string; log: string[] };

export const steps: Step[] = [
  {
    title: "Connect",
    body: "Lists what your agent can reach, grouped by what each tool does, and asks where your company hosts apps.",
    log: ["connected   docs · tracker · chat · design · code", "suggest     gh auth login  → commit history", "apps?       “our platform, CLI: acme-apps”", "  → 1 platform, read-only"],
  },
  {
    title: "Intake",
    body: "One question: the email, the angle, a style reference or none, a time window, and an optional password.",
    log: ["› brag center for jane@acme.com", "  angle   promotion case for Staff", "  style   surprise me", "  window  last 2 years"],
  },
  {
    title: "Harvest",
    body: "One subagent per source, in parallel, each writing evidence with URLs, dates and role signals.",
    log: ["evidence/notion.json       41 items", "evidence/jira.json         28 items", "evidence/slack.json        12 quotes", "evidence/figma.json         9 files"],
  },
  {
    title: "Apps",
    body: "Every app they built is cloned, documented and smoke-run, so it works outside the platform it lives on.",
    log: ["app-candidates → 18 apps", "localize standup-bot", "  vite · bun · sqlite · 11 env keys", "  smoke: works  → RUN-LOCALLY.md"],
  },
  {
    title: "Story",
    body: "Evidence becomes outcome-first case studies. Every claim carries a private confidence tag.",
    log: ["validate-story story.json", "  sourced 31 · inferred 14 · embellished 4", "  projects 5 · media refs 38", "  OK"],
  },
  {
    title: "Handoff",
    body: "A local site, a review file listing every embellishment, and optional PDF or publishing.",
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
  caption: string;
  style: "spec" | "editorial" | "poster" | "field" | "control" | "essay" | "report" | "play";
};

export const portfolios: Portfolio[] = [
  { kind: "Spec sheet", person: "Ines Varga", title: "Staff Platform Engineer", line: "Cut deploy time from 40 to 6 minutes", metric: "6 min", metricLabel: "p50 deploy", caption: "A spec sheet for a platform engineer", style: "spec" },
  { kind: "Editorial", person: "Tom Achebe", title: "Senior Product Designer", line: "Turned a five-step checkout into one page", metric: "~20%", metricLabel: "faster tasks", caption: "An editorial magazine for a product designer", style: "editorial" },
  { kind: "Poster", person: "Mara Lind", title: "Brand Designer", line: "A launch nobody scrolled past", metric: "3.1M", metricLabel: "impressions", caption: "A poster wall for a brand designer", style: "poster" },
  { kind: "Field notes", person: "Ravi Iyer", title: "UX Researcher", line: "Forty interviews, one decision", metric: "40", metricLabel: "interviews", caption: "Field notes for a researcher", style: "field" },
  { kind: "Control room", person: "Kasia Nowak", title: "Program Manager", line: "Shipped the migration with zero downtime", metric: "0", metricLabel: "minutes down", caption: "A control room for a program manager", style: "control" },
  { kind: "Essay", person: "Leo Ferraro", title: "Group Product Manager", line: "Why we stopped building the dashboard", metric: "4", metricLabel: "teams aligned", caption: "A long-form essay for a product leader", style: "essay" },
  { kind: "Annotated report", person: "Aiko Mori", title: "Senior Data Analyst", line: "The metric that changed the roadmap", metric: "+18%", metricLabel: "activation", caption: "An annotated report for a data analyst", style: "report" },
  { kind: "Playground", person: "Sam Okafor", title: "Creative Engineer", line: "Prototypes you can actually touch", metric: "12", metricLabel: "live demos", caption: "A playground for a creative engineer", style: "play" },
];
