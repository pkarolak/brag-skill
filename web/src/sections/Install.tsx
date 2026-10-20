import { CopyCommand } from "../components/CopyCommand";
import { Reveal } from "../components/Reveal";
import { PROMPT, SKILL_PATH } from "../content";

const side = [
  ["Every claim tagged", "sourced, inferred or embellished, with a review file listing each one before anything is shared."],
  ["Read-only, always", "never pushes to a repo, never edits a board, never posts. Copies outside the org need your explicit yes."],
];

export function Install() {
  return (
    <section id="install" className="bg-lime py-[clamp(88px,10vw,150px)] text-ink">
      <div className="wrap">
        <Reveal>
          <h2 className="display mx-auto max-w-[14ch] text-center text-[clamp(48px,6.6vw,100px)]">
            Paint the grass green. <span className="font-serif italic tracking-[-0.02em]">Don’t invent grass.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_minmax(0,560px)_1fr]">
          <Reveal className="order-2 lg:order-1">
            <p className="max-w-[30ch] text-[17px] leading-[1.45]">
              <span className="font-medium">{side[0][0]}:</span> {side[0][1]}
            </p>
          </Reveal>
          <Reveal delay={0.08} className="order-1 lg:order-2">
            <div className="rounded-[32px] bg-paper px-4 py-6 text-center shadow-[0_40px_80px_-40px_rgba(0,0,0,0.35)] sm:p-10">
              <h3 className="text-[30px] leading-[1.05] tracking-[-0.04em]">Install the skill</h3>
              <p className="mx-auto mt-3 max-w-[36ch] text-[16px] leading-[1.45] text-black/60">
                Works in Cursor, Claude Code, Codex and any agent that reads SKILL.md. Needs Node 20 and your usual MCP connections.
              </p>
              <CopyCommand tone="light" className="mt-7" />
              <p className="mt-4 text-[14px] text-black/55">
                then: <span className="text-black">“{PROMPT}”</span>
              </p>
              <a href={SKILL_PATH} className="mt-7 inline-flex rounded-full bg-ink px-6 py-3.5 text-[16px] text-paper transition-transform hover:-translate-y-0.5">
                Read SKILL.md ↗
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.16} className="order-3 lg:justify-self-end">
            <p className="max-w-[30ch] text-[17px] leading-[1.45]">
              <span className="font-medium">{side[1][0]}:</span> {side[1][1]}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
