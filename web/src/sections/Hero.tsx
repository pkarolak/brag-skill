import { motion, useReducedMotion } from "motion/react";
import { Carousel3D } from "../components/Carousel3D";
import { CopyCommand } from "../components/CopyCommand";
import { PROMPT } from "../content";

const words: { t: string; accent?: boolean }[] = [
  { t: "We" },
  { t: "find", accent: true },
  { t: "and" },
  { t: "frame", accent: true },
  { t: "your" },
  { t: "best" },
  { t: "work" },
];

export function Hero() {
  const reduced = useReducedMotion();
  return (
    <section id="top" className="relative overflow-hidden bg-ink pt-[116px] sm:pt-[124px]">
      <div className="wrap text-center">
        <h1 className="display mx-auto max-w-[13ch] text-[clamp(52px,7.4vw,108px)] font-normal">
          {words.map((w, i) => (
            <motion.span
              key={w.t}
              className={`inline-block ${w.accent ? "accent pr-[0.06em]" : ""}`}
              initial={reduced ? false : { opacity: 0, y: "0.35em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {w.t}
              {i < words.length - 1 ? "\u00a0" : ""}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="mx-auto mt-7 max-w-[34ch] text-[clamp(18px,1.6vw,22px)] leading-[1.4] text-white/70"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          An agent skill that turns one email into a bespoke portfolio of case studies, built from everything a person shipped.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-col items-center gap-3"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <CopyCommand />
          <p className="text-[14px] text-white/45">
            then ask your agent: <span className="text-white/75">“{PROMPT}”</span>
          </p>
        </motion.div>
      </div>
      <motion.div
        className="mt-4 pb-16 sm:mt-6"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <Carousel3D />
      </motion.div>
    </section>
  );
}
