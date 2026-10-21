import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../components/Reveal";
import { SKILL_PATH, steps } from "../content";

export function Run() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced || !inView) return;
    const t = setTimeout(() => setI((v) => (v + 1) % steps.length), 4200);
    return () => clearTimeout(t);
  }, [i, paused, reduced, inView]);

  const s = steps[i];
  return (
    <section id="run" ref={ref} aria-labelledby="run-title" className="on-dark bg-ink py-[clamp(96px,12vw,200px)] text-white">
      <div className="wrap grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-[clamp(48px,6vw,96px)]">
        <div>
          <Reveal>
            <h2 id="run-title" className="h-display max-w-[11ch] text-[clamp(44px,5.4vw,80px)]">
              Breeze through a run
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[38ch] text-[18px] leading-[1.55] text-white/85">
              Ask once. The skill connects, harvests in parallel, writes the story, captures the proof and builds the site, asking only what it has to.
            </p>
          </Reveal>
          <ol className="mt-10 space-y-1" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {steps.map((st, k) => (
              <li key={st.title}>
                <button
                  type="button"
                  onClick={() => setI(k)}
                  aria-current={k === i ? "step" : undefined}
                  className={`text-left text-[clamp(24px,2.4vw,32px)] font-medium tracking-[-0.02em] transition-colors ${k === i ? "text-white" : "text-white/35 hover:text-white/70"}`}
                >
                  {st.title}
                </button>
              </li>
            ))}
          </ol>
          <a href={SKILL_PATH} className="btn btn-line mt-10">
            Read the workflow
          </a>
        </div>

        <div className="flex flex-col justify-center">
          <div className="min-h-[340px] rounded-[28px] bg-charcoal p-[clamp(24px,4vw,48px)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.title}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <p className="max-w-[44ch] text-[20px] leading-[1.45]">{s.body}</p>
                <pre className="mt-8 whitespace-pre-wrap break-words rounded-2xl bg-ink p-5 font-mono text-[13px] leading-[1.9] sm:text-[14px]">
                  <code>
                    {s.log.map((line, k) => (
                      <motion.span
                        key={line}
                        className={`block whitespace-pre ${k === 0 ? "text-white" : "text-white/65"}`}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 + k * 0.14 }}
                      >
                        {line}
                      </motion.span>
                    ))}
                  </code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
