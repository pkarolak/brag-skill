import type { Tech } from "../content";

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const iso = (x: number, y: number, z: number) => [(x - y) * C, (x + y) * S - z] as const;
const pts = (list: (readonly [number, number, number])[]) => list.map((p) => iso(...p).join(",")).join(" ");

type BoxProps = { x: number; y: number; z?: number; w: number; d: number; h: number; hot?: boolean };

function Box({ x, y, z = 0, w, d, h, hot }: BoxProps) {
  const stroke = hot ? "var(--color-lime)" : "rgba(255,255,255,0.42)";
  const fill = hot ? "rgba(199,255,159,0.10)" : "rgba(255,255,255,0.02)";
  const top = pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]);
  const left = pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]);
  const right = pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]);
  return (
    <g stroke={stroke} strokeWidth={1} fill={fill} strokeLinejoin="round" filter={hot ? "url(#glow)" : undefined}>
      <polygon points={left} />
      <polygon points={right} />
      <polygon points={top} />
    </g>
  );
}

function Line({ a, b, hot }: { a: [number, number, number]; b: [number, number, number]; hot?: boolean }) {
  const [x1, y1] = iso(...a);
  const [x2, y2] = iso(...b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? "var(--color-lime)" : "rgba(255,255,255,0.28)"} strokeDasharray={hot ? undefined : "3 4"} />;
}

function Floor() {
  const lines = [];
  for (let i = 0; i <= 8; i++) {
    lines.push(<Line key={`a${i}`} a={[i * 20, 0, 0]} b={[i * 20, 160, 0]} />);
    lines.push(<Line key={`b${i}`} a={[0, i * 20, 0]} b={[160, i * 20, 0]} />);
  }
  return <g opacity={0.35}>{lines}</g>;
}

function Scene({ art }: { art: Tech["art"] }) {
  switch (art) {
    case "harvest":
      return (
        <>
          <Floor />
          {[[10, 10], [120, 10], [10, 120], [120, 120]].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <Line a={[x + 15, y + 15, 10]} b={[80, 80, 22]} hot />
              <Box x={x} y={y} w={30} d={30} h={20} />
            </g>
          ))}
          <g className="wf-float">
            <Box x={62} y={62} w={36} d={36} h={44} hot />
          </g>
        </>
      );
    case "localize":
      return (
        <>
          <Floor />
          <Box x={40} y={40} w={80} d={80} h={14} />
          <g className="wf-float">
            <Box x={40} y={40} z={30} w={80} d={80} h={8} />
          </g>
          <g className="wf-float wf-delay">
            <Box x={40} y={40} z={56} w={80} d={80} h={8} hot />
          </g>
        </>
      );
    case "capture":
      return (
        <>
          <Floor />
          <Box x={30} y={70} w={100} d={6} h={78} />
          <g className="wf-float">
            <Box x={46} y={40} z={20} w={68} d={4} h={48} hot />
          </g>
          <Line a={[46, 42, 68]} b={[30, 70, 78]} />
          <Line a={[114, 42, 68]} b={[130, 70, 78]} />
          <Line a={[46, 42, 20]} b={[30, 70, 0]} />
          <Line a={[114, 42, 20]} b={[130, 70, 0]} />
        </>
      );
    case "frame":
      return (
        <>
          <Floor />
          {[0, 1, 2].map((i) => (
            <g key={i} className={i === 2 ? "wf-float" : undefined}>
              <Box x={36 + i * 6} y={44 - i * 6} z={i * 30} w={84} d={66} h={5} hot={i === 2} />
            </g>
          ))}
        </>
      );
    case "taste":
      return (
        <>
          <Floor />
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => {
              const hot = r === 1 && c === 1;
              return (
                <g key={`${r}${c}`} className={hot ? "wf-float" : undefined}>
                  <Box x={22 + c * 42} y={22 + r * 42} z={hot ? 26 : 0} w={30} d={30} h={hot ? 30 : 10 + ((r + c) % 3) * 6} hot={hot} />
                </g>
              );
            }),
          )}
        </>
      );
    case "export":
      return (
        <>
          <Floor />
          <Box x={56} y={56} w={48} d={48} h={34} hot />
          {[
            [8, 70, 0],
            [70, 8, 0],
            [128, 128, 0],
          ].map(([x, y], i) => (
            <g key={i} className={`wf-float ${i === 1 ? "wf-delay" : ""}`}>
              <Line a={[80, 80, 34]} b={[x + 12, y + 12, 34]} hot />
              <Box x={x} y={y} z={28} w={24} d={24} h={4} />
            </g>
          ))}
        </>
      );
  }
}

export function Wireframe({ art }: { art: Tech["art"] }) {
  return (
    <svg viewBox="-150 -60 300 210" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Scene art={art} />
    </svg>
  );
}
