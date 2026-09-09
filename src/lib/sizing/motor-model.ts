import type { Motor } from "./types";

/**
 * nS1 vs speed class from published nameplates:
 * CM3C71S-20A nS1 = 2000; CM3C80L-60A nS1 = 3700.
 * Linear in nN between those points. Other windings are estimated.
 */
export function estimateS1Rpm(nN: number): number {
  const n = Math.max(1000, nN);
  const ratio = 1 - 0.383 * ((n - 2000) / 4000);
  return Math.round(Math.min(n, Math.max(n * 0.55, n * ratio)));
}

/** High-speed windings show a small M0 drop (CM3C80S-60A: 10.1 vs 10.5). */
export function estimateM0Scale(nN: number): number {
  return 1 - 0.038 * Math.max(0, nN - 2000) / 4000;
}

/**
 * I0 ≈ 0.000255 · M0 · nN from 71S-20 / 80S-60 / 80L-60 plates.
 * kt = M0 / I0. Imax scales with Mpk/M0.
 */
export function estimateElectrical(m0: number, mpk: number, nN: number): {
  i0: number;
  imax: number;
  kt: number;
} {
  const i0 = Math.max(0.2, 0.000255 * m0 * nN);
  const kt = m0 / i0;
  const imax = i0 * (mpk / Math.max(m0, 1e-6)) * 1.12;
  return { i0: round3(i0), imax: round3(imax), kt: round3(kt) };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** S1 / continuous torque at motor speed n. Flat to nS1, then 1/n to nN. */
export function s1TorqueAt(motor: Pick<Motor, "contTorqueNm" | "s1SpeedRpm" | "ratedSpeedRpm">, nRpm: number): number {
  const m0 = motor.contTorqueNm;
  const nS1 = Math.max(1, motor.s1SpeedRpm || motor.ratedSpeedRpm);
  const n = Math.max(0, nRpm);
  if (n <= nS1) return m0;
  return m0 * (nS1 / n);
}

/** Peak torque: Mpk to nS1, then 1/n, never below ~S1. */
export function peakTorqueAt(
  motor: Pick<Motor, "contTorqueNm" | "peakTorqueNm" | "s1SpeedRpm" | "ratedSpeedRpm">,
  nRpm: number,
): number {
  const mpk = motor.peakTorqueNm;
  const nS1 = Math.max(1, motor.s1SpeedRpm || motor.ratedSpeedRpm);
  const n = Math.max(0, nRpm);
  if (n <= nS1) return mpk;
  return Math.max(s1TorqueAt(motor, n), mpk * (nS1 / n));
}

export function currentFromTorque(motor: Pick<Motor, "torqueConstantNmA" | "standstillCurrentA" | "contTorqueNm">, tNm: number): number {
  const kt = motor.torqueConstantNmA;
  if (kt > 1e-6) return Math.abs(tNm) / kt;
  const m0 = Math.max(motor.contTorqueNm, 1e-6);
  return (Math.abs(tNm) / m0) * Math.max(motor.standstillCurrentA, 0.2);
}
