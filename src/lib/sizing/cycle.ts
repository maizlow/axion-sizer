import type { AccelLaw, ApplicationId, CycleSegment, InclineDir, Inputs, MotionCycle, TravelUnit } from "./types.ts";
import { getApplication } from "./applications.ts";

export const INCLINE_OPTS: { value: InclineDir; label: string }[] = [
  { value: "accel", label: "Acceleration phase" },
  { value: "decel", label: "Deceleration phase" },
  { value: "hold", label: "Hold or cruise" },
];

export function normalizePhase(raw: string | undefined): InclineDir {
  if (raw === "decel" || raw === "downhill") return "decel";
  if (raw === "hold" || raw === "level") return "hold";
  return "accel";
}

export const ACCEL_LAW_OPTS: { value: AccelLaw; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "sin2", label: "sin²" },
  { value: "jerk", label: "Jerk-limited" },
];

export const TRAVEL_UNITS: TravelUnit[] = ["mm", "m", "deg"];

/** SI = display × k. Linear SI is m, m/s, m/s². Angular SI is rad, rad/s, rad/s². */
export function travelK(unit: TravelUnit): number {
  if (unit === "mm") return 0.001;
  if (unit === "deg") return Math.PI / 180;
  return 1;
}

export function velToDisp(si: number, unit: TravelUnit): number {
  return si / travelK(unit);
}

export function velFromDisp(disp: number, unit: TravelUnit): number {
  return disp * travelK(unit);
}

export function distToDisp(distanceMm: number, unit: TravelUnit): number {
  return distanceMm / 1000 / travelK(unit);
}

export function distFromDisp(disp: number, unit: TravelUnit): number {
  return disp * travelK(unit) * 1000;
}

export function travelLabels(unit: TravelUnit): { v: string; a: string; s: string } {
  if (unit === "mm") return { v: "mm/s", a: "mm/s²", s: "mm" };
  if (unit === "deg") return { v: "deg/s", a: "deg/s²", s: "deg" };
  return { v: "m/s", a: "m/s²", s: "m" };
}

export function defaultTravelUnit(id: ApplicationId): TravelUnit {
  return getApplication(id).group === "rotary" ? "deg" : "mm";
}

export function appsWithCycle(id: ApplicationId): boolean {
  return !["mixer", "fan", "pump"].includes(id);
}

/** Fields the travel table already defines when the cycle is on. */
export const CYCLE_COVERED_KEYS = [
  "speedMps",
  "hookSpeedMps",
  "lineSpeedMps",
  "speedRpm",
  "accelTimeS",
  "dutyCycle",
] as const;

export function fieldCoveredByCycle(appId: ApplicationId, fieldKey: string, cycleOn: boolean): boolean {
  if (!cycleOn || !appsWithCycle(appId)) return false;
  return (CYCLE_COVERED_KEYS as readonly string[]).includes(fieldKey);
}

export function cycleOverridesPayload(cycle: MotionCycle | undefined): boolean {
  if (!cycle?.enabled) return false;
  return cycle.segments.some((s) => (s.payloadKg ?? 0) > 0);
}


function sid(): string {
  return `seg-${Math.random().toString(36).slice(2, 8)}`;
}

function speedSi(appId: ApplicationId, inputs: Inputs): number {
  const app = getApplication(appId);
  const key = app.fields.find((f) => f.key === "speedMps" || f.key === "hookSpeedMps" || f.key === "lineSpeedMps")?.key;
  if (!key) {
    const rpm = Number(inputs.speedRpm ?? 0);
    return Number.isFinite(rpm) ? (rpm * 2 * Math.PI) / 60 : 0.5;
  }
  const field = app.fields.find((f) => f.key === key);
  const raw = Number(inputs[key] ?? field?.defaultValue ?? 0);
  return raw * (field?.metricToSi ?? 1);
}

