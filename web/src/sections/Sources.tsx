import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "../components/Reveal";
import { SourceFragment } from "../components/SourceFragment";
import { sources } from "../content";

export function Sources() {
  const reduced = useReducedMotion();
  return (
    <section id="sources" className="bg-paper py-[clamp(88px,10vw,150px)] text-ink">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <h2 className="display text-[clamp(52px,7vw,104px)]">
              Eight sources.
              <br />
              <span className="font-serif italic tracking-[-0.02em]">One story.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[34ch] text-[18px] leading-[1.45] text-black/65">
              Every connection your agent already has is read in parallel. Vibelab leads, because a working app is the best proof there is.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {sources.map((s, i) => (
            <motion.article
              key={s.name}
              className="flex flex-col rounded-[32px] p-7 sm:p-9"
              style={{ background: s.color, color: s.ink === "light" ? "#fff" : "#000" }}
              initial={reduced ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              whileHover={reduced ? undefined : { y: -4 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-[clamp(34px,3.4vw,48px)] leading-none tracking-[-0.05em]">{s.name}</h3>
                  <p className="mt-2 text-[16px] opacity-70">{s.role}</p>
                </div>
                <a
                  href={s.doc}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[14px] transition-colors ${
                    s.ink === "light" ? "border-white/40 hover:bg-white hover:text-black" : "border-black/25 hover:bg-black hover:text-white"
                  }`}
                >
                  {s.fragment === "taste" ? "tasteskill.dev ↗" : "Read the playbook ↗"}
                </a>
              </div>
              <ul className="mt-8 space-y-2.5 text-[16px] leading-[1.4]">
                {s.facts.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <SourceFragment kind={s.fragment} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
