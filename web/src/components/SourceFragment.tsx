import type { Source } from "../content";

const panel = "rounded-2xl bg-white/80 p-4 text-[13px] text-black shadow-[0_1px_0_rgba(0,0,0,0.04)]";

export function SourceFragment({ kind }: { kind: Source["fragment"] }) {
  switch (kind) {
    case "vibelab":
      return (
        <div className={`${panel} font-mono text-[12px] leading-[1.7]`}>
          <div className="font-sans text-[13px] font-medium">RUN-LOCALLY.md — meet-log</div>
          <div className="mt-2 text-black/60"># works outside Vibelab</div>
          <div>cp .env.local.example .env.local</div>
          <div>bun install && bun run dev</div>
          <div className="mt-2 flex flex-wrap gap-1.5 font-sans">
            {["vite", "bun", "sqlite", "11 env keys", "smoke: works"].map((t) => (
              <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] ${t === "smoke: works" ? "bg-black text-white" : "bg-black/[0.06]"}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    case "glean":
      return (
        <div className={`${panel} flex items-center gap-4`}>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black font-serif text-[22px] italic text-white">J</div>
          <div className="min-w-0">
            <div className="font-medium">Jane Doe</div>
            <div className="text-black/60">Staff Product Designer · Amsterdam</div>
            <div className="mt-1 truncate font-mono text-[11px] text-black/50">jira 624aa6a8… · slack U039YA…</div>
          </div>
        </div>
      );
    case "jira":
      return (
        <div className={`${panel} space-y-2`}>
          {[
            ["ADM-412", "Bulk board actions", "Done"],
            ["ADM-388", "Admin search rebuild", "Done"],
            ["ADM-455", "Audit log export", "In review"],
          ].map(([k, t, s]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-black/50">{k}</span>
              <span className="flex-1 truncate">{t}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${s === "Done" ? "bg-[#d3f5d1]" : "bg-black/[0.06]"}`}>{s}</span>
            </div>
          ))}
        </div>
      );
    case "slack":
      return (
        <div className={panel}>
          <div className="flex items-baseline gap-2">
            <span className="font-medium">Priya S.</span>
            <span className="text-[11px] text-black/45">#admin-launches · Mar 14</span>
          </div>
          <p className="mt-1 leading-[1.45]">Huge kudos to Jane, bulk actions cut our support tickets for board cleanup in half 🙌</p>
          <div className="mt-2 flex gap-1.5 text-[11px]">
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5">🎉 24</span>
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5">💯 9</span>
          </div>
        </div>
      );
    case "figma":
      return (
        <div className={`${panel} grid grid-cols-3 gap-2`}>
          {["Bulk select", "Confirm", "Empty state"].map((n, i) => (
            <div key={n}>
              <div className="aspect-[4/3] rounded-md bg-[#f1ece6] p-1.5">
                <div className="h-1.5 w-1/2 rounded-full bg-black/70" />
                <div className="mt-1.5 grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className={`h-2.5 rounded-[2px] ${j === i + 1 ? "bg-[#ff7a2f]" : "bg-black/10"}`} />
                  ))}
                </div>
              </div>
              <div className="mt-1 truncate text-[11px] text-black/60">{n} @2x</div>
            </div>
          ))}
        </div>
      );
    case "code":
      return (
        <div className={panel}>
          <div className="flex items-end gap-[3px]" aria-hidden>
            {[2, 4, 3, 6, 8, 5, 9, 12, 7, 10, 14, 11, 6, 9, 13, 16, 12, 8, 10, 15].map((h, i) => (
              <div key={i} className="flex-1 rounded-[2px] bg-[#6b54d6]" style={{ height: h * 3.4, opacity: 0.35 + h / 26 }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-black/60">
            <span>412 commits · 9 repos</span>
            <span>Mar 2024 – Oct 2026</span>
          </div>
        </div>
      );
    case "miro":
      return (
        <div className={`${panel} relative h-[118px] overflow-hidden bg-[#fbfbf6]`}>
          <div className="absolute left-3 top-3 h-[86px] w-[46%] rounded-md border border-black/15 p-2">
            <div className="text-[10px] text-black/50">Journey</div>
            <div className="mt-1 flex gap-1">
              {["#ffe9a8", "#cfe8ff", "#ffd3d3"].map((c) => (
                <div key={c} className="h-6 w-6 rounded-sm" style={{ background: c }} />
              ))}
            </div>
          </div>
          <svg className="absolute left-[48%] top-[46%] w-[12%]" viewBox="0 0 40 10" aria-hidden>
            <path d="M0 5h34m-5-4 5 4-5 4" stroke="#000" fill="none" strokeOpacity=".5" />
          </svg>
          <div className="absolute right-3 top-3 h-[86px] w-[34%] rounded-md bg-black p-2 text-[10px] text-white">
            copied to
            <div className="mt-1 font-serif text-[15px] italic leading-tight text-lime">Jane’s Miro</div>
          </div>
        </div>
      );
    case "taste":
      return (
        <div className={`${panel} font-mono text-[12px] leading-[1.7]`}>
          <div className="font-sans text-[13px] font-medium">DESIGN.md</div>
          <div><span className="text-black/45">concept</span> an editorial magazine of shipped work</div>
          <div><span className="text-black/45">type</span> display serif, clean sans</div>
          <div className="flex items-center gap-2">
            <span className="text-black/45">palette</span>
            {["#f3efe7", "#1b1a17", "#c2552f"].map((c) => (
              <span key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />
            ))}
          </div>
          <div><span className="text-black/45">banned</span> #FFD02F, gradients, emoji</div>
        </div>
      );
  }
}
