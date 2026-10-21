import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Product } from "../components/Product";
import { PROMPT, portfolios } from "../content";

const [spec, editorial, poster] = portfolios;

/** What you type into your agent, typed out once the hero settles. */
function Prompt() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? PROMPT.length : 0);
  useEffect(() => {
    if (reduced) return setN(PROMPT.length);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < PROMPT.length) t = setTimeout(tick, 38 + Math.random() * 40);
    };
    t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [reduced]);
  const done = n >= PROMPT.length;

  return (
    <div data-ui className="flex h-14 w-[min(88vw,420px)] items-center gap-3 rounded-full bg-white pl-6 pr-2 text-left">
      <span className="sr-only">Ask your agent: {PROMPT}</span>
      <span aria-hidden className="min-w-0 flex-1 truncate text-[16px]">
        {PROMPT.slice(0, n)}
        {!done ? <span className="ml-px inline-block h-[1.1em] w-[1.5px] translate-y-[3px] bg-ink" /> : null}
      </span>
      <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-300 ${done ? "bg-ink text-white" : "bg-mist text-ash"}`}>
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
        </svg>
      </span>
    </div>
  );
}

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
          An agent skill that turns one email into a portfolio of case studies, for your promotion case, your next job, or a teammate who deserves the
          credit.
        </motion.p>
        <motion.div {...rise(0.2)} className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="#install" className="btn btn-solid">
            Get the skill
          </a>
          <a href="#portfolios" className="btn btn-line">
            See portfolios
          </a>
        </motion.div>
        <motion.div {...rise(0.25)} className="mt-10">
          <Prompt />
        </motion.div>

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
