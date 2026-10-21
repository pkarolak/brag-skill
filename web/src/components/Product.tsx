import type { Portfolio } from "../content";
import { PortfolioCard } from "./PortfolioCard";

const W = 300;
const H = 396;

/** A generated portfolio presented like a product shot: the card at a fixed design size, scaled whole, on a soft floor. */
export function Product({ p, scale = 1, floor = true, className = "" }: { p: Portfolio; scale?: number; floor?: boolean; className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: W * scale, height: H * scale }}>
      {floor ? (
        <div aria-hidden className="absolute -bottom-[6%] left-[8%] right-[8%] h-[9%] rounded-[50%] bg-black/25 blur-[18px]" />
      ) : null}
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <PortfolioCard p={p} />
      </div>
    </div>
  );
}
