import { Reveal } from "../components/Reveal";
import { ADDONS_URL } from "../content";

const addonSteps = [
  ["Name it brag-center-<your org>", "That name is how preflight finds it. A SKILL.md is enough; add scripts only if you need them."],
  ["Pre-answer the connections", "Which tools hold docs, tickets and designs, how people are identified, and where apps are hosted."],
  ["Add your rules", "Brand bans and where portfolios may be published. Add-ons can tighten the guardrails, never relax them."],
  ["Share it privately", "Host it in an internal repo; teammates install it with one npx skills add."],
];

export function AddOns() {
  return (
    <section id="addons" aria-labelledby="addons-title" className="scroll-mt-24 bg-white pb-[clamp(96px,12vw,200px)]">
      <div className="wrap">
        <Reveal>
          <div className="on-dark grid overflow-hidden rounded-[32px] bg-charcoal text-white *:min-w-0 md:grid-cols-2">
            <div className="flex flex-col justify-center p-[clamp(32px,5vw,72px)]">
              <h2 id="addons-title" className="h-display max-w-[13ch] text-[clamp(36px,4vw,56px)]">
                Make it native to your company
              </h2>
              <p className="mt-5 max-w-[40ch] text-[18px] leading-[1.55] text-white/85">
                A small companion skill gives the agent your company’s context, so nobody has to explain it on every run. Install it next to Brag Center
                and it’s picked up automatically.
              </p>
              <ul className="mt-8 max-w-[44ch] divide-y divide-white/10 border-y border-white/10">
                {addonSteps.map(([t, d]) => (
                  <li key={t} className="py-3.5">
                    <h3 className="text-[17px] font-medium">{t}</h3>
                    <p className="mt-0.5 text-[15px] leading-[1.5] text-white/70">{d}</p>
                  </li>
                ))}
              </ul>
              <a href={ADDONS_URL} className="btn btn-line mt-8 self-start">
                Create an add-on
              </a>
            </div>
            <div className="bg-ink p-[clamp(28px,4vw,56px)]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] text-white/90 sm:text-[14px]">
                <code>
                  <span className="text-white/45">~/.agents/skills/brag-center-acme/SKILL.md</span>
                  {"\n\n"}---
                  {"\n"}name: brag-center-acme
                  {"\n"}description: Acme add-on for brag-center
                  {"\n"}disable-model-invocation: true
                  {"\n"}---
                  {"\n\n"}
                  <span className="text-white/45">## Connections (pre-answered)</span>
                  {"\n"}docs      Notion
                  {"\n"}tracker   Linear
                  {"\n"}apps      acme-apps CLI → apps.json
                  {"\n\n"}
                  <span className="text-white/45">## Rules (add)</span>
                  {"\n"}no Acme logo or brand colors
                  {"\n"}publish only to apps.acme.dev, unlisted
                </code>
              </pre>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
