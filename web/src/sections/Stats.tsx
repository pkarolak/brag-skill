import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "../components/Reveal";
import { statements, stats } from "../content";

function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.45"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.22, 1]);
  return (
    <motion.p
      ref={ref}
      style={reduced ? undefined : { opacity }}
      className="max-w-[30ch] text-[clamp(26px,3.2vw,44px)] leading-[1.15] tracking-[-0.035em]"
    >
      {text}
    </motion.p>
  );
}

export function Stats() {
  return (
    <section className="bg-ink pb-[clamp(96px,12vw,180px)] pt-6">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="display text-[clamp(88px,13vw,200px)] tabular-nums">{s.value}</div>
              <div className="mt-3 text-[18px] text-white/60">{s.label}</div>
            </Reveal>
          ))}
        </div>
        <div className="mt-[clamp(80px,10vw,150px)] grid gap-14 md:grid-cols-[1fr_2fr]">
          <Reveal>
            <h2 className="text-[clamp(30px,3vw,40px)] leading-[1.05] tracking-[-0.04em]">
              Impressive work, <span className="accent">buried</span>
            </h2>
          </Reveal>
          <div className="space-y-10">
            {statements.map((t) => (
              <Statement key={t} text={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
