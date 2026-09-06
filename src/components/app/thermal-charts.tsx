import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  gearboxRatedLine,
  gearboxThermalCurve,
  motorPeakCurve,
  motorS1Curve,
  inverterLimitCurves,
  operatingPoints,
  type CurvePt,
  type OpPt,
} from "@/lib/sizing/thermal";
import type { MatchScore, MotionCycle, SizingResult } from "@/lib/sizing/types";
import { useT } from "@/lib/i18n/locale";

function polyline(pts: CurvePt[], x: (n: number) => number, y: (t: number) => number): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.n).toFixed(1)} ${y(p.t).toFixed(1)}`).join(" ");
}

function interpT(pts: CurvePt[], n: number): number | null {
  if (!pts.length) return null;
  if (n <= pts[0].n) return pts[0].t;
  const last = pts[pts.length - 1];
  if (n >= last.n) return last.t;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (n <= b.n) {
      const u = (n - a.n) / Math.max(b.n - a.n, 1e-9);
      return a.t + u * (b.t - a.t);
    }
  }
  return last.t;
}

function fmtN(n: number): string {
  return n >= 100 ? n.toFixed(0) : n.toFixed(1);
}

function fmtT(t: number): string {
  const a = Math.abs(t);
  if (a >= 100) return t.toFixed(0);
  if (a >= 10) return t.toFixed(1);
  return t.toFixed(2);
}

function ChartFrame({
  title,
  xLabel,
  yLabel,
  nMax,
  tMax,
  curves,
  points,
  tall,
}: {
  title: string;
  xLabel: string;
  yLabel: string;
  nMax: number;
  tMax: number;
  curves: { pts: CurvePt[]; color: string; width: number; label: string }[];
  points: OpPt[];
  tall?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const W = tall ? 920 : 640;
  const H = tall ? 420 : 236;
  const padL = tall ? 56 : 48;
  const padR = tall ? 88 : 72;
  const padT = 28;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xn = Math.max(nMax, 1);
  const yt = Math.max(tMax, 1);
  const x = (n: number) => padL + (n / xn) * innerW;
  const y = (tq: number) => padT + innerH - (tq / yt) * innerH;

  const plot = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full min-w-[18rem] cursor-zoom-in"
      role="img"
      aria-label={title}
    >
      <text x={padL} y={16} fill="var(--color-foreground)" fontSize={tall ? 14 : 12}>
        {title}
      </text>
      {Array.from({ length: (tall ? 8 : 6) + 1 }, (_, i) => {
        const ticks = tall ? 8 : 6;
        const tv = (yt * i) / ticks;
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
      {Array.from({ length: 9 }, (_, i) => {
        const nv = (xn * i) / 8;
        const xx = x(nv);
        return (
          <g key={`x${i}`}>
            <line x1={xx} y1={padT} x2={xx} y2={padT + innerH} stroke="var(--color-border)" strokeWidth="1" />
            <text x={xx} y={H - 14} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="9">
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
          <text key={`${c.label}-lab`} x={Math.min(x(last.n) + 4, W - 8)} y={y(last.t) + 3} fill={c.color} fontSize="10">
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
          <text x={x(Math.min(p.n, xn)) + 8} y={y(Math.max(p.t, 0)) - 6} fill="var(--color-foreground)" fontSize="10">
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
  );

  return (
    <>
      <button
        type="button"
        className="w-full rounded-[var(--radius-md)] border border-border bg-card p-2 text-left"
        onClick={() => setOpen(true)}
        aria-label={t("thermal.open")}
      >
        {plot}
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[var(--radius-lg)] border border-border bg-card p-3 shadow-lg sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{t("thermal.open")}</p>
                <button
                  type="button"
                  className="h-8 rounded-[var(--radius-sm)] px-3 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {t("thermal.close")}
                </button>
              </div>
              <PopupChart
                title={title}
                xLabel={xLabel}
                yLabel={yLabel}
                nMax={nMax}
                tMax={tMax}
                curves={curves}
                points={points}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function PopupChart(props: {
  title: string;
  xLabel: string;
  yLabel: string;
  nMax: number;
  tMax: number;
  curves: { pts: CurvePt[]; color: string; width: number; label: string }[];
  points: OpPt[];
}) {
  const t = useT();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ n: number; torque: number } | null>(null);
  const W = 920;
  const H = 420;
  const padL = 56;
  const padR = 88;
  const padT = 28;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xn = Math.max(props.nMax, 1);
  const yt = Math.max(props.tMax, 1);
  const x = (n: number) => padL + (n / xn) * innerW;
  const y = (tq: number) => padT + innerH - (tq / yt) * innerH;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        /* parent closes via backdrop; keep hover reset */
        setHover(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    const n = ((px - padL) / innerW) * xn;
    const torque = ((padT + innerH - py) / innerH) * yt;
    if (n < -xn * 0.02 || n > xn * 1.02 || torque < -yt * 0.05) {
      setHover(null);
      return;
    }
    setHover({ n: Math.max(0, Math.min(xn, n)), torque: Math.max(0, torque) });
  }

  return (
    <>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-[min(70vh,28rem)] w-full cursor-crosshair"
        role="img"
        aria-label={props.title}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <text x={padL} y={16} fill="var(--color-foreground)" fontSize="14">
          {props.title}
        </text>
        {Array.from({ length: 9 }, (_, i) => {
          const tv = (yt * i) / 8;
          const yy = y(tv);
          return (
            <g key={`y${i}`}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--color-border)" strokeWidth="1" />
              <text x={padL - 6} y={yy + 3} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="10">
                {tv >= 10 ? tv.toFixed(0) : tv.toFixed(1)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const nv = (xn * i) / 8;
          const xx = x(nv);
          return (
            <g key={`x${i}`}>
              <line x1={xx} y1={padT} x2={xx} y2={padT + innerH} stroke="var(--color-border)" strokeWidth="1" />
              <text x={xx} y={H - 14} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10">
                {nv.toFixed(0)}
              </text>
            </g>
          );
        })}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--color-foreground)" strokeWidth="1.2" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--color-foreground)" strokeWidth="1.2" />
        {props.curves.map((c) => (
          <path key={c.label} d={polyline(c.pts, x, y)} fill="none" stroke={c.color} strokeWidth={c.width + 0.4} />
        ))}
        {props.curves.map((c) => {
          const last = c.pts[c.pts.length - 1];
          if (!last) return null;
          return (
            <text key={`${c.label}-lab`} x={Math.min(x(last.n) + 4, W - 8)} y={y(last.t) + 3} fill={c.color} fontSize="12">
              {c.label}
            </text>
          );
        })}
        {props.points.map((p) => (
          <g key={p.id}>
            <circle
              cx={x(Math.min(p.n, xn))}
              cy={y(Math.max(p.t, 0))}
              r={p.kind === "s1" ? 6 : 5}
              fill={p.kind === "s1" ? "#e8a35a" : p.kind === "peak" ? "#7ec8c3" : "#b6a4de"}
              stroke="#0c0e11"
              strokeWidth="1"
            />
            <text x={x(Math.min(p.n, xn)) + 8} y={y(Math.max(p.t, 0)) - 6} fill="var(--color-foreground)" fontSize="11">
              {p.label}
            </text>
          </g>
        ))}
        {hover && (
          <g pointerEvents="none">
            <line
              x1={x(hover.n)}
              y1={padT}
              x2={x(hover.n)}
              y2={padT + innerH}
              stroke="var(--color-foreground)"
              strokeOpacity="0.4"
              strokeDasharray="4 3"
            />
            {props.curves.map((c) => {
              const tv = interpT(c.pts, hover.n);
              if (tv == null) return null;
              return <circle key={`h-${c.label}`} cx={x(hover.n)} cy={y(tv)} r={5} fill={c.color} stroke="#0c0e11" />;
            })}
          </g>
        )}
        <text x={W / 2} y={H - 2} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="11">
          {props.xLabel}
        </text>
        <text
          x={16}
          y={H / 2}
          fill="var(--color-muted-foreground)"
          fontSize="11"
          transform={`rotate(-90 16 ${H / 2})`}
          textAnchor="middle"
        >
          {props.yLabel}
        </text>
      </svg>
      <div className="mt-3 min-h-[4.5rem] rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm">
        {hover ? (
          <div className="grid gap-1 font-mono text-xs sm:grid-cols-2">
            <div>
              {t("thermal.speed")}: {fmtN(hover.n)} min⁻¹
            </div>
            {props.curves.map((c) => {
              const tv = interpT(c.pts, hover.n);
              if (tv == null) return null;
              return (
                <div key={c.label} style={{ color: c.color }}>
                  {c.label}: {fmtT(tv)} N·m
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("thermal.open")}</p>
        )}
      </div>
    </>
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
  const invLim = inverterLimitCurves(match.motor, match.inverter);
  const gRated = gearboxRatedLine(match.gearbox);
  const gTh = gearboxThermalCurve(match.gearbox);
  const ops = operatingPoints(result, match, cycle);
  const motorNMax = match.motor.ratedSpeedRpm * 1.2;
  const invPeakT = Math.max(0, ...invLim.peak.map((p) => p.t), ...invLim.cont.map((p) => p.t));
  const opT = Math.max(0, ...ops.motor.map((p) => p.t));
  const motorTMax = Math.max(match.motor.peakTorqueNm, invPeakT, opT) * 1.15;
  const gbNMax = match.gearbox.maxInputRpm;
  const gbTMax = Math.max(match.gearbox.ratedOutputNm, result.peakTorqueNm) * 1.1;
  const t = useT();

  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t("thermal.intro")}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[#7ec8c3]" />
          {t("thermal.burst")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[#e07a5f]" />
          {t("thermal.allday")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#e8a35a]" />
          {t("thermal.avg")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#7ec8c3]" />
          {t("thermal.hard")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#b6a4de]" />
          {t("thermal.still")}
        </li>
      </ul>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChartFrame
          title={`${t("thermal.motor")}  ·  ${match.motor.name}`}
          xLabel={t("thermal.nMot")}
          yLabel={t("thermal.tMot")}
          nMax={motorNMax}
          tMax={motorTMax}
          curves={[
            { pts: mPeak, color: "#7ec8c3", width: 1.8, label: t("thermal.burstLbl") },
            { pts: mS1, color: "#e07a5f", width: 1.6, label: t("thermal.alldayLbl") },
            { pts: invLim.peak, color: "#8aa4c8", width: 1.2, label: t("thermal.invPeak") },
            { pts: invLim.cont, color: "#c9a86c", width: 1.2, label: t("thermal.invCont") },
          ]}
          points={ops.motor}
        />
        {match.gearbox.kind !== "direct" && (
          <ChartFrame
            title={`${t("thermal.gear")}  ·  ${match.gearbox.name}`}
            xLabel={t("thermal.nIn")}
            yLabel={t("thermal.tOut")}
            nMax={gbNMax}
            tMax={gbTMax}
            curves={[
              { pts: gRated, color: "#7ec8c3", width: 1.6, label: t("thermal.rated") },
              { pts: gTh, color: "#e07a5f", width: 1.6, label: t("thermal.atSpeed") },
            ]}
            points={ops.gearbox}
          />
        )}
      </div>
    </div>
  );
}
