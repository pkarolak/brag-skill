import type { Portfolio } from "../content";

/** A slice of a generated portfolio, one per art direction. Rendered as real UI, not an image. */
export function PortfolioCard({ p }: { p: Portfolio }) {
  const shell = "relative h-full w-full overflow-hidden rounded-[26px] select-none";
  switch (p.style) {
    case "spec":
      return (
        <div data-ui className={`${shell} bg-[#0e1116] p-6 text-[#d7e2ee]`}>
          <div className="flex items-center justify-between text-[11px] tabular-nums text-[#7d8ea3]">
            <span>{p.person}</span>
            <span>rev 2026.10</span>
          </div>
          <div className="mt-8 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5eead4]">{p.title}</div>
          <div className="mt-2 text-[26px] leading-[1.05] tracking-[-0.03em]">{p.line}</div>
          <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-3 tabular-nums">
            <div className="rounded-lg bg-[#161b22] p-3">
              <div className="text-[30px] leading-none text-[#5eead4]">{p.metric}</div>
              <div className="mt-1 text-[10px] text-[#7d8ea3]">{p.metricLabel}</div>
            </div>
            <div className="rounded-lg bg-[#161b22] p-3">
              <svg viewBox="0 0 100 40" className="h-[42px] w-full" aria-hidden>
                <polyline points="0,6 15,9 30,8 45,18 60,26 75,31 100,34" fill="none" stroke="#5eead4" strokeWidth="2" />
              </svg>
              <div className="text-[10px] text-[#7d8ea3]">deploy time, 12 mo</div>
            </div>
          </div>
        </div>
      );
    case "editorial":
      return (
        <div data-ui className={`${shell} bg-[#f3efe7] p-6 text-[#1b1a17]`}>
          <div className="text-[11px] tracking-wide">{p.person} — Case studies</div>
          <div className="mt-6 font-serif text-[34px] leading-[0.98] tracking-[-0.02em]">{p.line}</div>
          <div className="absolute inset-x-6 bottom-6">
            <div className="h-[118px] rounded-md bg-[#d9cfbf] p-3">
              <div className="h-full rounded bg-[#fbf9f4] p-2">
                <div className="h-2 w-1/3 rounded-full bg-[#1b1a17]/80" />
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded-sm ${i === 2 ? "bg-[#c2552f]" : "bg-[#e7e0d4]"}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-[11px]">
              <span>{p.title}</span>
              <span className="font-serif text-[15px] italic">{p.metric} {p.metricLabel}</span>
            </div>
          </div>
        </div>
      );
    case "poster":
      return (
        <div data-ui className={`${shell} bg-[#ff4b1f] p-6 text-[#111]`}>
          <div className="text-[64px] font-medium leading-[0.85] tracking-[-0.07em] uppercase">
            {p.person.split(" ").map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="mt-4 max-w-[80%] text-[19px] leading-[1.1] tracking-[-0.02em]">{p.line}</div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="text-[54px] font-medium leading-none tracking-[-0.06em]">{p.metric}</div>
            <div className="text-right text-[11px] leading-tight">{p.metricLabel}<br />{p.title}</div>
          </div>
        </div>
      );
    case "field":
      return (
        <div data-ui className={`${shell} bg-[#ece4cf] p-6 text-[#2c2a22]`}>
          <div className="font-serif text-[13px] italic">field notes · {p.person}</div>
          <div className="mt-5 font-serif text-[30px] leading-[1.02]">{p.line}</div>
          <div className="absolute inset-x-6 bottom-6 space-y-2">
            {["“I export it to a sheet every Friday.”", "“Search is fine. Trust is the problem.”"].map((q) => (
              <div key={q} className="rounded-sm bg-[#fff8e6] px-3 py-2 font-serif text-[13px] italic shadow-[2px_2px_0_#cfc4a6]">
                {q}
              </div>
            ))}
            <div className="pt-1 text-[11px]">{p.metric} {p.metricLabel} · {p.title}</div>
          </div>
        </div>
      );
    case "control":
      return (
        <div data-ui className={`${shell} bg-[#111] p-5 text-white`}>
          <div className="flex items-center gap-2 text-[11px] text-[#9a9a9a]">
            <span className="h-2 w-2 rounded-full bg-[#38d26b]" /> {p.person} · {p.title}
          </div>
          <div className="mt-5 text-[25px] leading-[1.05] tracking-[-0.03em]">{p.line}</div>
          <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2">
            {[
              [p.metric, p.metricLabel],
              ["14", "services"],
              ["9 wk", "early"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-[#1d1d1d] p-3">
                <div className="text-[22px] tabular-nums leading-none text-[#38d26b]">{v}</div>
                <div className="mt-1 text-[10px] text-[#8a8a8a]">{l}</div>
              </div>
            ))}
            <div className="col-span-3 flex h-12 items-end gap-1 rounded-xl bg-[#1d1d1d] p-2">
              {[30, 45, 38, 60, 52, 70, 64, 82, 76, 90, 88, 96].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-[#38d26b]/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      );
    case "essay":
      return (
        <div data-ui className={`${shell} bg-white p-7 text-[#161616]`}>
          <div className="text-[11px] text-[#777]">{p.person} · {p.title}</div>
          <div className="mt-6 font-serif text-[29px] leading-[1.05]">{p.line}</div>
          <div className="mt-5 space-y-2 text-[12px] leading-[1.55] text-[#333]">
            <p>The request was a dashboard. The problem was that four teams counted the same thing four ways.</p>
            <p className="border-l-2 border-[#161616] pl-3 font-serif text-[15px] italic">So we agreed on one number first.</p>
          </div>
          <div className="absolute bottom-6 left-7 text-[11px] text-[#777]">{p.metric} {p.metricLabel}</div>
        </div>
      );
    case "report":
      return (
        <div data-ui className={`${shell} bg-[#f7f7f2] p-6 text-[#15171a]`}>
          <div className="text-[11px] text-[#666]">{p.person} · {p.title}</div>
          <div className="mt-4 text-[24px] leading-[1.05] tracking-[-0.03em]">{p.line}</div>
          <div className="absolute inset-x-6 bottom-6">
            <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
              {[18, 26, 22, 31, 29, 44, 52, 58].map((h, i) => (
                <rect key={i} x={i * 25 + 4} y={100 - h * 1.5} width="16" height={h * 1.5} fill={i >= 5 ? "#2f6fed" : "#c9ccd4"} />
              ))}
              <line x1="122" y1="4" x2="122" y2="102" stroke="#2f6fed" strokeDasharray="3 3" />
              <text x="126" y="12" fontSize="9" fill="#2f6fed" fontFamily="Instrument Serif" fontStyle="italic">new onboarding</text>
            </svg>
            <div className="mt-1 flex justify-between text-[11px]">
              <span className="text-[24px] tabular-nums leading-none text-[#2f6fed]">{p.metric}</span>
              <span className="self-end text-[#666]">{p.metricLabel}</span>
            </div>
          </div>
        </div>
      );
    case "play":
      return (
        <div data-ui className={`${shell} bg-[#1a0fff] p-6 text-white`}>
          <div className="text-[11px] opacity-80">{p.person} · {p.title}</div>
          <div className="mt-5 text-[30px] font-medium leading-[0.98] tracking-[-0.05em]">{p.line}</div>
          <div className="absolute bottom-6 left-6 right-6 h-[120px]">
            <div className="absolute left-2 top-6 h-16 w-16 rotate-[-12deg] rounded-2xl bg-[#7cf0c5]" />
            <div className="absolute left-20 top-0 h-20 w-20 rounded-full bg-[#ff5ad1]" />
            <div className="absolute right-4 top-8 h-14 w-24 rotate-[8deg] rounded-xl bg-white text-center text-[12px] leading-[56px] text-[#1a0fff]">drag me</div>
            <div className="absolute bottom-0 left-0 text-[11px] opacity-80">{p.metric} {p.metricLabel}</div>
          </div>
        </div>
      );
  }
}
