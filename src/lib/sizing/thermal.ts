import { peakTorqueAt, s1TorqueAt } from "./motor-model";
import type { Gearbox, Inverter, MatchScore, MotionCycle, Motor, SizingResult } from "./types";

export interface CurvePt {
  n: number;
  t: number;
}

export interface OpPt {
  id: string;
  n: number;
  t: number;
  label: string;
  kind: "s1" | "peak" | "hold";
  color?: string;
  tag?: string;
}

export function motorPeakCurve(
  motor: Pick<Motor, "ratedSpeedRpm" | "peakTorqueNm" | "contTorqueNm"> & { s1SpeedRpm?: number },
): CurvePt[] {
  const nR = Math.max(motor.ratedSpeedRpm, 1);
  const nS1 = motor.s1SpeedRpm ?? nR;
  const nMax = nR * 1.08;
  const full: Pick<Motor, "contTorqueNm" | "peakTorqueNm" | "s1SpeedRpm" | "ratedSpeedRpm"> = {
    contTorqueNm: motor.contTorqueNm ?? motor.peakTorqueNm / 3,
    peakTorqueNm: motor.peakTorqueNm,
    s1SpeedRpm: nS1,
    ratedSpeedRpm: nR,
  };
  const pts: CurvePt[] = [];
  for (let n = 0; n <= nMax; n += nMax / 40) {
    pts.push({ n, t: peakTorqueAt(full, n) });
  }
  return pts;
}

/** S1: M0 to nS1, then 1/n. */
export function motorS1Curve(
  motor: Pick<Motor, "ratedSpeedRpm" | "contTorqueNm"> & { s1SpeedRpm?: number },
): CurvePt[] {
  const nR = Math.max(motor.ratedSpeedRpm, 1);
  const nS1 = motor.s1SpeedRpm ?? nR;
  const full = { contTorqueNm: motor.contTorqueNm, s1SpeedRpm: nS1, ratedSpeedRpm: nR };
  const pts: CurvePt[] = [];
  for (let n = 0; n <= nR; n += nR / 36) {
    pts.push({ n, t: s1TorqueAt(full, n) });
  }
  pts.push({ n: nR, t: s1TorqueAt(full, nR) });
  return pts;
}

export function gearboxRatedLine(gb: Gearbox): CurvePt[] {
  return [
    { n: 0, t: gb.ratedOutputNm },
    { n: gb.maxInputRpm, t: gb.ratedOutputNm },
  ];
}

export function gearboxAccelLine(gb: Gearbox): CurvePt[] {
  const me = gb.accelTorqueNm || gb.ratedOutputNm * 1.6;
  return [
    { n: 0, t: me },
    { n: gb.maxInputRpm, t: me },
  ];
}

/** Thermal output torque falling with input speed after a knee. */
export function gearboxThermalCurve(gb: Gearbox): CurvePt[] {
  const nMax = gb.maxInputRpm;
  const t0 = gb.ratedOutputNm * 0.92;
  const knee = nMax * 0.28;
  const pts: CurvePt[] = [];
  for (let n = 0; n <= nMax; n += nMax / 36) {
    const t = n <= knee ? t0 : t0 * Math.pow(knee / Math.max(n, 1), 0.32);
    pts.push({ n, t });
  }
  return pts;
}

export function inverterLimitCurves(motor: Motor, inv: Inverter): { cont: CurvePt[]; peak: CurvePt[] } {
  const kt = Math.max(motor.torqueConstantNmA, 1e-6);
  const tCont = inv.ratedCurrentA * kt;
  const tPeak = inv.maxCurrentA * kt;
  const nR = motor.ratedSpeedRpm;
  const nS1 = motor.s1SpeedRpm || nR;
  const nMax = nR * 1.08;
  const mot = motor;
  const cont: CurvePt[] = [];
  const peak: CurvePt[] = [];
  for (let n = 0; n <= nMax; n += nMax / 24) {
    const fade = n <= nS1 ? 1 : nS1 / Math.max(n, 1);
    cont.push({ n, t: Math.min(tCont * fade, s1TorqueAt(mot, n) * 1.05) });
    peak.push({ n, t: Math.min(tPeak * fade, peakTorqueAt(mot, n) * 1.05) });
  }
  return { cont, peak };
}

export function operatingPoints(result: SizingResult, match: MatchScore, _cycle?: MotionCycle): {
  motor: OpPt[];
  gearbox: OpPt[];
} {
  const i = Math.max(match.gearbox.ratio, 1e-9);
  const eta = Math.max(match.gearbox.efficiency, 0.5);
  const nLoad = result.outputSpeedRpm;
  const nMotCruise = nLoad * i;
  const tMotRms = (result.thermalRmsNm || result.rmsTorqueNm) / (i * eta);
  const tMotPeak = result.peakTorqueNm / (i * eta);
  const tGbRms = result.thermalRmsNm || result.rmsTorqueNm;
  const tGbPeak = result.peakTorqueNm;

  const motor: OpPt[] = [
    { id: "rms", n: Math.max(nMotCruise * 0.45, 80), t: tMotRms, label: "Average", kind: "s1" },
    { id: "peak", n: nMotCruise, t: tMotPeak, label: "Peak", kind: "peak" },
    {
      id: "hold",
      n: Math.max(nMotCruise * 0.08, 40),
      t: Math.max(result.holdingTorqueNm, 0) / (i * eta),
      label: "Hold",
      kind: "hold",
    },
  ];
  const gearbox: OpPt[] = [
    { id: "rms", n: Math.max(nMotCruise * 0.45, 80), t: tGbRms, label: "Average", kind: "s1" },
    {
      id: "peak",
      n: Math.min(Math.max(nMotCruise, 200), match.gearbox.maxInputRpm),
      t: tGbPeak,
      label: "Peak",
      kind: "peak",
    },
    {
      id: "hold",
      n: Math.max(nMotCruise * 0.08, 40),
      t: result.holdingTorqueNm,
      label: "Hold",
      kind: "hold",
    },
  ];

  return { motor, gearbox };
}