function accelTimeSi(appId: ApplicationId, inputs: Inputs): number {
  const app = getApplication(appId);
  const field = app.fields.find((f) => f.key === "accelTimeS");
  const raw = Number(inputs.accelTimeS ?? field?.defaultValue ?? 0.6);
  return Math.max(0.05, raw);
}

export function emptySegment(prev?: CycleSegment): CycleSegment {
  const v0 = prev?.vEnd ?? 0;
  const pos = prev?.positionMm ?? 0;
  return {
    id: sid(),
    inclineDir: prev?.inclineDir ?? "accel",
    accelLaw: prev?.accelLaw ?? "linear",
    vStart: v0,
    vEnd: v0,
    accel: 0,
    time: 0.3,
    distanceMm: 0,
    positionMm: pos,
    payloadKg: 0,
  };
}

export function fillKinematics(seg: CycleSegment, edited: keyof CycleSegment | "all"): CycleSegment {
  const s = { ...seg };
  if (edited === "payloadKg" || edited === "inclineDir" || edited === "accelLaw" || edited === "id") return s;
  const dv = s.vEnd - s.vStart;
  if (edited === "accel" && Math.abs(s.accel) > 1e-9 && Math.abs(dv) > 1e-12) {
    const t = dv / s.accel;
    s.time = Math.abs(t);
    if (t < 0) s.accel = -s.accel;
  } else if (edited === "distanceMm") {
    const vAvg = (s.vStart + s.vEnd) / 2;
    if (Math.abs(vAvg) > 1e-9) {
      s.time = Math.abs(s.distanceMm / 1000 / vAvg);
      if (s.time > 1e-9) s.accel = dv / s.time;
    }
  } else if (s.time > 1e-9) {
    s.accel = dv / s.time;
    s.distanceMm = ((s.vStart + s.vEnd) / 2) * s.time * 1000;
  } else {
    s.accel = 0;
    s.distanceMm = 0;
  }
  if (!Number.isFinite(s.accel)) s.accel = 0;
  if (!Number.isFinite(s.time) || s.time < 0) s.time = 0;
  if (!Number.isFinite(s.distanceMm)) s.distanceMm = 0;
  return s;
}

export function relinkPositions(segments: CycleSegment[]): CycleSegment[] {
  let pos = 0;
  return segments.map((seg, i) => {
    const chained = { ...seg };
    if (i > 0) chained.vStart = segments[i - 1].vEnd;
    const filled = fillKinematics(chained, i > 0 && chained.vStart !== seg.vStart ? "vStart" : "all");
    pos += filled.distanceMm;
    filled.positionMm = pos;
    return filled;
  });
}

export function defaultCycle(appId: ApplicationId, inputs: Inputs): MotionCycle {
  if (!appsWithCycle(appId)) return { enabled: false, travelUnit: defaultTravelUnit(appId), segments: [] };
  const v = Math.max(0.01, speedSi(appId, inputs));
  const t = accelTimeSi(appId, inputs);
  const payloadKg = 0;
  const a = v / t;
  const s = 0.5 * v * t * 1000;
  const dir: InclineDir = "accel";
  const a1 = fillKinematics(
    {
      id: sid(),
      inclineDir: dir,
      accelLaw: "linear",
      vStart: 0,
      vEnd: v,
      accel: a,
      time: t,
      distanceMm: s,
      positionMm: s,
      payloadKg,
    },
    "all",
  );
  const a2 = fillKinematics(
    {
      id: sid(),
      inclineDir: "decel",
      accelLaw: "linear",
      vStart: v,
      vEnd: 0,
      accel: -a,
      time: t,
      distanceMm: s,
      positionMm: 2 * s,
      payloadKg,
    },
    "all",
  );
  const dwell = fillKinematics(
    {
      id: sid(),
      inclineDir: "hold",
      accelLaw: "linear",
      vStart: 0,
      vEnd: 0,
      accel: 0,
      time: 0.3,
      distanceMm: 0,
      positionMm: 2 * s,
      payloadKg,
    },
    "all",
  );
  return { enabled: true, travelUnit: defaultTravelUnit(appId), segments: relinkPositions([a1, a2, dwell]) };
}

