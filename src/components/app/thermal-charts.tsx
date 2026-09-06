import {
  gearboxRatedLine,
  gearboxThermalCurve,
  motorPeakCurve,
  motorS1Curve,
  operatingPoints,
  type CurvePt,
  type OpPt,
} from "@/lib/sizing/thermal";
import type { MatchScore, MotionCycle, SizingResult } from "@/lib/sizing/types";

function polyline(pts: CurvePt[], x: (n: number) => number, y: (t: number) => number): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.n).toFixed(1)} ${y(p.t).toFixed(1)}`).join(" ");
}

function ChartFrame({
  title,
  xLabel,
  yLabel,
  nMax,
  tMax,
  curves,
  points,
}: {
  title: string;
  xLabel: string;
  yLabel: string;
  nMax: number;
  tMax: number;
  curves: { pts: CurvePt[]; color: string; width: number; label: string }[];
  points: OpPt[];
}) {
  const W = 640;
  const H = 236;
  const padL = 48;
  const padR = 72;
  const padT = 26;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xn = Math.max(nMax, 1);
  const yt = Math.max(tMax, 1);
  const x = (n: number) => padL + (n / xn) * innerW;
  const y = (t: number) => padT + innerH - (t / yt) * innerH;
  const xTicks = 8;
  const yTicks = 6;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-card p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[18rem]" role="img" aria-label={title}>
        <text x={padL} y={16} fill="var(--color-foreground)" fontSize="12">
          {title}
        </text>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const tv = (yt * i) / yTicks;
          const yy = y(tv);
          return (
            <g key={`y${i}`}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--color-border)" strokeWidth="1" />
              <text x={padL - 6} y={yy + 3} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="9">
                {tv >= 10 ? tv.toFixed(0) : tv.toFixed(1)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const nv = (xn * i) / xTicks;
          const xx = x(nv);
          return (
            <g key={`x${i}`}>
              <line x1={xx} y1={padT} x2={xx} y2={padT + innerH} stroke="var(--color-border)" strokeWidth="1" />
              <text x={xx} y={H - 12} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="9">
                {nv.toFixed(0)}
              </text>
            </g>
          );
        })}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--color-foreground)" strokeWidth="1.2" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--color-foreground)" strokeWidth="1.2" />
        {curves.map((c) => (
          <path key={c.label} d={polyline(c.pts, x, y)} fill="none" stroke={c.color} strokeWidth={c.width} />
        ))}
        {curves.map((c) => {
          const last = c.pts[c.pts.length - 1];
          if (!last) return null;
          return (
            <text
              key={`${c.label}-lab`}
              x={Math.min(x(last.n) + 4, W - 8)}
              y={y(last.t) + 3}
              fill={c.color}
              fontSize="10"
            >
              {c.label}
            </text>
          );
        })}
        {points.map((p) => (
          <g key={p.id}>
            <circle
              cx={x(Math.min(p.n, xn))}
              cy={y(Math.max(p.t, 0))}
              r={p.kind === "s1" ? 5.5 : 4}
              fill={p.kind === "s1" ? "#e8a35a" : p.kind === "peak" ? "#7ec8c3" : "#b6a4de"}
              stroke="#0c0e11"
              strokeWidth="1"
            />
            <text
              x={x(Math.min(p.n, xn)) + 8}
              y={y(Math.max(p.t, 0)) - 6}
              fill="var(--color-foreground)"
              fontSize="10"
            >
              {p.label}
            </text>
          </g>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10">
          {xLabel}
        </text>
        <text
          x={14}
          y={H / 2}
          fill="var(--color-muted-foreground)"
          fontSize="10"
          transform={`rotate(-90 14 ${H / 2})`}
          textAnchor="middle"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}

export function ThermalCharts({
  result,
  match,
  cycle,
}: {
  result: SizingResult;
  match: MatchScore;
  cycle?: MotionCycle;
}) {
  const mPeak = motorPeakCurve(match.motor);
  const mS1 = motorS1Curve(match.motor);
  const gRated = gearboxRatedLine(match.gearbox);
  const gTh = gearboxThermalCurve(match.gearbox);
  const ops = operatingPoints(result, match, cycle);
  const motorNMax = match.motor.ratedSpeedRpm * 1.2;
  const motorTMax = match.motor.peakTorqueNm * 1.15;
  const gbNMax = match.gearbox.maxInputRpm;
  const gbTMax = Math.max(match.gearbox.ratedOutputNm, result.peakTorqueNm) * 1.1;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Where this pair sits against its own limits. Lines are the drive’s capacity. Dots are what the machine
        asks for. If a dot sits above a line, that demand is too high.
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[#7ec8c3]" />
          Short bursts the motor / gear can take
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[#e07a5f]" />
          What it can run all day without overheating
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#e8a35a]" />
          Average over the cycle (heats the winding)
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#7ec8c3]" />
          Hardest instant (accel / raise)
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#b6a4de]" />
          Holding still
        </li>
      </ul>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChartFrame
          title={`Motor  ·  ${match.motor.name}`}
          xLabel="Motor speed (1/min)"
          yLabel="Torque at the motor (N·m)"
          nMax={motorNMax}
          tMax={motorTMax}
          curves={[
            { pts: mPeak, color: "#7ec8c3", width: 1.8, label: "Burst" },
            { pts: mS1, color: "#e07a5f", width: 1.6, label: "All-day" },
          ]}
          points={ops.motor}
        />
        {match.gearbox.kind !== "direct" && (
          <ChartFrame
            title={`Gear unit  ·  ${match.gearbox.name}`}
            xLabel="Input speed (1/min)"
            yLabel="Torque at the output shaft (N·m)"
            nMax={gbNMax}
            tMax={gbTMax}
            curves={[
              { pts: gRated, color: "#7ec8c3", width: 1.6, label: "Rated" },
              { pts: gTh, color: "#e07a5f", width: 1.6, label: "At speed" },
            ]}
            points={ops.gearbox}
          />
        )}
      </div>
    </div>
  );
}
