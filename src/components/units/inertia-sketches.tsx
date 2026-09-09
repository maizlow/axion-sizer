import { useId, type ReactNode } from "react";
import type { InertiaField, InertiaKind } from "@/lib/units/inertia";

const ink = "var(--color-foreground)";
const mute = "var(--color-muted-foreground)";
const accent = "var(--color-accent)";
const face = "color-mix(in oklab, var(--color-foreground) 6%, transparent)";
const math = "var(--font-math)";

function px(n: number): string {
  return n.toFixed(2);
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
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
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy * 4;
  const py = ux * 4;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mute} />
      <line x1={x1 - px} y1={y1 - py} x2={x1 + px} y2={y1 + py} stroke={mute} />
      <line x1={x2 - px} y1={y2 - py} x2={x2 + px} y2={y2 + py} stroke={mute} />
      <text x={lx} y={ly} fill={mute} fontSize="11" fontFamily={math} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Cm({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5.5" fill="var(--color-background)" stroke={accent} />
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
  end = "ω",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  end?: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeDasharray="9 3 2 3" />
      <text x={x2 + 6} y={y2 + 4} fill={accent} fontSize="12" fontFamily={math}>
        {end}
      </text>
    </g>
  );
}

/** Axis out of the page (rotary table / plate). */
function AxisOut({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" stroke={accent} />
      <circle cx={x} cy={y} r="2.2" fill={accent} />
      <text x={x + 12} y={y - 8} fill={accent} fontSize="12" fontFamily={math}>
        ω
      </text>
    </g>
  );
}

function ArcArrow({
  cx,
  cy,
  r,
  start,
  sweep = 1.1,
}: {
  cx: number;
  cy: number;
  r: number;
  start: number;
  sweep?: number;
}) {
  const a0 = start;
  const a1 = start + sweep;
  const x0 = px(cx + Math.cos(a0) * r);
  const y0 = px(cy + Math.sin(a0) * r);
  const x1 = px(cx + Math.cos(a1) * r);
  const y1 = px(cy + Math.sin(a1) * r);
  const hx = cx + Math.cos(a1) * r;
  const hy = cy + Math.sin(a1) * r;
  const ang = a1 + Math.PI / 2;
  const p1x = px(hx + Math.cos(ang - 2.6) * 7);
  const p1y = px(hy + Math.sin(ang - 2.6) * 7);
  const p2x = px(hx + Math.cos(ang - 0.5) * 7);
  const p2y = px(hy + Math.sin(ang - 0.5) * 7);
  return (
    <g>
      <path d={`M${x0} ${y0} A${px(r)} ${px(r)} 0 0 1 ${x1} ${y1}`} stroke={accent} strokeWidth="1.2" />
      <path d={`M${x1} ${y1} L${p1x} ${p1y} M${x1} ${y1} L${p2x} ${p2y}`} stroke={accent} strokeWidth="1.2" />
    </g>
  );
}

function CylinderIso({
  x0,
  x1,
  cy,
  rx,
  ry,
  innerRy,
  hatchId,
}: {
  x0: number;
  x1: number;
  cy: number;
  rx: number;
  ry: number;
  innerRy?: number;
  hatchId?: string;
}) {
  const innerRx = innerRy != null ? Number(((rx * innerRy) / ry).toFixed(2)) : 0;
  return (
    <g>
      <path
        d={`M${x0} ${cy - ry} H${x1} A${rx} ${ry} 0 0 1 ${x1} ${cy + ry} H${x0} A${rx} ${ry} 0 0 1 ${x0} ${cy - ry} Z`}
        fill={face}
        stroke="none"
      />
      {hatchId ? <ellipse cx={x0} cy={cy} rx={rx} ry={ry} fill={`url(#${hatchId})`} stroke="none" /> : null}
      <ellipse cx={x0} cy={cy} rx={rx} ry={ry} stroke={ink} strokeWidth="1.5" />
      <ellipse cx={x1} cy={cy} rx={rx} ry={ry} stroke={ink} strokeWidth="1.5" />
      <path d={`M${x0} ${cy - ry} H${x1} M${x0} ${cy + ry} H${x1}`} stroke={ink} strokeWidth="1.5" />
      {innerRy != null && innerRy > 2 ? (
        <>
          <ellipse cx={x0} cy={cy} rx={innerRx} ry={innerRy} stroke={mute} />
          <ellipse cx={x1} cy={cy} rx={innerRx} ry={innerRy} stroke={mute} strokeDasharray="3 3" />
        </>
      ) : null}
    </g>
  );
}

