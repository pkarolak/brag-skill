import { Reveal } from "../components/Reveal";
import { SourceFragment } from "../components/SourceFragment";
import { sources } from "../content";

export function Sources() {
  return (
    <section id="sources" aria-labelledby="sources-title" className="bg-mist py-[clamp(96px,12vw,200px)]">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <Reveal>
            <h2 id="sources-title" className="h-display max-w-[12ch] text-[clamp(44px,6vw,88px)]">
              Works with what you have
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[40ch] text-[18px] leading-[1.55] md:justify-self-end">
              Tools are read by what they do, not what they’re called. Every connection your agent has is used; missing ones get a suggestion, never a blocker.
            </p>
          </Reveal>
        </div>

        <ul className="mt-[clamp(48px,6vw,88px)] grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s, i) => (
            <Reveal as="li" key={s.name} delay={(i % 4) * 0.06} className="flex flex-col rounded-[28px] bg-white p-5 transition-transform hover:-translate-y-1">
              <div className="flex min-h-[176px] items-center">
                <div className="w-full">
                  <SourceFragment kind={s.fragment} />
                </div>
              </div>
              <h3 className="mt-6 text-[22px] font-medium tracking-[-0.01em]">{s.name}</h3>
              <p className="mt-1 text-[15px] text-ash">{s.examples}</p>
              <p className="mt-3 text-[16px] leading-[1.5]">{s.line}</p>
              <a href={s.doc} className="group mt-auto inline-flex items-center gap-2 pt-5 text-[15px] font-medium">
                {s.fragment === "taste" ? "tasteskill.dev" : "Read the playbook"}
                <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
