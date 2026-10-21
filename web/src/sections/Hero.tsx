import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Product } from "../components/Product";
import { PROMPT, portfolios } from "../content";

const [spec, editorial, poster] = portfolios;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const rise = (d: number) => (reduced ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease: [0.2, 0.7, 0.2, 1] as const } });

  return (
    <section id="top" ref={ref} className="relative overflow-hidden bg-stone">
      <div className="wrap flex min-h-[calc(100svh-116px)] flex-col items-center pt-[clamp(48px,7vh,88px)] text-center">
        <motion.h1 {...rise(0)} className="h-display max-w-[13ch] text-[clamp(46px,6.8vw,100px)]">
          Your best work, found and framed
        </motion.h1>
        <motion.p {...rise(0.1)} className="mt-6 max-w-[38ch] text-[clamp(18px,1.5vw,21px)] leading-[1.45]">
          An agent skill that turns one email into a bespoke portfolio of case studies, built from everything a person shipped.
        </motion.p>
        <motion.div {...rise(0.2)} className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="#install" className="btn btn-solid">
            Get the skill
          </a>
          <a href="#portfolios" className="btn btn-line">
            See portfolios
          </a>
        </motion.div>
        <motion.p {...rise(0.25)} className="mt-5 text-[15px] text-ash">
          Then ask your agent: “{PROMPT}”
        </motion.p>

        <motion.div style={{ y: lift }} className="mt-auto flex w-full items-end justify-center gap-[clamp(12px,2.4vw,40px)] pb-[clamp(40px,6vh,72px)] pt-10">
          <motion.div {...rise(0.35)} className="hidden md:block">
            <Product p={spec} scale={0.74} />
          </motion.div>
          <motion.div {...rise(0.3)} className="drift">
            <Product p={editorial} scale={0.94} />
          </motion.div>
          <motion.div {...rise(0.4)} className="hidden md:block">
            <Product p={poster} scale={0.74} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
