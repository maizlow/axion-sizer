import type { AccelLaw, ApplicationId, CycleSegment, InclineDir, Inputs, MotionCycle } from "./types";
import { getApplication } from "./applications";

export const INCLINE_OPTS: { value: InclineDir; label: string }[] = [
  { value: "uphill", label: "Uphill" },
  { value: "downhill", label: "Downhill" },
  { value: "level", label: "Level" },
];

export const ACCEL_LAW_OPTS: { value: AccelLaw; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "sin2", label: "sin²" },
  { value: "jerk", label: "Jerk-limited" },
];

export function appsWithCycle(id: ApplicationId): boolean {
  return !["mixer", "fan", "pump"].includes(id);
}

function sid(): string {
  return `seg-${Math.random().toString(36).slice(2, 8)}`;
}

function speedSi(appId: ApplicationId, inputs: Inputs): number {
  const app = getApplication(appId);
  const key = app.fields.find((f) => f.key === "speedMps" || f.key === "hookSpeedMps" || f.key === "lineSpeedMps")?.key;
  if (!key) {
    const rpm = Number(inputs.speedRpm ?? 0);
    return Number.isFinite(rpm) ? rpm / 60 : 0.5;
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
    inclineDir: prev?.inclineDir ?? "uphill",
    accelLaw: prev?.accelLaw ?? "linear",
    vStart: v0,
    vEnd: v0,
    accel: 0,
    time: 0.3,
    distanceMm: 0,
    positionMm: pos,
  };
}

export function fillKinematics(seg: CycleSegment, edited: keyof CycleSegment | "all"): CycleSegment {
  const s = { ...seg };
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
  if (!appsWithCycle(appId)) return { enabled: false, segments: [] };
  const v = Math.max(0.01, speedSi(appId, inputs));
  const t = accelTimeSi(appId, inputs);
  const a = v / t;
  const s = 0.5 * v * t * 1000;
  const dir: InclineDir = appId === "crane" || appId === "winch" || appId === "vertical-lift" ? "uphill" : "uphill";
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
    },
    "all",
  );
  const a2 = fillKinematics(
    {
      id: sid(),
      inclineDir: dir,
      accelLaw: "linear",
      vStart: v,
      vEnd: 0,
      accel: -a,
      time: t,
      distanceMm: s,
      positionMm: 2 * s,
    },
    "all",
  );
  const dwell = fillKinematics(
    {
      id: sid(),
      inclineDir: "level",
      accelLaw: "linear",
      vStart: 0,
      vEnd: 0,
      accel: 0,
      time: 0.3,
      distanceMm: 0,
      positionMm: 2 * s,
    },
    "all",
  );
  return { enabled: true, segments: relinkPositions([a1, a2, dwell]) };
}

export function peakAccel(seg: CycleSegment): number {
  const mean = seg.time > 1e-9 ? (seg.vEnd - seg.vStart) / seg.time : seg.accel;
  if (seg.accelLaw === "sin2") return mean * (Math.PI / 2);
  if (seg.accelLaw === "jerk") return mean * 1.5;
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
