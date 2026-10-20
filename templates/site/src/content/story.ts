import raw from "./story.json";

export type Confidence = "sourced" | "inferred" | "embellished";
export type Claim = { text: string; confidence: Confidence };
export type Metric = { value: string; label: string; confidence: Confidence };
export type MediaItem = {
  src: string;
  kind: "image" | "video";
  poster?: string;
  webp?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  role?: "hero" | "gallery" | "detail";
};
export type ProofSource = "jira" | "confluence" | "figma" | "miro" | "vibelab" | "github" | "origin" | "slack" | "glean" | "other";
export type Proof = { src: string; source: ProofSource; caption: string; url?: string; width?: number; height?: number };
export type Project = {
  slug: string;
  title: Claim;
  summary: Claim;
  period: { start: string; end?: string };
  team?: string;
  collaborators?: string[];
  tags?: string[];
  context: Claim;
  challenge: Claim;
  role: Claim;
  moves: Claim[];
  outcome: Claim;
  impact: (Metric | Claim)[];
  media?: MediaItem[];
  proof: Proof[];
  vibelab?: { app?: string; liveUrl?: string; repo?: string; commits?: number; localDoc?: string; smoke?: string };
  figma?: string[];
  miro?: string[];
};
export type Story = {
  angle?: string;
  person: { name: string; firstName?: string; email: string; title: string; team?: string; department?: string; location?: string; startDate?: string; discipline?: string; links?: { label: string; url: string }[] };
  hero: { line: Claim; kicker?: string; bio?: Claim; media?: MediaItem };
  impact: Metric[];
  projects: Project[];
  testimonials?: { quote: string; author: string; role?: string; url: string; date?: string; project?: string }[];
  timeline?: { date: string; label: string; project?: string; url?: string }[];
  skills?: { name: string; evidence?: string }[];
  design: { concept: string; palette?: Record<string, string>; fonts?: Record<string, string> } & Record<string, unknown>;
};

export const story = raw as unknown as Story;

export const isMetric = (x: Metric | Claim): x is Metric => "value" in x;
export const heroMedia = (p: Project) => p.media?.find((m) => m.role === "hero") ?? p.media?.[0];
export const projectBySlug = (slug: string) => story.projects.find((p) => p.slug === slug);
export const asset = (src: string) => (/^https?:/.test(src) ? src : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`);

const fmt = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });
export const formatDate = (d?: string) => (d ? fmt.format(new Date(d)) : "");
export const formatPeriod = (p: Project["period"]) => `${formatDate(p.start)} – ${p.end ? formatDate(p.end) : "now"}`;
