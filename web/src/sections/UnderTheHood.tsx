import { Reveal } from "../components/Reveal";
import { Wireframe } from "../components/Wireframe";
import { tech } from "../content";

export function UnderTheHood() {
  return (
    <section id="hood" className="bg-graphite py-[clamp(88px,10vw,150px)]">
      <div className="wrap">
        <Reveal>
          <h2 className="display max-w-[12ch] text-[clamp(52px,7vw,104px)]">
            Under the <span className="accent">hood</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-[44ch] text-[18px] leading-[1.45] text-white/60">
            Plain scripts and agent steps you can read, fork and rerun. Nothing leaves your machine unless you ask it to.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tech.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08}>
              <article className="group flex h-full flex-col rounded-[28px] bg-ink p-7 transition-colors hover:bg-[#0b0b0b]">
                <h3 className="font-serif text-[40px] leading-none">{t.name}</h3>
                <p className="mt-3 max-w-[26ch] text-[16px] leading-[1.4] text-white/60">{t.line}</p>
                <div className="mt-8 aspect-[300/210] w-full transition-transform duration-700 group-hover:scale-[1.04]">
                  <Wireframe art={t.art} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
