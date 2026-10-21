import { Product } from "../components/Product";
import { Reveal } from "../components/Reveal";
import { SourceFragment } from "../components/SourceFragment";
import { blob, portfolios } from "../content";

const essay = portfolios[5];

function Row({ id, title, children, media, flip = false }: { id: string; title: string; children: React.ReactNode; media: React.ReactNode; flip?: boolean }) {
  return (
    <div className="grid items-center gap-12 *:min-w-0 md:grid-cols-2 md:gap-[clamp(32px,6vw,96px)]">
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
        </Reveal>

        <div className="mt-[clamp(72px,9vw,140px)] space-y-[clamp(96px,12vw,180px)]">
          <Row
            id="grounded"
            title="Grounded, not invented"
            media={
              <div className="grid place-items-center py-6">
                <Product p={essay} scale={1.18} />
              </div>
            }
          >
            <p className="mt-6 max-w-[42ch] text-[18px] leading-[1.55]">
              Ownership verbs, generous framing and rounded-up numbers are fine. Invented projects, made-up metrics and other people's work are not. Every claim
              is tagged in a private review file you read before sharing.
            </p>
            <div className="mt-8 inline-flex items-baseline gap-3 rounded-2xl bg-mist px-5 py-4">
              <span className="text-[36px] font-medium leading-none tracking-[-0.03em]">3</span>
              <span className="text-[15px]">confidence tags on every claim: sourced, inferred, embellished</span>
            </div>
          </Row>

          <Row
            id="proof"
            flip
            title="Proof behind every story"
            media={
              <div data-ui className="grid gap-3 rounded-[28px] bg-mist p-4 sm:grid-cols-2 sm:p-6">
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
            <figure className="mt-8 max-w-[440px] rounded-2xl bg-mist px-5 py-4">
              <blockquote className="text-[17px]">“Led the checkout rebuild.”</blockquote>
              <figcaption className="mt-1 text-[14px] text-ash">REVIEW.md · embellished: co-led with the payments team, per PAY-412</figcaption>
            </figure>
          </Row>

          <Row
            id="apps"
            title="Apps that still run"
            media={
              <div className="bg-ink p-[clamp(24px,4vw,48px)] text-white">
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
