import { sampleCycle, segmentBounds } from "@/lib/sizing/cycle";
import type { MotionCycle } from "@/lib/sizing/types";

export function CycleChart({ cycle }: { cycle: MotionCycle }) {
  const samples = sampleCycle(cycle, 20);
  const bounds = segmentBounds(cycle);
  if (samples.length < 2) return null;

  const tMax = Math.max(samples[samples.length - 1].t, 0.01);
  const vMax = Math.max(...samples.map((s) => Math.abs(s.v)), 0.01);
  const aMax = Math.max(...samples.map((s) => Math.abs(s.a)), 0.01);
  const W = 720;
  const H = 168;
  const padL = 36;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const midY = padT + innerH / 2;
  const x = (t: number) => padL + (t / tMax) * innerW;
  const yV = (v: number) => midY - (v / vMax) * (innerH * 0.42);
  const yA = (a: number) => midY - (a / aMax) * (innerH * 0.28);

  const vPath = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(1)} ${yV(s.v).toFixed(1)}`).join(" ");
  const aPath = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(1)} ${yA(s.a).toFixed(1)}`).join(" ");

  const firstMove = bounds[0];
  const shadeW = firstMove ? x(firstMove.t1) - x(firstMove.t0) : 0;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-card px-2 py-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full min-w-[28rem]" role="img" aria-label="Motion cycle profile">
        <rect x={padL} y={padT} width={innerW} height={innerH} fill="transparent" />
        {firstMove && firstMove.t1 > firstMove.t0 && (
          <rect
            x={x(firstMove.t0)}
            y={padT}
            width={Math.max(shadeW, 0)}
            height={innerH}
            fill="var(--color-warn)"
            opacity="0.16"
          />
        )}
        <line x1={padL} y1={midY} x2={W - padR} y2={midY} stroke="var(--color-border)" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--color-foreground)" strokeWidth="1.2" />
        <text x={8} y={padT + 10} fill="var(--color-muted-foreground)" fontSize="10">
          +
        </text>
        <text x={8} y={padT + innerH - 2} fill="var(--color-muted-foreground)" fontSize="10">
          −
        </text>
        {bounds.map((b) => (
          <g key={b.i}>
            <line
              x1={x(b.t1)}
              y1={padT}
              x2={x(b.t1)}
              y2={padT + innerH}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={(x(b.t0) + x(b.t1)) / 2}
              y={H - 8}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
              fontSize="11"
            >
              {b.i + 1}
            </text>
          </g>
        ))}
        <path d={aPath} fill="none" stroke="#d45aa0" strokeWidth="1.6" />
        <path d={vPath} fill="none" stroke="#5b8fd4" strokeWidth="2" />
      </svg>
      <div className="flex flex-wrap gap-4 px-2 pb-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-[#5b8fd4]" />
          Velocity
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-[#d45aa0]" />
          Acceleration
        </span>
        <span>Orange band = first segment</span>
      </div>
    </div>
  );
}
