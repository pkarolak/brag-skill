import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" };

export function Reveal({ children, delay = 0, y = 24, className = "", as = "div" }: Props) {
  const reduced = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}
