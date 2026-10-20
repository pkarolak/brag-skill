// Baseline structure only. Each run rewrites the layout and styling from DESIGN.md + tasteskill.
// Keep: data-print="case-study" + id on the root, ProofGallery, Media for video posters, ExternalLink for URLs.
import { motion } from "motion/react";
import type { Project } from "../content/story";
import { formatPeriod, heroMedia, isMetric, story } from "../content/story";
import { hrefFor, isPrint } from "../lib/route";
import { reveal } from "../lib/motion";
import { Media } from "../components/Media";
import { ProofGallery } from "../components/ProofGallery";
import { ExternalLink } from "../components/ExternalLink";

export function CaseStudy({ project: p }: { project: Project }) {
  const hero = heroMedia(p);
  const gallery = (p.media ?? []).filter((m) => m !== hero);
  const idx = story.projects.findIndex((x) => x.slug === p.slug);
  const next = story.projects[(idx + 1) % story.projects.length];

  return (
    <article id={p.slug} data-print="case-study" className="mx-auto max-w-6xl px-6 py-16">
      {!isPrint ? (
        <nav data-print="hide" className="mb-12 text-sm">
          <a href={hrefFor({ name: "home" })}>← {story.person.name}</a>
        </nav>
      ) : null}

      <header className="mb-12">
        <p className="font-mono text-xs text-[var(--color-muted)]">
          {formatPeriod(p.period)}
          {p.team ? ` · ${p.team}` : ""}
        </p>
        <h1 className="mt-2 text-4xl leading-tight tracking-tight">{p.title.text}</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">{p.summary.text}</p>
        {p.vibelab?.liveUrl ? (
          <p className="mt-4 text-sm">
            <ExternalLink href={p.vibelab.liveUrl}>Try it live</ExternalLink>
          </p>
        ) : null}
      </header>

      {hero ? <Media item={hero} className="mb-16 w-full" eager /> : null}

      <div className="grid gap-12 md:grid-cols-2">
        {(
          [
            ["Context", p.context],
            ["Challenge", p.challenge],
            ["Role", p.role],
            ["Outcome", p.outcome],
          ] as const
        ).map(([label, claim]) => (
          <motion.section key={label} {...reveal()} data-print="keep">
            <h2 className="mb-2 font-mono text-xs uppercase text-[var(--color-muted)]">{label}</h2>
            <p>{claim.text}</p>
          </motion.section>
        ))}
      </div>

      <section className="my-16" data-print="keep">
        <h2 className="mb-4 font-mono text-xs uppercase text-[var(--color-muted)]">Moves</h2>
        <ol className="space-y-3">
          {p.moves.map((m) => (
            <li key={m.text}>{m.text}</li>
          ))}
        </ol>
      </section>

      <section className="my-16 grid grid-cols-2 gap-8 md:grid-cols-3" aria-label="Impact" data-print="keep">
        {p.impact.map((x) =>
          isMetric(x) ? (
            <div key={x.label}>
              <div className="text-3xl tabular-nums">{x.value}</div>
              <div className="text-sm text-[var(--color-muted)]">{x.label}</div>
            </div>
          ) : (
            <p key={x.text}>{x.text}</p>
          ),
        )}
      </section>

      {gallery.length ? (
        <section className="my-16 grid gap-6 md:grid-cols-2" aria-label="Gallery">
          {gallery.map((m) => (
            <figure key={m.src}>
              <Media item={m} className="w-full" />
              {m.caption ? <figcaption className="mt-2 text-sm text-[var(--color-muted)]">{m.caption}</figcaption> : null}
            </figure>
          ))}
        </section>
      ) : null}

      <ProofGallery items={p.proof} classNames={{ root: "my-16", title: "mb-6 font-mono text-xs uppercase text-[var(--color-muted)]", meta: "mt-2 text-sm", label: "font-mono text-xs uppercase" }} />

      {p.vibelab?.localDoc ? (
        <p className="mt-8 text-sm text-[var(--color-muted)]">Runs outside Vibelab too: see {p.vibelab.localDoc}</p>
      ) : null}

      {!isPrint && next && next.slug !== p.slug ? (
        <nav data-print="hide" className="mt-24 border-t pt-8">
          <a href={hrefFor({ name: "work", slug: next.slug })} className="text-2xl">
            Next: {next.title.text} →
          </a>
        </nav>
      ) : null}
    </article>
  );
}
