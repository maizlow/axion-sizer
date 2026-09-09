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
  roomy,
}: {
  title: string;
  xLabel: string;
  yLabel: string;
  nMax: number;
  tMax: number;
  curves: { pts: CurvePt[]; color: string; width: number; label: string; dash?: string }[];
  points: OpPt[];
  tall?: boolean;
  roomy?: boolean;
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
      className={
        roomy
          ? "h-64 w-full min-w-[18rem] cursor-zoom-in min-[1600px]:h-[28rem] min-[1921px]:h-[34rem]"
          : "h-48 w-full min-w-[18rem] cursor-zoom-in"
      }
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
        <path
          key={c.label}
          d={polyline(c.pts, x, y)}
          fill="none"
          stroke={c.color}
          strokeWidth={c.width}
          strokeDasharray={c.dash}
        />
      ))}
      {curves.map((c) => {
        if (roomy) return null;
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
            fill={p.color ?? (p.kind === "s1" ? "#e8a35a" : p.kind === "peak" ? "#7ec8c3" : "#b6a4de")}
            stroke="var(--color-background)"
            strokeWidth="1.4"
          />
          <text x={x(Math.min(p.n, xn)) + 8} y={y(Math.max(p.t, 0)) - 6} fill={p.color ?? "var(--color-foreground)"} fontSize="10">
            {p.tag ?? p.label}
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
              fill={p.color ?? (p.kind === "s1" ? "#e8a35a" : p.kind === "peak" ? "#7ec8c3" : "#b6a4de")}
              stroke="var(--color-background)"
              strokeWidth="1.5"
            />
            <text x={x(Math.min(p.n, xn)) + 8} y={y(Math.max(p.t, 0)) - 6} fill={p.color ?? "var(--color-foreground)"} fontSize="11">
              {p.tag ?? p.label}
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

const FAMILIES = [
  {
    motorPeak: "#7ee8df",
    motorS1: "#2a9a8e",
    invPeak: "#9ec4ff",
    invCont: "#3d6fb8",
    gbRated: "#5fd0c6",
    gbTh: "#1d7a70",
  },
  {
    motorPeak: "#ffb08a",
    motorS1: "#d4542a",
    invPeak: "#ffd27a",
    invCont: "#c48420",
    gbRated: "#f09a68",
    gbTh: "#b03d1c",
  },
  {
    motorPeak: "#d2b4ff",
    motorS1: "#6d48b8",
    invPeak: "#f3b4dc",
    invCont: "#a24e8c",
    gbRated: "#b898e8",
    gbTh: "#53388f",
  },
  {
    motorPeak: "#e8d56a",
    motorS1: "#8a9a32",
    invPeak: "#b6e08a",
    invCont: "#3f7a38",
    gbRated: "#c9c056",
    gbTh: "#5f6e20",
  },
] as const;

export function CompareThermalCharts({
  result,
  matches,
  cycle,
}: {
  result: SizingResult;
  matches: MatchScore[];
  cycle?: MotionCycle;
}) {
  const t = useT();
  const [customOn, setCustomOn] = useState(false);
  const [customName, setCustomName] = useState("Reference");
  const [customN, setCustomN] = useState(3000);
  const [customTc, setCustomTc] = useState(2);
  const [customTp, setCustomTp] = useState(6);
  if (matches.length < 2) return null;

  const packs = matches.map((match, i) => {
    const family = FAMILIES[i % FAMILIES.length];
    const letter = String.fromCharCode(65 + i);
    const ops = operatingPoints(result, match, cycle);
    const inv = inverterLimitCurves(match.motor, match.inverter);
    const tagPt = (o: OpPt, color: string): OpPt => ({
      ...o,
      id: `${match.motor.id}-${match.gearbox.id}-${o.id}`,
      color,
      tag: `${letter} · ${o.kind === "s1" ? "avg" : o.kind === "peak" ? "peak" : "hold"}`,
      label: `${letter} · ${match.motor.name} ${o.label}`,
    });
    return {
      match,
      family,
      letter,
      color: family.motorS1,
      mPeak: motorPeakCurve(match.motor),
      mS1: motorS1Curve(match.motor),
      invPeak: inv.peak,
      invCont: inv.cont,
      gTh: gearboxThermalCurve(match.gearbox),
      gRated: gearboxRatedLine(match.gearbox),
      ops: {
        motor: ops.motor.map((o) =>
          tagPt(o, o.kind === "peak" ? family.motorPeak : o.kind === "s1" ? family.motorS1 : family.gbTh),
        ),
        gearbox: ops.gearbox.map((o) =>
          tagPt(o, o.kind === "peak" ? family.gbRated : o.kind === "s1" ? family.gbTh : family.invCont),
        ),
      },
    };
  });

  const customPeak = customOn
    ? motorPeakCurve({
        ratedSpeedRpm: Math.max(customN, 1),
        peakTorqueNm: Math.max(customTp, 0),
        contTorqueNm: Math.max(customTc, customTp / 3),
      })
    : [];
  const customS1 = customOn
    ? motorS1Curve({ ratedSpeedRpm: Math.max(customN, 1), contTorqueNm: Math.max(customTc, 0) })
    : [];

  const motorNMax = Math.max(
    ...packs.map((p) => p.match.motor.ratedSpeedRpm * 1.2),
    customOn ? customN * 1.2 : 0,
    1,
  );
  const motorTMax =
    Math.max(
      ...packs.map((p) => p.match.motor.peakTorqueNm),
      ...packs.flatMap((p) => p.invPeak.map((pt) => pt.t)),
      ...packs.flatMap((p) => p.invCont.map((pt) => pt.t)),
      ...packs.flatMap((p) => p.ops.motor.map((o) => o.t)),
      customOn ? customTp : 0,
      1,
    ) * 1.15;
  const gbPacks = packs.filter((p) => p.match.gearbox.kind !== "direct");
  const gbNMax = Math.max(...gbPacks.map((p) => p.match.gearbox.maxInputRpm), 1);
  const gbTMax =
    Math.max(...gbPacks.map((p) => p.match.gearbox.ratedOutputNm), result.peakTorqueNm, 1) * 1.1;

  return (
    <div className="border-t border-border px-3 py-3">
      <p className="mb-2 text-xs text-muted-foreground">{t("compare.charts")}</p>
      <ul className="mb-3 grid gap-2 sm:grid-cols-2">
        {packs.map((p) => (
          <li
            key={`${p.match.motor.id}-${p.match.gearbox.id}`}
            className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-2"
            style={{ borderColor: p.family.motorS1 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <span
                className="grid size-6 place-items-center rounded-[4px] text-xs font-medium"
                style={{ background: p.family.motorS1, color: "#0c0e11" }}
              >
                {p.letter}
              </span>
              <span className="min-w-0 leading-snug">
                {p.match.motor.name}
                <span className="text-muted-foreground"> + </span>
                {p.match.gearbox.name}
                <span className="text-muted-foreground"> + </span>
                {p.match.inverter.name}
              </span>
            </div>
            <ul className="mt-2 space-y-1 font-mono text-[11px] tabular-nums text-muted-foreground">
              {p.ops.motor.map((o) => (
                <li key={o.id} className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />
                  <span className="w-10 text-foreground">{o.kind === "s1" ? "avg" : o.kind}</span>
                  <span>
                    {fmtN(o.n)} 1/min · {fmtT(o.t)} N·m
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={customOn} onChange={(e) => setCustomOn(e.target.checked)} />
        {t("compare.custom")}
      </label>
      {customOn && (
        <div className="mb-3 grid gap-2 rounded-[var(--radius-md)] border border-dashed border-border px-3 py-2 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {t("compare.customName")}
            <input
              className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 text-sm text-foreground"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {t("compare.customN")} [1/min]
            <input
              type="number"
              className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
              value={customN}
              onChange={(e) => setCustomN(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {t("compare.customTc")} [N·m]
            <input
              type="number"
              className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
              value={customTc}
              onChange={(e) => setCustomTc(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {t("compare.customTp")} [N·m]
            <input
              type="number"
              className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
              value={customTp}
              onChange={(e) => setCustomTp(Number(e.target.value))}
            />
          </label>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 min-[1921px]:gap-5">
        <ChartFrame
          title={t("thermal.motor")}
          xLabel={t("thermal.nMot")}
          yLabel={t("thermal.tMot")}
          nMax={motorNMax}
          tMax={motorTMax}
          roomy
          curves={[
            ...packs.flatMap((p) => [
            { pts: p.mPeak, color: p.family.motorPeak, width: 1.5, label: `${p.letter} ${t("thermal.burstLbl")}` },
            { pts: p.mS1, color: p.family.motorS1, width: 2, label: `${p.letter} ${t("thermal.alldayLbl")}` },
            {
              pts: p.invPeak,
              color: p.family.invPeak,
              width: 1.3,
              dash: "5 3",
              label: `${p.letter} ${t("thermal.invPeak")}`,
            },
            {
              pts: p.invCont,
              color: p.family.invCont,
              width: 1.5,
              dash: "2 3",
              label: `${p.letter} ${t("thermal.invCont")}`,
            },
          ]),
            ...(customOn
              ? [
                  { pts: customPeak, color: "#e6e8eb", width: 1.6, dash: "6 3", label: `${customName} peak` },
                  { pts: customS1, color: "#9aa3ad", width: 2, dash: "2 2", label: `${customName} S1` },
                ]
              : []),
          ]}
          points={packs.flatMap((p) => p.ops.motor)}
        />
        {gbPacks.length > 0 && (
          <ChartFrame
            title={t("thermal.gear")}
            xLabel={t("thermal.nIn")}
            yLabel={t("thermal.tOut")}
            nMax={gbNMax}
            tMax={gbTMax}
            roomy
            curves={gbPacks.flatMap((p) => [
              { pts: p.gRated, color: p.family.gbRated, width: 1.4, label: `${p.match.gearbox.name} ${t("thermal.rated")}` },
              { pts: p.gTh, color: p.family.gbTh, width: 1.8, label: `${p.match.gearbox.name} ${t("thermal.atSpeed")}` },
            ])}
            points={gbPacks.flatMap((p) => p.ops.gearbox)}
          />
        )}
      </div>
    </div>
  );
}
