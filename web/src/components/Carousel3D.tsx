import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { portfolios } from "../content";
import { PortfolioCard } from "./PortfolioCard";

const ring = [...portfolios, ...portfolios];
const CARD_W = 300;
const CARD_H = 396;

export function Carousel3D() {
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let offset = 0;
    let speed = reduced ? 0 : 0.00011;
    let target = speed;
    let last = performance.now();
    let raf = 0;

    const layout = () => {
      const w = el.clientWidth;
      const card = Math.min(300, Math.max(210, w * 0.2));
      const radius = Math.max(640, w * 0.78);
      const step = (card + Math.max(18, w * 0.016)) / radius;
      const span = step * ring.length;
      ring.forEach((_, i) => {
        const node = items.current[i];
        if (!node) return;
        let t = ((i * step + offset) % span + span) % span;
        if (t > span / 2) t -= span;
        const vis = Math.abs(t) < 1.15;
        node.style.visibility = vis ? "visible" : "hidden";
        node.style.opacity = `${Math.max(0, Math.min(1, (1.15 - Math.abs(t)) / 0.25))}`;
        node.style.transform = `translate3d(${radius * Math.sin(t)}px,0,${radius * (1 - Math.cos(t))}px) rotateY(${-t}rad) scale(${card / CARD_W})`;
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      speed += (target - speed) * 0.06;
      offset -= speed * dt;
      layout();
      raf = requestAnimationFrame(tick);
    };

    const slow = () => (target = reduced ? 0 : 0.00002);
    const resume = () => (target = reduced ? 0 : 0.00011);
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", resume);
    window.addEventListener("resize", layout);
    layout();
    if (!reduced) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", resume);
      window.removeEventListener("resize", layout);
    };
  }, [reduced]);

  return (
    <div
      ref={stage}
      aria-label="Examples of portfolios Brag Center has art-directed"
      className="relative h-[clamp(360px,34vw,480px)] w-full overflow-hidden"
      style={{ perspective: "1500px", perspectiveOrigin: "50% 40%" }}
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d", transform: "translateZ(-260px)" }}>
        {ring.map((p, i) => (
          <div
            key={i}
            ref={(n) => {
              items.current[i] = n;
            }}
            aria-hidden={i >= portfolios.length}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2, backfaceVisibility: "hidden" }}
          >
            <PortfolioCard p={p} />
            <div className="pointer-events-none absolute -bottom-7 left-1 text-[12px] text-white/50">{p.kind}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
