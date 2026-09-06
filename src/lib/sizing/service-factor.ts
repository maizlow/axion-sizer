import type { MotionCycle } from "./types";
import { cycleSummary } from "./cycle";

/** SEW-style load class from mass acceleration factor FI ≈ J_ext / J_mot. */
export type LoadClass = "I" | "II" | "III";

export function loadClassFromFi(fi: number): LoadClass {
  if (fi <= 0.2) return "I";
  if (fi <= 3) return "II";
  return "III";
}

/**
 * Approximate SEW application service factor fB.
 * Official value is read from the fB diagram (hours/day × Z × load class).
 * Product rule: T_a × fB ≤ T_N of the gear unit (catalog fs = 1.0 rating).
 */
const FB_HOURS: Record<LoadClass, { h: number; fb: number }[]> = {
  I: [
    { h: 2, fb: 0.8 },
    { h: 8, fb: 1.0 },
    { h: 16, fb: 1.15 },
    { h: 24, fb: 1.25 },
  ],
  II: [
    { h: 2, fb: 1.0 },
    { h: 8, fb: 1.2 },
    { h: 16, fb: 1.45 },
    { h: 24, fb: 1.6 },
  ],
  III: [
    { h: 2, fb: 1.2 },
    { h: 8, fb: 1.4 },
    { h: 16, fb: 1.65 },
    { h: 24, fb: 1.85 },
  ],
};

function lerpTable(rows: { h: number; fb: number }[], hours: number): number {
  const h = Math.min(24, Math.max(1, hours));
  if (h <= rows[0].h) return rows[0].fb;
  for (let i = 1; i < rows.length; i++) {
    if (h <= rows[i].h) {
      const a = rows[i - 1];
      const b = rows[i];
      const u = (h - a.h) / (b.h - a.h);
      return a.fb + u * (b.fb - a.fb);
    }
  }
  return rows[rows.length - 1].fb;
}

function zMultiplier(zPerHour: number): number {
  const z = Math.max(0, zPerHour);
  if (z <= 1) return 1;
  if (z <= 200) return 1 + (0.06 * z) / 200;
  if (z <= 400) return 1.06 + (0.08 * (z - 200)) / 200;
  if (z <= 800) return 1.14 + (0.08 * (z - 400)) / 400;
  return 1.22;
}

export function startsPerHour(cycle: MotionCycle | undefined, dutyCycle: number): number {
  if (cycle?.enabled && cycle.segments.length) {
    const sum = cycleSummary(cycle);
    const starts = cycle.segments.filter((s) => s.inclineDir === "accel" && Math.abs(s.accel) > 1e-4).length;
    if (sum.periodS > 1e-6) return (starts * 3600) / sum.periodS;
  }
  return Math.max(1, dutyCycle * 60);
}

export function serviceFactorFb(opts: {
  inertiaRatio: number;
  hoursPerDay: number;
  startsPerHour: number;
}): { fb: number; loadClass: LoadClass; fi: number } {
  const fi = Math.max(0, opts.inertiaRatio);
  const loadClass = loadClassFromFi(fi);
  const base = lerpTable(FB_HOURS[loadClass], opts.hoursPerDay);
  const fb = Math.round(base * zMultiplier(opts.startsPerHour) * 100) / 100;
  return { fb, loadClass, fi };
}
