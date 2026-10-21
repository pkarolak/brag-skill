import { Reveal } from "../components/Reveal";
import { flow } from "../content";

export function Captions() {
  return (
    <section aria-labelledby="what-title" className="bg-white py-[clamp(56px,7vw,96px)]">
      <div className="wrap">
        <h2 id="what-title" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-x-[clamp(24px,3vw,48px)] gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="border-t-[1.5px] border-ink pt-5">
              <h3 className="text-[22px] font-medium tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-2 max-w-[32ch] text-[17px] leading-[1.5]">{s.line}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