export function peakAccel(seg: CycleSegment): number {
  const mean = seg.time > 1e-9 ? (seg.vEnd - seg.vStart) / seg.time : seg.accel;
  if (seg.accelLaw === "sin2") return mean * (Math.PI / 2);
  if (seg.accelLaw === "jerk") return mean * 2;
  return mean;
}

export function cycleSummary(cycle: MotionCycle) {
  const segs = cycle.segments;
  const period = segs.reduce((s, x) => s + Math.max(x.time, 0), 0);
  const move = segs.reduce((s, x) => s + (Math.abs(x.vStart) + Math.abs(x.vEnd) + Math.abs(x.accel) > 1e-6 ? x.time : 0), 0);
  const peakV = segs.reduce((m, x) => Math.max(m, Math.abs(x.vStart), Math.abs(x.vEnd)), 0);
  const peakA = segs.reduce((m, x) => Math.max(m, Math.abs(peakAccel(x))), 0);
  const travelMm = segs.reduce((s, x) => s + Math.abs(x.distanceMm), 0);
  return {
    periodS: period,
    duty: period > 0 ? move / period : 1,
    peakV,
    peakA,
    travelMm,
    endPosMm: segs.length ? segs[segs.length - 1].positionMm : 0,
  };
}

export function sampleSegment(seg: CycleSegment, localT: number): { v: number; a: number; sMm: number } {
  const T = Math.max(seg.time, 1e-9);
  const u = Math.min(1, Math.max(0, localT / T));
  const v0 = seg.vStart;
  const v1 = seg.vEnd;
  if (seg.accelLaw === "sin2") {
    const w = 0.5 - 0.5 * Math.cos(Math.PI * u);
    const v = v0 + (v1 - v0) * w;
    const a = ((v1 - v0) * 0.5 * Math.PI * Math.sin(Math.PI * u)) / T;
    const sMm = (v0 * localT + (v1 - v0) * (localT / 2 - (T / (2 * Math.PI)) * Math.sin(Math.PI * u))) * 1000;
    return { v, a, sMm };
  }
  if (seg.accelLaw === "jerk") {
    const j = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    const v = v0 + (v1 - v0) * j;
    const aMean = (v1 - v0) / T;
    const a = u < 0.5 ? aMean * 4 * u : aMean * 4 * (1 - u);
    const sMm = ((v0 + v) / 2) * localT * 1000;
    return { v, a, sMm };
  }
  const a = (v1 - v0) / T;
  const v = v0 + a * localT;
  const sMm = (v0 * localT + 0.5 * a * localT * localT) * 1000;
  return { v, a, sMm };
}

export interface ProfileSample {
  t: number;
  v: number;
  a: number;
  sMm: number;
  segIndex: number;
}

export function sampleCycle(cycle: MotionCycle, pointsPerSeg = 24): ProfileSample[] {
  const out: ProfileSample[] = [];
  let t0 = 0;
  let s0 = 0;
  cycle.segments.forEach((seg, i) => {
    const n = Math.max(4, pointsPerSeg);
    for (let k = 0; k <= n; k++) {
      if (k === 0 && i > 0) continue;
      const local = (k / n) * Math.max(seg.time, 0);
      const p = sampleSegment(seg, local);
      out.push({ t: t0 + local, v: p.v, a: p.a, sMm: s0 + p.sMm, segIndex: i });
    }
    t0 += Math.max(seg.time, 0);
    s0 += seg.distanceMm;
  });
  return out;
}

export function segmentBounds(cycle: MotionCycle): { i: number; t0: number; t1: number }[] {
  let t = 0;
  return cycle.segments.map((seg, i) => {
    const t0 = t;
    t += Math.max(seg.time, 0);
    return { i, t0, t1: t };
  });
}
