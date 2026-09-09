import { GEARBOXES, INVERTERS, MOTORS } from "./catalog";
import { currentFromTorque, peakTorqueAt, s1TorqueAt } from "./motor-model";
import { serviceFactorFb, startsPerHour } from "./service-factor";
import type { Gearbox, GearboxKind, Inverter, MatchScore, MotionCycle, Motor, MotorKind, SizingResult } from "./types";

export interface MatchFilters {
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  hoursPerDay: number;
  cycle?: MotionCycle;
}

const INERTIA_LIMIT: Record<MotorKind, number> = { cm3c: 15, cm3p: 8 };

export function motorRatedCurrentA(motor: Motor): number {
  if (motor.standstillCurrentA > 0) return motor.standstillCurrentA;
  const p = motor.ratedPowerKw > 0 ? motor.ratedPowerKw : (motor.contTorqueNm * motor.ratedSpeedRpm * 2 * Math.PI) / 60 / 1000;
  const v = motor.voltageV || 400;
  return (p * 1000) / (Math.sqrt(3) * v * 0.82);
}

export function loadCurrents(result: SizingResult, motor: Motor, gb: Gearbox): { rmsA: number; peakA: number; ratedA: number } {
  const i = Math.max(gb.ratio, 1e-9);
  const eta = Math.max(gb.efficiency, 0.5);
  const tMotRms = result.rmsTorqueNm / (i * eta);
  const tMotPeak = Math.max(result.peakTorqueNm, result.holdingTorqueNm) / (i * eta);
  return {
    ratedA: motorRatedCurrentA(motor),
    rmsA: currentFromTorque(motor, tMotRms),
    peakA: currentFromTorque(motor, tMotPeak),
  };
}

export function pickInverter(rmsA: number, peakA: number, preferId?: string | null): Inverter {
  const sorted = [...INVERTERS].sort((a, b) => a.ratedCurrentA - b.ratedCurrentA);
  const preferred = preferId ? sorted.find((d) => d.id === preferId) : undefined;
  if (preferred) return preferred;
  return sorted.find((d) => d.ratedCurrentA >= rmsA * 1.05 && d.maxCurrentA >= peakA) ?? sorted[sorted.length - 1];
}

export function matchDrives(result: SizingResult, filters: MatchFilters, inverterId?: string | null): MatchScore[] {
  const needCont = (result.thermalRmsNm || result.rmsTorqueNm) * result.safetyFactor;
  const needPeak = Math.max(result.peakTorqueNm, result.holdingTorqueNm) * result.safetyFactor;
  const z = startsPerHour(filters.cycle, result.dutyCycle);
  const needSpeed = result.outputSpeedRpm;
  const jLoad = result.loadInertiaKgm2;
  const motors = MOTORS.filter((m) => filters.motorKinds.includes(m.kind));
  const boxes = GEARBOXES.filter((g) => filters.gearboxKinds.includes(g.kind));
  const out: MatchScore[] = [];

  for (const motor of motors) {
    for (const gb of boxes) {
      if (motor.ratedSpeedRpm > gb.maxInputRpm + 1) continue;
      if (needSpeed * gb.ratio > gb.maxInputRpm + 1) continue;
      const mountOk = gb.kind === "direct" || gb.motorFrames.includes(motor.size);
      if (!mountOk) continue;
      const nMot = needSpeed * gb.ratio;
      if (nMot > motor.ratedSpeedRpm * 1.02) continue;
      const eta = Math.max(gb.efficiency, 0.5);
      const s1Mot = s1TorqueAt(motor, nMot);
      const pkMot = peakTorqueAt(motor, nMot);
      const outSpeed = motor.ratedSpeedRpm / gb.ratio;
      const outCont = s1Mot * gb.ratio * eta;
      const outPeak = pkMot * gb.ratio * eta;
      const jRef = jLoad / (gb.ratio * gb.ratio) + gb.inertiaKgm2;
      const inertiaRatio = motor.inertiaKgm2 > 0 ? jRef / motor.inertiaKgm2 : 99;
      const speedOk = outSpeed >= needSpeed * 0.98;
      const tMotNeedC = needCont / (gb.ratio * eta);
      const tMotNeedP = needPeak / (gb.ratio * eta);
      const torqueOk = s1Mot >= tMotNeedC && pkMot >= tMotNeedP;
      const sfb = serviceFactorFb({
        inertiaRatio,
        hoursPerDay: filters.hoursPerDay,
        startsPerHour: z,
      });
      const tEq = Math.max(result.thermalRmsNm || result.rmsTorqueNm, result.holdingTorqueNm);
      const gbNeed = tEq * sfb.fb;
      const tPeakLoad = Math.max(result.peakTorqueNm, result.holdingTorqueNm);
      const tWork = Math.max(tEq, tPeakLoad, 1e-6);
      const fbAvail = gb.ratedOutputNm / tWork;
      const gbOk = gb.ratedOutputNm >= gbNeed && (gb.accelTorqueNm ?? gb.ratedOutputNm * 1.5) >= tPeakLoad;
      const inertiaOk = inertiaRatio <= INERTIA_LIMIT[motor.kind] || gb.kind === "direct";
      if (!speedOk || !torqueOk || !gbOk) continue;

      const utilC = needCont / Math.max(outCont, 1e-6);
      const utilP = needPeak / Math.max(outPeak, 1e-6);
      const util = Math.max(utilC, utilP);
      const cur = loadCurrents(result, motor, gb);
      const inv = pickInverter(cur.rmsA * result.safetyFactor, cur.peakA * result.safetyFactor, inverterId);
      const invUtilC = cur.rmsA / Math.max(inv.ratedCurrentA, 1e-6);
      const invUtilP = cur.peakA / Math.max(inv.maxCurrentA, 1e-6);

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
      if (sfb.fb > 1.5) score -= (sfb.fb - 1.5) * 6;
      if (invUtilC > 0.95) score -= 10;
      if (invUtilP > 0.95) score -= 8;

      const reasons: string[] = [];
      if (utilC > 0.9) reasons.push("reason.utilC");
      if (utilP > 0.9) reasons.push("reason.utilP");
      if (!inertiaOk) reasons.push(`reason.inertia|${inertiaRatio.toFixed(1)}|${motor.series}`);
      reasons.push(motor.kind === "cm3c" ? "reason.cm3c" : "reason.cm3p");
      if (outSpeed > needSpeed * 2.2) reasons.push("reason.speed");
      reasons.push(`reason.flange|${motor.size}|${gb.family}|${gb.size}`);
      if (invUtilC > 0.9) reasons.push("reason.invC");
      if (invUtilP > 0.9) reasons.push("reason.invP");
      if (fbAvail < 1.5) reasons.push(`reason.fbLow|${sfb.fb.toFixed(2)}|${fbAvail.toFixed(2)}`);
      else reasons.push(`reason.fbOk|${sfb.fb.toFixed(2)}|${fbAvail.toFixed(2)}`);

      out.push({
        motor,
        gearbox: gb,
        inverter: inv,
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
        motorCurrentA: cur.rmsA,
        peakCurrentA: cur.peakA,
        invUtilCont: invUtilC,
        invUtilPeak: invUtilP,
        serviceFactorFb: sfb.fb,
        serviceFactorAvail: fbAvail,
        loadClass: sfb.loadClass,
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
