import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Product } from "../components/Product";
import { INSTALL, PROMPT, portfolios } from "../content";

const [spec, editorial, poster] = portfolios;

/** The whole how-to in two lines: install once, then ask. Reads as reference, not as a button. */
function Recipe() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the command stays selectable */
    }
  };
  const row = "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-5 py-3.5 sm:grid-cols-[5.5rem_1fr_auto] sm:px-6";

  return (
    <dl className="w-[min(90vw,540px)] divide-y divide-black/10 rounded-2xl border border-black/10 text-left">
      <div className={row}>
        <dt className="text-[14px] text-ash">Install</dt>
        <dd className="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-1">
          <code className="block break-words font-mono text-[13px] sm:truncate sm:text-[14px]">{INSTALL}</code>
        </dd>
        <dd className="justify-self-end">
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy install command: ${INSTALL}`}
            className="rounded-full px-2.5 py-1 text-[13px] text-ash underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
          </button>
        </dd>
      </div>
      <div className={row}>
        <dt className="col-span-2 text-[14px] text-ash sm:col-span-1">Then ask</dt>
        <dd className="col-span-2 min-w-0">
          <code className="block break-words font-mono text-[13px] sm:truncate sm:text-[14px]">{PROMPT}</code>
        </dd>
      </div>
    </dl>
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
          Get a portfolio of your recent work for a promotion or your next job. For you and your peers: all it needs is an email address.
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
          <Recipe />
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
