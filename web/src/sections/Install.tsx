import { CopyCommand } from "../components/CopyCommand";
import { Product } from "../components/Product";
import { Reveal } from "../components/Reveal";
import { PROMPT, REPO, portfolios } from "../content";

const report = portfolios[6];

const promises = [
  ["Runs locally", "Your machine, your agent, your connections. Nothing is published unless you ask."],
  ["Read-only, always", "Never pushes to a repo, never edits a doc, never posts. Copies outside the company need your explicit yes."],
  ["Password protection", "Lock the case studies or the whole site. Content is encrypted in the build, and the password is never written down."],
];

export function Install() {
  return (
    <section id="install" aria-labelledby="install-title" className="bg-white py-[clamp(96px,12vw,200px)]">
      <div className="wrap grid items-center gap-14 md:grid-cols-2 md:gap-[clamp(32px,6vw,96px)]">
        <div>
          <Reveal>
            <h2 id="install-title" className="h-display max-w-[12ch] text-[clamp(44px,6vw,88px)]">
              Make your first portfolio
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[40ch] text-[18px] leading-[1.55]">
              Install it once for Cursor, Claude Code, Codex or Gemini CLI. Then ask: “{PROMPT}”.
            </p>
            <CopyCommand tone="light" className="mt-8" />
            <div className="mt-4">
              <a href={REPO} className="btn btn-line">
                Read the docs
              </a>
            </div>
          </Reveal>
          <ul className="mt-14 space-y-6">
            {promises.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={0.12 + i * 0.06}>
                <h3 className="text-[19px] font-medium">{t}</h3>
                <p className="mt-1 max-w-[46ch] text-[16px] leading-[1.5]">{d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.14}>
          <div className="grid aspect-[4/5] place-items-center rounded-[32px] bg-stone">
            <Product p={report} scale={1.12} className="drift" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
