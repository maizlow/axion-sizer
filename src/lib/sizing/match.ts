import { GEARBOXES, MOTORS } from "./catalog";
import type { GearboxKind, MatchScore, MotorKind, SizingResult } from "./types";

export interface MatchFilters {
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
}

const INERTIA_LIMIT: Record<MotorKind, number> = { cm3c: 15, cm3p: 8 };

export function matchDrives(result: SizingResult, filters: MatchFilters): MatchScore[] {
  const needCont = result.rmsTorqueNm * result.safetyFactor;
  const needPeak = Math.max(result.peakTorqueNm, result.holdingTorqueNm) * result.safetyFactor;
  const needSpeed = result.outputSpeedRpm;
  const jLoad = result.loadInertiaKgm2;
  const motors = MOTORS.filter((m) => filters.motorKinds.includes(m.kind));
  const boxes = GEARBOXES.filter((g) => filters.gearboxKinds.includes(g.kind));
  const out: MatchScore[] = [];

  for (const motor of motors) {
    for (const gb of boxes) {
      if (motor.ratedSpeedRpm > gb.maxInputRpm + 1) continue;
      const mountOk = gb.kind === "direct" || gb.motorFrames.includes(motor.size);
      if (!mountOk) continue;
      const outSpeed = motor.ratedSpeedRpm / gb.ratio;
      const outCont = motor.contTorqueNm * gb.ratio * gb.efficiency;
      const outPeak = motor.peakTorqueNm * gb.ratio * gb.efficiency;
      const jRef = jLoad / (gb.ratio * gb.ratio) + gb.inertiaKgm2;
      const inertiaRatio = motor.inertiaKgm2 > 0 ? jRef / motor.inertiaKgm2 : 99;
      const speedOk = outSpeed >= needSpeed * 0.98;
      const torqueOk = outCont >= needCont && outPeak >= needPeak;
      const gbOk = gb.ratedOutputNm >= needPeak;
      const inertiaOk = inertiaRatio <= INERTIA_LIMIT[motor.kind] || gb.kind === "direct";
      if (!speedOk || !torqueOk || !gbOk) continue;

      const utilC = needCont / Math.max(outCont, 1e-6);
      const utilP = needPeak / Math.max(outPeak, 1e-6);
      const util = Math.max(utilC, utilP);
      let score = 100;
      score -= Math.abs(util - 0.68) * 80;
      if (util > 0.92) score -= 15;
      if (util < 0.25) score -= 20;
      if (!inertiaOk) score -= 18;
      if (motor.kind === "cm3p" && inertiaRatio > 6) score -= (inertiaRatio - 6) * 3;
      if (motor.kind === "cm3c" && inertiaRatio < 2 && jLoad > 0.01) score -= 4;
      if (gb.kind === "direct" && needSpeed < motor.ratedSpeedRpm * 0.3) score -= 25;
      score -= motor.massKg * 0.04 + gb.massKg * 0.03;
      if (outSpeed > needSpeed * 2.8 && gb.kind !== "direct") score -= 10;
      if (gb.ratedOutputNm > needPeak * 4) score -= 12;

      const reasons: string[] = [];
      if (utilC > 0.9) reasons.push("Continuous utilization above 90% of M0 × i × η");
      if (utilP > 0.9) reasons.push("Peak utilization above 90% of Mpk × i × η");
      if (!inertiaOk) reasons.push(`Inertia ratio ${inertiaRatio.toFixed(1)} is high for ${motor.series}`);
      reasons.push(
        motor.kind === "cm3c"
          ? "CM3C medium inertia — preferred with high reflected load"
          : "CM3P high dynamic — preferred for short cycles and low load inertia",
      );
      if (outSpeed > needSpeed * 2.2) reasons.push("Large speed headroom — a higher ratio may fit better");
      reasons.push(`Flange pairing: CM3 size ${motor.size} is listed for ${gb.family} ${gb.size}`);

      out.push({
        motor,
        gearbox: gb,
        outputContNm: outCont,
        outputPeakNm: outPeak,
        outputSpeedRpm: outSpeed,
        utilizationCont: utilC,
        utilizationPeak: utilP,
        inertiaRatio,
        thermalOk: outCont >= needCont,
        speedOk,
        torqueOk,
        gbOk,
        inertiaOk,
        mountOk,
        score,
        reasons,
      });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 18);
}

export function formatNm(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 100) return n.toFixed(0);
  if (a >= 10) return n.toFixed(1);
  if (a >= 1) return n.toFixed(2);
  return n.toFixed(3);
}

export function formatKw(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n >= 10 ? n.toFixed(1) : n.toFixed(2);
}

export function formatRpm(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(n >= 100 ? 0 : 1);
}
