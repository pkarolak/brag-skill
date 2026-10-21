import { Reveal } from "../components/Reveal";
import { SourceFragment } from "../components/SourceFragment";
import { blob } from "../content";

type Tag = "sourced" | "inferred" | "embellished" | "cut";

const tagStyle: Record<Tag, { dot: string; chip: string }> = {
  sourced: { dot: "bg-ink", chip: "bg-ink text-white" },
  inferred: { dot: "bg-[#2f6fed]", chip: "bg-[#2f6fed] text-white" },
  embellished: { dot: "bg-[#ff4b1f]", chip: "bg-[#ff4b1f] text-white" },
  cut: { dot: "bg-ash", chip: "bg-black/[0.07] text-ash" },
};

const tags: { tag: Exclude<Tag, "cut">; line: string }[] = [
  { tag: "sourced", line: "Linked to the ticket, doc or message it came from." },
  { tag: "inferred", line: "Read from the evidence. You confirm it before sharing." },
  { tag: "embellished", line: "Generous framing, shown next to the plain version." },
];

const claims: { text: string; tag: Tag; note: string }[] = [
  { text: "Cut drop-off at payment by a third", tag: "sourced", note: "#payments-launches · Mar 14" },
  { text: "Led the checkout rebuild", tag: "embellished", note: "co-led with the payments team · PAY-412" },
  { text: "Saved about 40 support hours a month", tag: "inferred", note: "from refund ticket volume · confirm" },
  { text: "Designed the fraud model", tag: "cut", note: "not her work · removed" },
];

function Chip({ tag }: { tag: Tag }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ${tagStyle[tag].chip}`}>{tag}</span>;
}

function Ledger() {
  return (
    <div data-ui className="w-full max-w-[480px] rounded-[22px] bg-white p-[clamp(20px,2.4vw,32px)]">
      <div className="flex items-baseline justify-between gap-4 text-[14px]">
        <span className="font-medium">REVIEW.md</span>
        <span className="text-ash">Jane Doe<span className="hidden sm:inline"> · One-page checkout</span></span>
      </div>
      <ul className="mt-5 divide-y divide-black/[0.07]">
        {claims.map((c) => (
          <li key={c.text} className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className={`text-[17px] leading-snug ${c.tag === "cut" ? "text-ash line-through decoration-1" : ""}`}>{c.text}</p>
              <p className="mt-1 text-[13px] text-ash">{c.note}</p>
            </div>
            <Chip tag={c.tag} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ id, title, children, media, flip = false }: { id: string; title: string; children: React.ReactNode; media: React.ReactNode; flip?: boolean }) {
  return (
    <div className="grid items-center gap-12 *:min-w-0 md:grid-cols-2 md:gap-[clamp(40px,6vw,96px)]">
      <div className={flip ? "md:order-2" : ""}>
        <Reveal>
          <h3 id={id} className="h-display max-w-[12ch] text-[clamp(38px,4.4vw,64px)]">
            {title}
          </h3>
        </Reveal>
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
      <Reveal delay={0.14} className={flip ? "md:order-1" : ""}>
        {media}
      </Reveal>
    </div>
  );
}

export function Craft() {
  return (
    <section aria-labelledby="craft-title" className="bg-white pb-[clamp(96px,12vw,200px)] pt-[clamp(48px,6vw,96px)]">
      <div className="wrap">
        <Reveal>
          <h2 id="craft-title" className="h-display mx-auto max-w-[16ch] text-center text-[clamp(44px,6vw,88px)]">
            Generous, and still true
          </h2>
          <p className="mx-auto mt-6 max-w-[46ch] text-center text-[18px] leading-[1.55]">
            The most flattering version of the story that the evidence can carry. Nothing past it.
          </p>
        </Reveal>

        <div className="mt-[clamp(64px,7vw,112px)] space-y-[clamp(96px,11vw,160px)]">
          <Row
            id="grounded"
            title="Grounded, not invented"
            media={
              <div className="grid place-items-center rounded-[32px] bg-stone md:aspect-[5/4] p-[clamp(20px,4vw,56px)]">
                <Ledger />
              </div>
            }
          >
            <p className="mt-6 max-w-[42ch] text-[18px] leading-[1.55]">
              Ownership verbs and rounded-up numbers are fine. Invented projects, made-up metrics and other people's work are cut. Every claim lands in a
              private review file with one of three tags.
            </p>
            <dl className="mt-10 max-w-[460px] divide-y divide-black/10 border-y border-black/10">
              {tags.map(({ tag, line }) => (
                <div key={tag} className="grid grid-cols-[9.5rem_1fr] items-baseline gap-4 py-4">
                  <dt className="flex items-center gap-2.5 text-[20px] font-medium capitalize">
                    <span className={`h-2.5 w-2.5 rounded-full ${tagStyle[tag].dot}`} aria-hidden />
                    {tag}
                  </dt>
                  <dd className="text-[16px] leading-[1.45]">{line}</dd>
                </div>
              ))}
            </dl>
            <a href={blob("reference/storytelling.md")} className="btn btn-line mt-8">
              Read the storytelling rules
            </a>
          </Row>

          <Row
            id="proof"
            flip
            title="Proof behind every story"
            media={
              <div data-ui className="grid gap-3 rounded-[32px] bg-mist p-4 sm:grid-cols-2 sm:p-6">
                <SourceFragment kind="work" />
                <SourceFragment kind="design" />
                <SourceFragment kind="chat" />
                <SourceFragment kind="code" />
              </div>
            }
          >
            <p className="mt-6 max-w-[42ch] text-[18px] leading-[1.55]">
              Each case study ends with screenshots of the real artifacts: the epic, the doc, the frame, the pull requests, the kudos. Every one links back to
              where it came from.
            </p>
            <a href={blob("reference/sources.md")} className="btn btn-line mt-8">
              How proof is captured
            </a>
          </Row>

          <Row
            id="apps"
            title="Apps that still run"
            media={
              <div className="rounded-[32px] bg-ink p-[clamp(24px,4vw,48px)] text-white">
                <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] sm:text-[14px]">
                  <code>
                    <span className="text-white/50"># RUN-LOCALLY.md · standup-bot</span>
                    {"\n"}cp .env.local.example .env
                    {"\n"}bun install
                    {"\n"}bun run build && bun run start
                    {"\n\n"}
                    <span className="text-white/50"># analysis</span>
                    {"\n"}framework   vite · bun · sqlite
                    {"\n"}env keys    11 (names only, no values)
                    {"\n"}platform    deploy config + SSO headers noted
                    {"\n"}smoke       <span className="rounded bg-white px-1.5 text-ink">works</span>
                  </code>
                </pre>
              </div>
            }
          >
            <p className="mt-6 max-w-[42ch] text-[18px] leading-[1.55]">
              Tell it where your company hosts apps. It finds the ones a person built, clones them read-only, starts each one locally, and writes the guide
              that keeps the work alive after the platform moves on.
            </p>
            <a href={blob("reference/apps.md")} className="btn btn-line mt-8">
              How apps are localized
            </a>
          </Row>
        </div>
      </div>
    </section>
  );
}