export interface SketchVals {
  kind: InertiaKind;
  compact?: boolean;
  vals?: Partial<Record<InertiaField, number>>;
  offsetMm?: number;
}

function Body({ kind, compact, vals, offsetMm, hatchId }: SketchVals & { hatchId: string }) {
  const show = !compact;

  if (kind === "point") {
    return (
      <g>
        <SpinAxis x1={64} y1={22} x2={64} y2={188} />
        <ArcArrow cx={64} cy={108} r={36} start={-0.9} />
        <rect x="196" y="88" width="52" height="40" rx="3" fill={face} stroke={ink} strokeWidth="1.5" />
        <text x="222" y="112" textAnchor="middle" fill={ink} fontSize="13" fontFamily={math}>
          m
        </text>
        {show ? <Cm x={222} y={108} /> : <circle cx="222" cy="108" r="2.5" fill={accent} />}
        {show ? (
          <>
            <path d="M222 128 V156" stroke={mute} />
            <Dim x1={64} y1={156} x2={222} y2={156} label="r" lx={143} ly={172} />
          </>
        ) : null}
        {show && (offsetMm ?? 0) > 0 ? (
          <Dim x1={64} y1={40} x2={96} y2={40} label="d" lx={80} ly={34} />
        ) : null}
      </g>
    );
  }

  if (kind === "cylAxis" || kind === "cylHollow") {
    const Do = Math.max(vals?.Do ?? 180, 1);
    const Di = clamp(vals?.Di ?? (kind === "cylHollow" ? 80 : 0), 0, Do * 0.92);
    const innerRy = kind === "cylHollow" ? Number((12 + (Di / Do) * 40).toFixed(2)) : undefined;
    return (
      <g>
        <CylinderIso x0={108} x1={248} cy={108} rx={20} ry={54} innerRy={innerRy} hatchId={hatchId} />
        <SpinAxis x1={48} y1={108} x2={318} y2={108} />
        {show ? <Cm x={178} y={108} /> : null}
        {show ? (
          kind === "cylHollow" ? (
            <>
              <Dim x1={78} y1={108} x2={78} y2={54} label="Dₒ" lx={62} ly={84} />
              <path d="M108 54 H78" stroke={mute} />
              <Dim x1={138} y1={108} x2={138} y2={108 - (innerRy ?? 26)} label="Dᵢ" lx={154} ly={96} />
            </>
          ) : (
            <>
              <path d="M108 54 H86" stroke={mute} />
              <Dim x1={86} y1={108} x2={86} y2={54} label="D" lx={70} ly={84} />
            </>
          )
        ) : null}
      </g>
    );
  }

  if (kind === "ring") {
    return (
      <g>
        <CylinderIso x0={150} x1={196} cy={108} rx={22} ry={62} innerRy={40} hatchId={hatchId} />
        <SpinAxis x1={48} y1={108} x2={318} y2={108} />
        {show ? <Cm x={173} y={108} /> : null}
        {show ? (
          <>
            <path d="M150 46 H128" stroke={mute} />
            <Dim x1={128} y1={108} x2={128} y2={46} label="D" lx={112} ly={80} />
          </>
        ) : null}
      </g>
    );
  }

  if (kind === "sphere") {
    return (
      <g>
        <circle cx="180" cy="108" r="58" fill={face} stroke={ink} strokeWidth="1.5" />
        <ellipse cx="180" cy="108" rx="58" ry="18" stroke={mute} />
        <SpinAxis x1={180} y1={28} x2={180} y2={188} />
        {show ? <Cm x={180} y={108} /> : null}
        {show ? <Dim x1={180} y1={108} x2={238} y2={108} label="D/2" lx={209} ly={100} /> : null}
        <ArcArrow cx={180} cy={108} r={72} start={-0.35} sweep={0.7} />
      </g>
    );
  }

  if (kind === "plate") {
    const a = Math.max(vals?.a ?? 600, 1);
    const b = Math.max(vals?.b ?? 400, 1);
    const aspect = a / b;
    const maxW = 210;
    const maxH = 118;
    let w = maxW;
    let h = maxW / aspect;
    if (h > maxH) {
      h = maxH;
      w = maxH * aspect;
    }
    w = Number(w.toFixed(2));
    h = Number(h.toFixed(2));
    const x = Number((180 - w / 2).toFixed(2));
    const y = Number((108 - h / 2).toFixed(2));
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        <AxisOut x={180} y={108} />
        <ArcArrow cx={180} cy={108} r={Math.min(w, h) * 0.28 + 18} start={-0.2} />
        {show ? (
          <>
            <Dim x1={x} y1={y + h + 18} x2={x + w} y2={y + h + 18} label="a" lx={180} ly={y + h + 34} />
            <Dim x1={x - 18} y1={y} x2={x - 18} y2={y + h} label="b" lx={x - 32} ly={108 + 4} />
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
        <rect x={x} y="100" width={w} height="16" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        {end ? <circle cx={x} cy={108} r="7" fill="var(--color-background)" stroke={accent} strokeWidth="1.5" /> : null}
        <SpinAxis x1={ax} y1={28} x2={ax} y2={188} />
        <ArcArrow cx={ax} cy={108} r={28} start={-1.15} sweep={0.9} />
        {show ? <Cm x={end ? x + w / 2 : ax} y={108} /> : null}
        {show ? <Dim x1={x} y1={148} x2={x + w} y2={148} label="L" lx={x + w / 2} ly={164} /> : null}
        {show && end ? (
          <text x={ax + 10} y={44} fill={mute} fontSize="11" fontFamily={math}>
            end
          </text>
        ) : null}
      </g>
    );
  }

  if (kind === "linPulley") {
    return (
      <g>
        <circle cx="96" cy="108" r="46" fill={face} stroke={ink} strokeWidth="1.5" />
        <circle cx="96" cy="108" r="8" fill="var(--color-background)" stroke={accent} strokeWidth="1.4" />
        <SpinAxis x1={96} y1={28} x2={96} y2={188} />
        <path d="M96 62 H236" stroke={ink} strokeWidth="1.6" />
        <path d="M228 62 L236 62 L230 56 M236 62 L230 68" stroke={ink} strokeWidth="1.4" />
        <rect x="236" y="46" width="48" height="32" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
        <text x="260" y="66" textAnchor="middle" fill={ink} fontSize="12" fontFamily={math}>
          m
        </text>
        {show ? (
          <>
            <Cm x={96} y={108} />
            <Dim x1={96} y1={108} x2={142} y2={108} label="D/2" lx={122} ly={100} />
          </>
        ) : null}
      </g>
    );
  }

  // linScrew
  return (
    <g>
      <rect x="48" y="92" width="168" height="32" rx="4" fill={face} stroke={ink} strokeWidth="1.5" />
      <path
        d="M62 96 L78 120 M86 96 L102 120 M110 96 L126 120 M134 96 L150 120 M158 96 L174 120 M182 96 L198 120"
        stroke={mute}
      />
      <rect x="118" y="80" width="36" height="56" rx="2" fill="color-mix(in oklab, var(--color-accent) 18%, transparent)" stroke={accent} strokeWidth="1.4" />
      <path d="M154 108 H236" stroke={ink} strokeWidth="1.5" />
      <rect x="236" y="90" width="48" height="36" rx="2" fill={face} stroke={ink} strokeWidth="1.5" />
      <text x="260" y="112" textAnchor="middle" fill={ink} fontSize="12" fontFamily={math}>
        m
      </text>
      <SpinAxis x1={32} y1={108} x2={230} y2={108} />
      {show ? (
        <>
          <path d="M86 128 V146 M110 128 V146" stroke={mute} />
          <Dim x1={86} y1={146} x2={110} y2={146} label="P" lx={98} ly={162} />
        </>
      ) : null}
    </g>
  );
}

function Frame({
  compact,
  children,
  hatchId,
}: {
  compact?: boolean;
  children: ReactNode;
  hatchId: string;
}) {
  return (
    <svg
      viewBox={compact ? "36 24 288 168" : "0 0 360 220"}
      className={compact ? "h-20 w-full" : "h-52 w-full sm:h-56"}
      fill="none"
      aria-hidden
    >
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={mute} strokeWidth="1" />
        </pattern>
      </defs>
      {children}
    </svg>
  );
}

export function InertiaGlyph({ kind }: { kind: InertiaKind }) {
  const hatchId = `hatch-${useId().replace(/:/g, "")}`;
  return (
    <Frame compact hatchId={hatchId}>
      <Body kind={kind} compact hatchId={hatchId} />
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
  const hatchId = `hatch-${useId().replace(/:/g, "")}`;
  return (
    <Frame hatchId={hatchId}>
      <Body kind={kind} vals={vals} offsetMm={offsetMm} hatchId={hatchId} />
    </Frame>
  );
}
