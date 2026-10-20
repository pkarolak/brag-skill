import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Reveal } from "../components/Reveal";
import { steps } from "../content";

export function Run() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const reduced = useReducedMotion();
  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + steps.length) % steps.length);
  };
  const s = steps[i];

  return (
    <section id="run" className="bg-ink py-[clamp(88px,10vw,150px)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="display max-w-[12ch] text-[clamp(52px,7vw,104px)]">
              A run, start to <span className="accent">finish</span>
            </h2>
          </Reveal>
          <div className="flex gap-3">
            {[
              [-1, "←", "Previous step"],
              [1, "→", "Next step"],
            ].map(([d, glyph, label]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => go(d as number)}
                aria-label={label as string}
                className="grid h-14 w-14 place-items-center rounded-full border border-white/25 text-[22px] transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                {glyph}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Steps">
          {steps.map((st, k) => (
            <button
              key={st.title}
              role="tab"
              aria-selected={k === i}
              onClick={() => {
                setDir(k > i ? 1 : -1);
                setI(k);
              }}
              className={`rounded-full px-4 py-2 text-[14px] transition-colors ${k === i ? "bg-lime text-black" : "bg-white/[0.07] text-white/65 hover:text-white"}`}
            >
              {st.title}
            </button>
          ))}
        </div>

        <div className="relative mt-8 min-h-[460px] overflow-hidden rounded-[32px] bg-smoke/60 sm:min-h-[300px]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={s.title}
              custom={dir}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              className="grid gap-8 p-7 sm:p-12 md:grid-cols-2 md:items-center"
            >
              <div>
                <h3 className="font-serif text-[clamp(56px,6vw,88px)] leading-[0.95]">{s.title}</h3>
                <p className="mt-5 max-w-[34ch] text-[19px] leading-[1.45] text-white/70">{s.body}</p>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-ink p-5 font-mono text-[13px] leading-[1.8] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                <div className="mb-3 flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                {s.log.map((line, k) => (
                  <motion.div
                    key={line}
                    initial={reduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + k * 0.12 }}
                    className={`whitespace-pre ${k === 0 ? "text-lime" : "text-white/75"}`}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
