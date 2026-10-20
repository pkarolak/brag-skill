import { isPrint } from "./route";

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Spread onto motion elements for scroll reveals. Inert in print mode and for reduced motion,
 *  so PDFs and full-page review screenshots never capture half-hidden content. */
export function reveal(delay = 0, y = 18) {
  if (isPrint || reduced) return {};
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -10% 0px" },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
  };
}

export const motionEnabled = !isPrint && !reduced;
