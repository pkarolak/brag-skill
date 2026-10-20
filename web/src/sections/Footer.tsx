import { REPO, SKILL_PATH, blob } from "../content";

const cols: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Skill",
    items: [
      { label: "SKILL.md", href: SKILL_PATH },
      { label: "Story schema", href: blob("templates/story.schema.json") },
      { label: "Exports", href: blob("reference/exports.md") },
      { label: "Source code", href: REPO },
    ],
  },
  { title: "Works with", items: [{ label: "Cursor" }, { label: "Claude Code" }, { label: "Codex" }, { label: "Gemini CLI" }] },
  { title: "Needs", items: [{ label: "Node 20+" }, { label: "Chrome or Edge" }, { label: "GitHub CLI" }, { label: "Your MCP connections" }] },
  {
    title: "Made with",
    items: [
      { label: "tasteskill.dev", href: "https://tasteskill.dev" },
      { label: "Playwright", href: "https://playwright.dev" },
      { label: "skills.sh", href: "https://skills.sh" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink pt-[clamp(72px,8vw,120px)]">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[14px] text-white/45">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-[16px]">
                {c.items.map((it) => (
                  <li key={it.label}>
                    {it.href ? (
                      <a href={it.href} className="text-white/85 transition-colors hover:text-lime">
                        {it.label}
                      </a>
                    ) : (
                      <span className="text-white/85">{it.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-[clamp(72px,9vw,140px)] flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-6 text-[15px] text-white/55">
          <span>
            Impressive. <span className="accent">Mostly true.</span>
          </span>
          <span>Runs locally. Read-only toward every source.</span>
        </div>
      </div>
      <div aria-hidden className="mt-4 select-none whitespace-nowrap text-center text-[19.5vw] font-medium leading-[0.78] tracking-[-0.075em] text-white">
        Brag Center
      </div>
    </footer>
  );
}
