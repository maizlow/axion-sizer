import { useId, type ReactNode } from "react";
import type { InertiaField, InertiaKind } from "@/lib/units/inertia";

const ink = "var(--color-foreground)";
const mute = "var(--color-muted-foreground)";
const accent = "var(--color-accent)";
const face = "color-mix(in oklab, var(--color-foreground) 6%, transparent)";
const paper = "var(--color-background)";
const math = "var(--font-math)";

function n(v: number): string {
  return v.toFixed(2);
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

function Dim({
  x1,
  y1,
  x2,
  y2,
  label,
  lx,
  ly,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  lx: number;
  ly: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const tx = -(dy / len) * 5;
  const ty = (dx / len) * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mute} />
      <line x1={x1 - tx} y1={y1 - ty} x2={x1 + tx} y2={y1 + ty} stroke={mute} />
      <line x1={x2 - tx} y1={y2 - ty} x2={x2 + tx} y2={y2 + ty} stroke={mute} />
      <text x={lx} y={ly} fill={mute} fontSize="11" fontFamily={math} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Cm({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5.5" fill={paper} stroke={accent} />
      <line x1={x - 5.5} y1={y} x2={x + 5.5} y2={y} stroke={accent} />
      <line x1={x} y1={y - 5.5} x2={x} y2={y + 5.5} stroke={accent} />
    </g>
  );
}

function SpinAxis({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  markerId?: string;
}) {
  const top = y1 <= y2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeDasharray="9 3 2 3" />
      <text
        x={top ? x1 + 10 : x2 + 8}
        y={top ? y1 + 4 : y2 + 4}
        fill={accent}
        fontSize="12"
        fontFamily={math}
      >
        ω
      </text>
    </g>
  );
}

/** Axis out of the page. */
function AxisOut({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" stroke={accent} fill={paper} />
      <circle cx={x} cy={y} r="2.2" fill={accent} stroke="none" />
    </g>
  );
}

function ArcArrow({
  cx,
  cy,
  r,
  start,
  sweep = 1.4,
  markerId,
}: {
  cx: number;
  cy: number;
  r: number;
  start: number;
  sweep?: number;
  markerId: string;
}) {
  const a0 = start;
  const a1 = start + sweep;
  const x0 = cx + Math.cos(a0) * r;
  const y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy + Math.sin(a1) * r;
  return (
    <path
      d={`M${n(x0)} ${n(y0)} A${n(r)} ${n(r)} 0 0 1 ${n(x1)} ${n(y1)}`}
      stroke={accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      markerEnd={`url(#${markerId})`}
    />
  );
}

export interface SketchVals {
  kind: InertiaKind;
  compact?: boolean;
  vals?: Partial<Record<InertiaField, number>>;
  offsetMm?: number;
}

function DiskPlan({
  cx,
  cy,
  r,
  innerR,
  show,
  outerLabel,
  innerLabel,
  markerId,
}: {
  cx: number;
  cy: number;
  r: number;
  innerR: number;
  show: boolean;
  outerLabel: string;
  innerLabel?: string;
  markerId: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={face} stroke={ink} strokeWidth="1.6" />
      {innerR > 3 ? <circle cx={cx} cy={cy} r={innerR} fill={paper} stroke={mute} /> : null}
      <AxisOut x={cx} y={cy} />
      <ArcArrow cx={cx} cy={cy} r={r * 0.62} start={-0.55} sweep={1.55} markerId={markerId} />
      <text x={cx + 14} y={cy - 12} fill={accent} fontSize="12" fontFamily={math}>
        ω
      </text>
      {show ? (
        <>
          <path d={`M${cx - r} ${cy} V${cy + r + 16} M${cx + r} ${cy} V${cy + r + 16}`} stroke={mute} />
          <Dim
            x1={cx - r}
            y1={cy + r + 16}
            x2={cx + r}
            y2={cy + r + 16}
            label={outerLabel}
            lx={cx}
            ly={cy + r + 32}
          />
          {innerR > 3 && innerLabel ? (
            <Dim
              x1={cx - innerR}
              y1={cy + 18}
              x2={cx + innerR}
              y2={cy + 18}
              label={innerLabel}
              lx={cx}
              ly={cy + 14}
            />
          ) : null}
        </>
      ) : null}
    </g>
  );
}

function Body({
  kind,
  compact,
  vals,
  offsetMm,
  markerId,
}: SketchVals & { markerId: string }) {
  const show = !compact;

  if (kind === "point") {
    return (
      <g>
        <SpinAxis x1={70} y1={28} x2={70} y2={180} markerId={markerId} />
        <ArcArrow cx={70} cy={104} r={34} start={-1.05} sweep={1.3} markerId={markerId} />
        <rect x="196" y="84" width="52" height="40" rx="3" fill={face} stroke={ink} strokeWidth="1.5" />
        <text x="222" y="108" textAnchor="middle" fill={ink} fontSize="13" fontFamily={math}>
          m
        </text>
        {show ? <Cm x={222} y={104} /> : <circle cx="222" cy="104" r="2.5" fill={accent} stroke="none" />}
        {show ? (
          <>
            <path d="M222 124 V150" stroke={mute} />
            <Dim x1={70} y1={150} x2={222} y2={150} label="r" lx={146} ly={166} />
          </>
        ) : null}
        {show && (offsetMm ?? 0) > 0 ? (
          <Dim x1={70} y1={40} x2={102} y2={40} label="d" lx={86} ly={34} />
        ) : null}
      </g>
    );
  }

  if (kind === "cylAxis" || kind === "cylHollow" || kind === "ring") {
    const Do = Math.max(vals?.Do ?? 180, 1);
    const Di = clamp(vals?.Di ?? (kind === "cylHollow" ? 80 : 0), 0, Do * 0.92);
    const r = clamp(36 + (Do / 180) * 32, 36, 78);
    const innerFrac =
      kind === "ring" ? 0.72 : kind === "cylHollow" ? clamp(Di / Do, 0.12, 0.86) : 0;
    return (
      <DiskPlan
        cx={180}
        cy={100}
        r={r}
        innerR={r * innerFrac}
        show={show}
        outerLabel={kind === "cylHollow" ? "Dₒ" : "D"}
        innerLabel={kind === "cylHollow" ? "Dᵢ" : undefined}
        markerId={markerId}
      />
    );
  }

  if (kind === "sphere") {
    return (
      <g>
        <circle cx="180" cy="104" r="56" fill={face} stroke={ink} strokeWidth="1.5" />
        <ellipse cx="180" cy="104" rx="56" ry="16" stroke={mute} />
        <SpinAxis x1={180} y1={28} x2={180} y2={186} markerId={markerId} />
        {show ? <Cm x={180} y={104} /> : null}
        {show ? <Dim x1={180} y1={104} x2={236} y2={104} label="D/2" lx={208} ly={96} /> : null}
        <ArcArrow cx={180} cy={104} r={70} start={-0.45} sweep={1.15} markerId={markerId} />
      </g>
    );
  }

  if (kind === "plate") {
    const a = Math.max(vals?.a ?? 600, 1);
    const b = Math.max(vals?.b ?? 400, 1);
    const aspect = a / b;
    const maxW = 200;
    const maxH = 110;
    let w = maxW;
    let h = maxW / aspect;
    if (h > maxH) {
      h = maxH;
      w = maxH * aspect;
    }
    const x = 180 - w / 2;
    const y = 100 - h / 2;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        <AxisOut x={180} y={100} />
        <text x={194} y={88} fill={accent} fontSize="12" fontFamily={math}>
          ω
        </text>
        <ArcArrow cx={180} cy={100} r={Math.min(w, h) * 0.28 + 20} start={-0.5} sweep={1.45} markerId={markerId} />
        {show ? (
          <>
            <Dim x1={x} y1={y + h + 16} x2={x + w} y2={y + h + 16} label="a" lx={180} ly={y + h + 32} />
            <Dim x1={x - 16} y1={y} x2={x - 16} y2={y + h} label="b" lx={x - 28} ly={104} />
          </>
        ) : null}
      </g>
    );
  }

  if (kind === "rod" || kind === "rodEnd") {
    const end = kind === "rodEnd";
    const x = 68;
    const w = 224;
    const ax = end ? x : x + w / 2;
    return (
      <g>
        <rect x={x} y="96" width={w} height="16" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        {end ? <circle cx={x} cy={104} r="7" fill={paper} stroke={accent} strokeWidth="1.5" /> : null}
        <SpinAxis x1={ax} y1={28} x2={ax} y2={186} markerId={markerId} />
        <ArcArrow cx={ax} cy={104} r={28} start={-1.15} sweep={1.2} markerId={markerId} />
        {show ? <Cm x={end ? x + w / 2 : ax} y={104} /> : null}
        {show ? <Dim x1={x} y1={144} x2={x + w} y2={144} label="L" lx={x + w / 2} ly={160} /> : null}
      </g>
    );
  }

  if (kind === "linPulley") {
    return (
      <g>
        <circle cx="100" cy="104" r="44" fill={face} stroke={ink} strokeWidth="1.5" />
        <circle cx="100" cy="104" r="8" fill={paper} stroke={accent} strokeWidth="1.4" />
        <SpinAxis x1={100} y1={28} x2={100} y2={186} markerId={markerId} />
        <ArcArrow cx={100} cy={104} r={56} start={-0.2} sweep={1.15} markerId={markerId} />
        <line x1={100} y1={60} x2={220} y2={60} stroke={ink} strokeWidth="1.5" markerEnd={`url(#${markerId}-ink)`} />
        <rect x="228" y="44" width="48" height="32" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        <text x="252" y="64" textAnchor="middle" fill={ink} fontSize="12" fontFamily={math}>
          m
        </text>
        {show ? (
          <>
            <Cm x={100} y={104} />
            <Dim x1={100} y1={104} x2={144} y2={104} label="D/2" lx={122} ly={96} />
          </>
        ) : null}
      </g>
    );
  }

  return (
    <g>
      <rect x="48" y="88" width="168" height="32" rx="4" fill={face} stroke={ink} strokeWidth="1.5" />
      <path
        d="M62 92 L78 116 M86 92 L102 116 M110 92 L126 116 M134 92 L150 116 M158 92 L174 116 M182 92 L198 116"
        stroke={mute}
      />
      <rect
        x="118"
        y="76"
        width="36"
        height="56"
        rx="2"
        fill="color-mix(in oklab, var(--color-accent) 18%, transparent)"
        stroke={accent}
        strokeWidth="1.4"
      />
      <line x1={154} y1={104} x2={220} y2={104} stroke={ink} strokeWidth="1.5" markerEnd={`url(#${markerId}-ink)`} />
      <rect x="228" y="86" width="48" height="36" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
      <text x="252" y="108" textAnchor="middle" fill={ink} fontSize="12" fontFamily={math}>
        m
      </text>
      <SpinAxis x1={36} y1={104} x2={210} y2={104} markerId={markerId} />
      {show ? (
        <>
          <path d="M86 124 V142 M110 124 V142" stroke={mute} />
          <Dim x1={86} y1={142} x2={110} y2={142} label="P" lx={98} ly={158} />
        </>
      ) : null}
    </g>
  );
}

function Frame({
  compact,
  children,
  uid,
}: {
  compact?: boolean;
  children: ReactNode;
  uid: string;
}) {
  return (
    <svg
      viewBox={compact ? "40 28 280 152" : "0 0 360 210"}
      className={compact ? "h-14 w-full" : "h-48 w-full"}
      fill="none"
      aria-hidden
    >
      <defs>
        <marker
          id={uid}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 1.2 L10 5 L0 8.8 Z" fill={accent} />
        </marker>
        <marker
          id={`${uid}-ink`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 1.2 L10 5 L0 8.8 Z" fill={ink} />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

export function InertiaGlyph({ kind }: { kind: InertiaKind }) {
  const uid = `arr-${useId().replace(/:/g, "")}`;
  return (
    <Frame compact uid={uid}>
      <Body kind={kind} compact markerId={uid} />
    </Frame>
  );
}

export function InertiaSketch({
  kind,
  vals,
  offsetMm,
}: {
  kind: InertiaKind;
  vals?: Partial<Record<InertiaField, number>>;
  offsetMm?: number;
}) {
  const uid = `arr-${useId().replace(/:/g, "")}`;
  return (
    <Frame uid={uid}>
      <Body kind={kind} vals={vals} offsetMm={offsetMm} markerId={uid} />
    </Frame>
  );
}
