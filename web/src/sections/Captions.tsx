import { Reveal } from "../components/Reveal";
import { captions } from "../content";

export function Captions() {
  return (
    <section aria-labelledby="what-title" className="bg-white py-[clamp(56px,7vw,96px)]">
      <div className="wrap">
        <h2 id="what-title" className="sr-only">
          What it does
        </h2>
        <ul className="grid gap-8 md:grid-cols-3 md:gap-[clamp(24px,4vw,64px)]">
          {captions.map((c, i) => (
            <Reveal as="li" key={c} delay={i * 0.08} className="max-w-[34ch] text-[18px] leading-[1.5]">
              {c}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
