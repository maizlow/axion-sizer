import type { Gearbox, MatchScore, MotionCycle, Motor, SizingResult } from "./types";

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
}

export function motorPeakCurve(motor: Motor): CurvePt[] {
  const nR = motor.ratedSpeedRpm;
  const mpk = motor.peakTorqueNm;
  const nMax = nR * 1.12;
  const pts: CurvePt[] = [];
  for (let n = 0; n <= nMax; n += nMax / 40) {
    const t = n <= nR ? mpk : mpk * Math.max(0.12, 1 - ((n - nR) / (nMax - nR)) ** 1.6);
    pts.push({ n, t });
  }
  pts.push({ n: nMax, t: mpk * 0.12 });
  return pts;
}

/** Approximate S1 / effective continuous limit vs speed (non-ventilated shape). */
export function motorS1Curve(motor: Motor): CurvePt[] {
  const nR = motor.ratedSpeedRpm;
  const m0 = motor.contTorqueNm;
  const pts: CurvePt[] = [];
  const nMax = nR;
  for (let n = 0; n <= nMax; n += nMax / 36) {
    const u = n / Math.max(nR, 1);
    const t = m0 * (0.88 - 0.22 * u * u);
    pts.push({ n, t: Math.max(0.25 * m0, t) });
  }
  return pts;
}

export function gearboxRatedLine(gb: Gearbox): CurvePt[] {
  return [
    { n: 0, t: gb.ratedOutputNm },
    { n: gb.maxInputRpm, t: gb.ratedOutputNm },
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

export function operatingPoints(result: SizingResult, match: MatchScore, _cycle?: MotionCycle): {
  motor: OpPt[];
  gearbox: OpPt[];
} {
  const i = Math.max(match.gearbox.ratio, 1e-9);
  const eta = Math.max(match.gearbox.efficiency, 0.5);
  const nLoad = result.outputSpeedRpm;
  const nMotCruise = nLoad * i;
  const tMotRms = result.rmsTorqueNm / (i * eta);
  const tMotPeak = result.peakTorqueNm / (i * eta);
  const tGbRms = result.rmsTorqueNm;
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
