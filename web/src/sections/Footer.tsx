import { Wordmark } from "../components/Nav";
import { ADDONS_URL, REPO, SKILL_PATH, blob } from "../content";

const cols: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Skill",
    items: [
      { label: "SKILL.md", href: SKILL_PATH },
      { label: "Connections", href: blob("reference/connections.md") },
      { label: "Story schema", href: blob("templates/story.schema.json") },
      { label: "Org add-ons", href: ADDONS_URL },
    ],
  },
  { title: "Works with", items: [{ label: "Cursor" }, { label: "Claude Code" }, { label: "Codex" }, { label: "Gemini CLI" }] },
  { title: "Needs", items: [{ label: "Node 20+" }, { label: "Chrome or Edge" }, { label: "Whatever you’ve connected" }] },
  {
    title: "Made with",
    items: [
      { label: "tasteskill.dev", href: "https://tasteskill.dev" },
      { label: "Playwright", href: "https://playwright.dev" },
      { label: "skills.sh", href: "https://skills.sh" },
      { label: "Source on GitHub", href: REPO },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-mist pt-[clamp(72px,8vw,120px)]">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="text-[16px] font-medium">{c.title}</h2>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {c.items.map((it) => (
                  <li key={it.label}>
                    {it.href ? (
                      <a href={it.href} className="underline-offset-4 hover:underline">
                        {it.label}
                      </a>
                    ) : (
                      <span className="text-ash">{it.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-[clamp(64px,8vw,120px)] text-[15px] text-ash">Impressive, and mostly true. Runs locally and stays read-only toward every source.</p>
      </div>
      <div aria-hidden className="mt-6 select-none overflow-hidden pb-[2vw] text-center leading-[0.9]">
        <Wordmark className="whitespace-nowrap text-[8.6vw] tracking-[0.2em]" />
      </div>
    </footer>
  );
}
