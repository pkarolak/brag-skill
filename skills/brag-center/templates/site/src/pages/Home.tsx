// Baseline structure only. Each run rewrites the layout and styling from DESIGN.md + tasteskill.
// Keep: locked projects (p.locked) render as title-only teasers that link to their case study (which shows the lock).
import { motion } from "motion/react";
import { formatDate, formatPeriod, heroMedia, story } from "../content/story";
import { hrefFor } from "../lib/route";
import { reveal } from "../lib/motion";
import { Media } from "../components/Media";
import { ExternalLink } from "../components/ExternalLink";

export function Home() {
  const { person, hero, impact, projects, testimonials = [], timeline = [], skills = [] } = story;
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-20">
        {hero.kicker ? <p className="mb-4 font-mono text-sm text-[var(--color-muted)]">{hero.kicker}</p> : null}
        <h1 className="font-[var(--font-display)] text-5xl leading-[1.05] tracking-tight">{hero.line.text}</h1>
        <p className="mt-6 text-lg">
          {person.name} · {person.title}
          {person.team ? ` · ${person.team}` : ""}
        </p>
        {hero.bio ? <p className="mt-4 max-w-2xl text-[var(--color-muted)]">{hero.bio.text}</p> : null}
      </header>

      <section aria-label="Impact" className="mb-24 grid grid-cols-2 gap-8 md:grid-cols-4">
        {impact.map((m, i) => (
          <motion.div key={m.label} {...reveal(i * 0.05)}>
            <div className="text-4xl tabular-nums">{m.value}</div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">{m.label}</div>
          </motion.div>
        ))}
      </section>

      <section aria-label="Work" className="mb-24 space-y-16">
        {projects.map((p) => {
          const m = heroMedia(p);
          return (
            <motion.a key={p.slug} href={hrefFor({ name: "work", slug: p.slug })} className="group block" {...reveal()}>
              {m ? <Media item={m} className="w-full" /> : null}
              <p className="mt-4 font-mono text-xs text-[var(--color-muted)]">{formatPeriod(p.period)}</p>
              <h2 className="mt-1 text-2xl group-hover:underline">{p.title.text}</h2>
              <p className="mt-2 max-w-2xl text-[var(--color-muted)]">{p.locked ? "Password protected" : p.summary.text}</p>
            </motion.a>
          );
        })}
      </section>

      {testimonials.length ? (
        <section aria-label="Voices" className="mb-24 grid gap-10 md:grid-cols-2">
          {testimonials.map((t) => (
            <motion.blockquote key={t.url} {...reveal()}>
              <p className="text-xl">“{t.quote}”</p>
              <footer className="mt-3 text-sm text-[var(--color-muted)]">
                <ExternalLink href={t.url}>
                  {t.author}
                  {t.role ? `, ${t.role}` : ""}
                </ExternalLink>
              </footer>
            </motion.blockquote>
          ))}
        </section>
      ) : null}

      {timeline.length ? (
        <section aria-label="Timeline" className="mb-24">
          <ol className="space-y-3">
            {timeline.map((e) => (
              <li key={e.date + e.label} className="grid grid-cols-[8rem_1fr] gap-4">
                <span className="font-mono text-sm text-[var(--color-muted)]">{formatDate(e.date)}</span>
                <span>{e.label}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {skills.length ? (
        <section aria-label="Toolbox">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {skills.map((s) => (
              <li key={s.name} title={s.evidence}>
                {s.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
