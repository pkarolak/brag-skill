import { useEffect, useRef, useState } from "react";
import { Product } from "../components/Product";
import { Reveal } from "../components/Reveal";
import { blob, portfolios } from "../content";

const GAP = 20;

function usePerPage() {
  const read = () => (matchMedia("(min-width: 1024px)").matches ? 3 : matchMedia("(min-width: 640px)").matches ? 2 : 1);
  const [per, setPer] = useState(read);
  useEffect(() => {
    const on = () => setPer(read());
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return per;
}

export function Directions() {
  const per = usePerPage();
  const pages = Math.ceil(portfolios.length / per);
  const [page, setPage] = useState(0);
  const start = useRef<number | null>(null);
  const current = Math.min(page, pages - 1);
  const go = (i: number) => setPage(Math.max(0, Math.min(pages - 1, i)));

  return (
    <section id="portfolios" aria-labelledby="portfolios-title" className="bg-white pb-[clamp(96px,12vw,200px)]">
      <div className="wrap">
        <Reveal>
          <h2 id="portfolios-title" className="h-display mx-auto max-w-[18ch] text-center text-[clamp(44px,6vw,88px)]">
            One email, a style of its own
          </h2>
        </Reveal>
        <div className="mt-8 flex items-center justify-between gap-6">
          <p className="max-w-[46ch] text-[18px] leading-[1.5]">Every site is built once, for one person. Here are eight directions it has taken.</p>
          <div className="flex shrink-0 gap-2">
            {[
              [-1, "Previous portfolios", "M10 3L5 8l5 5"],
              [1, "Next portfolios", "M6 3l5 5-5 5"],
            ].map(([d, label, path]) => {
              const disabled = (d === -1 && current === 0) || (d === 1 && current === pages - 1);
              return (
                <button
                  key={label as string}
                  type="button"
                  aria-label={label as string}
                  disabled={disabled}
                  onClick={() => go(current + (d as number))}
                  className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-mist active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d={path as string} />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="mt-10 touch-pan-y select-none overflow-hidden"
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => (start.current = e.clientX)}
          onPointerUp={(e) => {
            if (start.current === null) return;
            const dx = e.clientX - start.current;
            start.current = null;
            if (Math.abs(dx) > 48) go(current + (dx < 0 ? 1 : -1));
          }}
        >
          <ul
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
            style={{ gap: GAP, transform: `translateX(calc(${-current * 100}% - ${current * GAP}px))` }}
          >
            {portfolios.map((p, i) => {
              const shown = Math.floor(i / per) === current;
              return (
                <li key={p.style} aria-hidden={!shown} inert={!shown} className="shrink-0" style={{ width: `calc((100% - ${(per - 1) * GAP}px) / ${per})` }}>
                  <div className="grid aspect-[4/5] place-items-center rounded-[28px] bg-mist">
                    <Product p={p} scale={0.86} />
                  </div>
                  <h3 className="mt-5 text-[19px] font-medium">{p.caption}</h3>
                  <a href={blob("reference/art-direction.md")} className="group mt-2 inline-flex items-center gap-2 text-[15px]">
                    See the art direction
                    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show portfolios, page ${i + 1} of ${pages}`}
              aria-current={i === current}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-ink" : "w-2 bg-black/20 hover:bg-black/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
