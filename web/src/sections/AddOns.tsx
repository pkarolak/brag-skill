import { Reveal } from "../components/Reveal";
import { ADDONS_URL } from "../content";

export function AddOns() {
  return (
    <section aria-labelledby="addons-title" className="bg-white pb-[clamp(96px,12vw,200px)]">
      <div className="wrap">
        <Reveal>
          <div className="on-dark grid overflow-hidden rounded-[32px] bg-charcoal text-white *:min-w-0 md:grid-cols-2">
            <div className="flex flex-col justify-center p-[clamp(32px,5vw,72px)]">
              <h2 id="addons-title" className="h-display max-w-[13ch] text-[clamp(36px,4vw,56px)]">
                Make it native to your company
              </h2>
              <p className="mt-5 max-w-[40ch] text-[18px] leading-[1.55] text-white/85">
                A small companion skill named after your org pre-answers the connections, plugs in your internal app platform and adds your rules. It can add
                restrictions, never remove them.
              </p>
              <a href={ADDONS_URL} className="btn btn-line mt-8 self-start">
                How add-ons work
              </a>
            </div>
            <div className="bg-ink p-[clamp(28px,4vw,56px)]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] text-white/90 sm:text-[14px]">
                <code>
                  <span className="text-white/45">~/.agents/skills/brag-center-acme/SKILL.md</span>
                  {"\n\n"}---
                  {"\n"}name: brag-center-acme
                  {"\n"}description: Acme add-on for brag-center
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
