import { getApplication } from "./applications";
import type { ApplicationId, Inputs, SizingResult } from "./types";

const G = 9.80665;

function num(inputs: Inputs, key: string, fallback = 0): number {
  const v = inputs[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "" && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

function toSi(appId: ApplicationId, inputs: Inputs, key: string): number {
  const app = getApplication(appId);
  const field = app.fields.find((f) => f.key === key);
  const raw = num(inputs, key, field?.defaultValue ?? 0);
  if (!field) return raw;
  return raw * field.metricToSi;
}

function rmsFromDuty(steady: number, peak: number, accelTime: number, speed: number, duty: number): number {
  const period = Math.max(accelTime * 2 + 1, 2);
  const cruiseTime = Math.max(0.2, period * duty - accelTime);
  const idle = Math.max(0, period - 2 * accelTime - cruiseTime);
  const sum =
    peak * peak * accelTime +
    steady * steady * cruiseTime +
    peak * peak * accelTime * 0.7 +
    0 * idle;
  return Math.sqrt(sum / period);
}

function baseResult(): SizingResult {
  return {
    forceN: 0,
    outputTorqueNm: 0,
    peakTorqueNm: 0,
    loweringTorqueNm: 0,
    holdingTorqueNm: 0,
    rmsTorqueNm: 0,
    outputSpeedRpm: 0,
    outputPowerKw: 0,
    peakPowerKw: 0,
    loadInertiaKgm2: 0,
    accelRadS2: 0,
    accelTimeS: 1,
    dutyCycle: 1,
    safetyFactor: 1.3,
    formulas: [],
    warnings: [],
    notes: [],
  };
}

function finish(r: SizingResult): SizingResult {
  const omega = (r.outputSpeedRpm * 2 * Math.PI) / 60;
  r.outputPowerKw = (r.outputTorqueNm * omega) / 1000;
  r.peakPowerKw = (r.peakTorqueNm * omega) / 1000;
  if (r.outputTorqueNm <= 0 || r.outputSpeedRpm <= 0) {
    r.warnings.push("Inputs produce a non-positive torque or speed. Check values.");
  }
  if (r.safetyFactor < 1.2 && r.notes.every((n) => !n.includes("safety"))) {
    r.notes.push("Safety factor is below 1.2 — unusual for industrial motion.");
  }
  return r;
}

function orientationTheta(inputs: Inputs, fallbackDeg: number): number {
  const o = String(inputs.orientation ?? "");
  if (o === "vertical") return Math.PI / 2;
  if (o === "horizontal") return 0;
  return (fallbackDeg * Math.PI) / 180;
}

function forceToTorque(forceN: number, kind: "screw" | "pulley", leadOrDia: number, eta: number): number {
  if (kind === "screw") return (forceN * leadOrDia) / (2 * Math.PI * eta);
  return (forceN * (leadOrDia / 2)) / eta;
}

function sizeLinearBeltLike(
  appId: ApplicationId,
  inputs: Inputs,
  massKeys: { payload: string; extra: string },
  speedKey: string,
  diaKey: string,
): SizingResult {
  const r = baseResult();
  const mPay = toSi(appId, inputs, massKeys.payload);
  const mExtra = toSi(appId, inputs, massKeys.extra);
  const m = mPay + mExtra;
  const v = toSi(appId, inputs, speedKey);
  const d = toSi(appId, inputs, diaKey);
  const theta = ((appId === "conveyor" ? toSi(appId, inputs, "inclineDeg") : 0) * Math.PI) / 180;
  const mu = toSi(appId, inputs, "mu");
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const a = v / Math.max(tAcc, 0.05);

  const fGrav = m * G * Math.sin(theta);
  const fFric = mu * m * G * Math.cos(theta);
  const fAcc = m * a;
  const fSteady = fGrav + fFric;
  const fPeak = fSteady + fAcc;
  const radius = d / 2;

  r.forceN = fSteady;
  r.outputTorqueNm = (fSteady * radius) / eta;
  r.peakTorqueNm = (fPeak * radius) / eta;
  r.outputSpeedRpm = v > 0 && d > 0 ? (v / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = m * radius * radius;
  r.accelRadS2 = radius > 0 ? a / radius : 0;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);

  r.formulas = [
    { name: "Moving mass", expression: "m = m_payload + m_equivalent", value: m, unit: "kg" },
    { name: "Acceleration", expression: "a = v / t_acc", value: a, unit: "m/s²" },
    { name: "Gravity component", expression: "F_g = m g sinθ", value: fGrav, unit: "N" },
    { name: "Friction", expression: "F_μ = μ m g cosθ", value: fFric, unit: "N" },
    { name: "Inertial force", expression: "F_a = m a", value: fAcc, unit: "N" },
    { name: "Steady belt pull", expression: "F = F_g + F_μ", value: fSteady, unit: "N" },
    { name: "Peak belt pull", expression: "F_pk = F + F_a", value: fPeak, unit: "N" },
    { name: "Steady torque", expression: "T = F · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = F_pk · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Pulley speed", expression: "n = v / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "Reflected inertia", expression: "J = m r²", value: r.loadInertiaKgm2, unit: "kg·m²" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];

  if (theta > 0.3 && mu < 0.08) {
    r.warnings.push("Incline with a low μ — check belt slip and take-up tension.");
  }
  r.notes.push("Torque is at the drive pulley. Catalog gearboxes sit between motor and pulley.");
  return finish(r);
}

function sizeHoistLike(
  appId: ApplicationId,
  inputs: Inputs,
  massKey: string,
  speedKey: string,
  diaKey: string,
  fallsKey: string | null,
): SizingResult {
  const r = baseResult();
  const m = toSi(appId, inputs, massKey);
  const v = toSi(appId, inputs, speedKey);
  const d = toSi(appId, inputs, diaKey);
  const falls = Math.max(1, fallsKey ? toSi(appId, inputs, fallsKey) : 1);
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const a = v / Math.max(tAcc, 0.05);
  const radius = d / 2;

  const fSteady = (m * G) / falls;
  const fPeak = (m * G + m * a) / falls;
  const ropeSpeed = v * falls;

  r.forceN = m * G;
  r.outputTorqueNm = (fSteady * radius) / eta;
  r.peakTorqueNm = (fPeak * radius) / eta;
  r.outputSpeedRpm = d > 0 ? (ropeSpeed / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = (m / (falls * falls)) * radius * radius;
  r.accelRadS2 = radius > 0 ? (a * falls) / radius : 0;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.holdingTorqueNm = r.outputTorqueNm;
  r.loweringTorqueNm = Math.max(0, ((m * G - m * a) / falls) * radius / eta);
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);

  r.formulas = [
    { name: "Hook / line force", expression: "F = m g", value: m * G, unit: "N" },
    { name: "Force at drum", expression: "F_d = (m g) / falls", value: fSteady, unit: "N" },
    { name: "Acceleration", expression: "a = v / t_acc", value: a, unit: "m/s²" },
    { name: "Steady drum torque", expression: "T = F_d · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak drum torque", expression: "T_pk = ((m g + m a) / falls) · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = ((m g − m a) / falls) · r / η", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Drum speed", expression: "n = (v · falls) / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "Reflected inertia", expression: "J = (m / falls²) r²", value: r.loadInertiaKgm2, unit: "kg·m²" },
    { name: "Holding torque", expression: "T_hold = T_steady (brake sizing)", value: r.outputTorqueNm, unit: "N·m" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];

  r.warnings.push("Specify a holding brake at least equal to steady torque plus safety factor.");
  if (falls >= 6) r.notes.push("High reeving reduces torque but raises drum speed and sheave losses.");
  return finish(r);
}

function sizeScrew(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const m = toSi(appId, inputs, "payloadKg");
  const v = toSi(appId, inputs, "speedMps");
  const lead = toSi(appId, inputs, "leadM");
  const theta = orientationTheta(inputs, toSi(appId, inputs, "inclineDeg"));
  const mu = toSi(appId, inputs, "mu");
  const preload = toSi(appId, inputs, "preloadN");
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const a = v / Math.max(tAcc, 0.05);

  const fGrav = m * G * Math.sin(theta);
  const fFric = mu * m * G * Math.cos(theta);
  const fAcc = m * a;
  const fRaise = fGrav + fFric + preload;
  const fRaisePk = fRaise + fAcc;
  const fLower = Math.max(0, fGrav - fFric - preload);
  const fHold = fGrav + preload;

  r.forceN = fRaise;
  r.outputTorqueNm = (fRaise * lead) / (2 * Math.PI * eta);
  r.peakTorqueNm = (fRaisePk * lead) / (2 * Math.PI * eta);
  r.loweringTorqueNm = (fLower * lead) / (2 * Math.PI * eta);
  r.holdingTorqueNm = (fHold * lead) / (2 * Math.PI * Math.max(eta, 0.3));
  r.outputSpeedRpm = lead > 0 ? (v / lead) * 60 : 0;
  r.loadInertiaKgm2 = lead > 0 ? m * (lead / (2 * Math.PI)) ** 2 : 0;
  r.accelRadS2 = lead > 0 ? (a * 2 * Math.PI) / lead : 0;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);

  r.formulas = [
    { name: "Raise force", expression: "F↑ = m g sinθ + μ m g cosθ + F_pre", value: fRaise, unit: "N" },
    { name: "Peak raise force", expression: "F↑_pk = F↑ + m a", value: fRaisePk, unit: "N" },
    { name: "Lower force", expression: "F↓ = max(0, m g sinθ − μ m g cosθ − F_pre)", value: fLower, unit: "N" },
    { name: "Raise torque", expression: "T↑ = F↑ · lead / (2π η)", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = F↑_pk · lead / (2π η)", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = F↓ · lead / (2π η)", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Holding torque", expression: "T_hold = (m g sinθ + F_pre) · lead / (2π η)", value: r.holdingTorqueNm, unit: "N·m" },
    { name: "Screw speed", expression: "n = v / lead · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "Reflected inertia", expression: "J = m (lead / 2π)²", value: r.loadInertiaKgm2, unit: "kg·m²" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];

  if (theta > 0.4) {
    r.warnings.push("Vertical / inclined axis: size a holding brake for holding torque × safety factor.");
  }
  if (eta >= 0.8 && theta > 1.2) {
    r.warnings.push("Ball screws back-drive. Do not rely on the screw to hold the load.");
  }
  if (theta > 1.2) {
    r.notes.push("Lowering is gravity-assisted. Regenerative braking on the inverter may be required.");
  }
  return finish(r);
}

function sizeRackOrGantry(
  appId: ApplicationId,
  inputs: Inputs,
  diaKey: string,
  incline: boolean,
): SizingResult {
  const r = baseResult();
  const m = toSi(appId, inputs, "payloadKg");
  const v = toSi(appId, inputs, "speedMps");
  const d = toSi(appId, inputs, diaKey);
  const theta = orientationTheta(inputs, incline ? toSi(appId, inputs, "inclineDeg") : 0);
  const mu = toSi(appId, inputs, "mu");
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const a = v / Math.max(tAcc, 0.05);
  const radius = d / 2;

  const fGrav = m * G * Math.sin(theta);
  const fFric = mu * m * G * Math.cos(theta);
  const fRaise = fGrav + fFric;
  const fRaisePk = fRaise + m * a;
  const fLower = Math.max(0, fGrav - fFric);

  r.forceN = fRaise;
  r.outputTorqueNm = (fRaise * radius) / eta;
  r.peakTorqueNm = (fRaisePk * radius) / eta;
  r.loweringTorqueNm = (fLower * radius) / eta;
  r.holdingTorqueNm = (fGrav * radius) / Math.max(eta, 0.3);
  r.outputSpeedRpm = d > 0 ? (v / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = m * radius * radius;
  r.accelRadS2 = radius > 0 ? a / radius : 0;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);

  r.formulas = [
    { name: "Raise force", expression: "F↑ = m g sinθ + μ m g cosθ", value: fRaise, unit: "N" },
    { name: "Peak raise force", expression: "F↑_pk = F↑ + m a", value: fRaisePk, unit: "N" },
    { name: "Lower force", expression: "F↓ = max(0, m g sinθ − μ m g cosθ)", value: fLower, unit: "N" },
    { name: "Raise torque", expression: "T↑ = F↑ · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = F↑_pk · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = F↓ · r / η", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Holding torque", expression: "T_hold = m g sinθ · r / η", value: r.holdingTorqueNm, unit: "N·m" },
    { name: "Pinion / pulley speed", expression: "n = v / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "Reflected inertia", expression: "J = m r²", value: r.loadInertiaKgm2, unit: "kg·m²" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  if (theta > 0.4) {
    r.warnings.push("Vertical / inclined axis: size a holding brake for holding torque × safety factor.");
    r.notes.push("Lowering is gravity-assisted. Check regenerative energy on the inverter.");
  }
  return finish(r);
}

function sizeVerticalLift(appId: ApplicationId, inputs: Inputs): SizingResult {
  const mechanism = String(inputs.mechanism ?? "ball-screw");
  if (mechanism === "ball-screw") {
    return sizeScrew(appId, { ...inputs, orientation: "vertical", inclineDeg: 90 });
  }
  const diaKey = mechanism === "rack" ? "pinionDiaM" : "pulleyDiaM";
  return sizeRackOrGantry(appId, { ...inputs, orientation: "vertical", inclineDeg: 90 }, diaKey, true);
}

function sizeRotary(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const jTable = toSi(appId, inputs, "tableInertia");
  const jPay = toSi(appId, inputs, "payloadInertia");
  const n = toSi(appId, inputs, "speedRpm");
  const tFric = toSi(appId, inputs, "fricTorqueNm");
  const tUnb = toSi(appId, inputs, "unbalanceNm");
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const j = jTable + jPay;
  const omega = (n * 2 * Math.PI) / 60;
  const alpha = omega / Math.max(tAcc, 0.05);
  const tInert = j * alpha;
  const tSteady = (tFric + tUnb) / eta;
  const tPeak = (tInert + tFric + tUnb) / eta;

  r.forceN = 0;
  r.outputTorqueNm = tSteady;
  r.peakTorqueNm = tPeak;
  r.outputSpeedRpm = n;
  r.loadInertiaKgm2 = j;
  r.accelRadS2 = alpha;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(tSteady, tPeak, tAcc, n, duty);

  r.formulas = [
    { name: "Total inertia", expression: "J = J_table + J_payload", value: j, unit: "kg·m²" },
    { name: "Angular rate", expression: "ω = n · 2π / 60", value: omega, unit: "rad/s" },
    { name: "Angular accel", expression: "α = ω / t_acc", value: alpha, unit: "rad/s²" },
    { name: "Inertial torque", expression: "T_j = J α", value: tInert, unit: "N·m" },
    { name: "Steady torque", expression: "T = (T_fric + T_unb) / η", value: tSteady, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = (T_j + T_fric + T_unb) / η", value: tPeak, unit: "N·m" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];

  if (tSteady < 0.05 * tPeak) {
    r.notes.push("This axis is inertia-dominated. Peak torque and inertia ratio will drive the selection.");
  }
  return finish(r);
}

function sizeMixer(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const rho = toSi(appId, inputs, "density");
  const d = toSi(appId, inputs, "impellerDiaM");
  const nRpm = toSi(appId, inputs, "speedRpm");
  const np = toSi(appId, inputs, "powerNumber");
  const proc = toSi(appId, inputs, "serviceFactor");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const n = nRpm / 60;
  const pHyd = np * rho * n ** 3 * d ** 5;
  const pShaft = (pHyd * proc) / eta;
  const omega = 2 * Math.PI * n;
  const t = omega > 0 ? pShaft / omega : 0;

  r.forceN = 0;
  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.4;
  r.outputSpeedRpm = nRpm;
  r.loadInertiaKgm2 = 0.1 * rho * d ** 5;
  r.accelRadS2 = omega / 4;
  r.accelTimeS = 4;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, 0.2));

  r.formulas = [
    { name: "Rotational frequency", expression: "N = n / 60", value: n, unit: "1/s" },
    { name: "Hydraulic power", expression: "P = Np ρ N³ D⁵", value: pHyd, unit: "W" },
    { name: "Shaft power", expression: "P_shaft = P · k_process / η", value: pShaft, unit: "W" },
    { name: "Shaft torque", expression: "T = P_shaft / ω", value: t, unit: "N·m" },
    { name: "Start torque (est.)", expression: "T_pk ≈ 1.4 T", value: r.peakTorqueNm, unit: "N·m" },
  ];
  r.notes.push("Power number assumes turbulent Newtonian flow. Viscous tanks need a Reynolds check.");
  return finish(r);
}

function sizeFan(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const q = toSi(appId, inputs, "flowM3s");
  const dp = toSi(appId, inputs, "pressurePa");
  const nRpm = toSi(appId, inputs, "speedRpm");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const pAir = q * dp;
  const pShaft = pAir / eta;
  const omega = (nRpm * 2 * Math.PI) / 60;
  const t = omega > 0 ? pShaft / omega : 0;

  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.25;
  r.outputSpeedRpm = nRpm;
  r.loadInertiaKgm2 = 2.5;
  r.accelTimeS = 8;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, 0.5));
  r.formulas = [
    { name: "Air power", expression: "P = Q · Δp", value: pAir, unit: "W" },
    { name: "Shaft power", expression: "P_shaft = P / η", value: pShaft, unit: "W" },
    { name: "Shaft torque", expression: "T = P_shaft / ω", value: t, unit: "N·m" },
  ];
  return finish(r);
}

function sizePump(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const q = toSi(appId, inputs, "flowM3s");
  const h = toSi(appId, inputs, "headM");
  const rho = toSi(appId, inputs, "density");
  const nRpm = toSi(appId, inputs, "speedRpm");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const sf = toSi(appId, inputs, "safetyFactor");
  const duty = toSi(appId, inputs, "dutyCycle");
  const pHyd = rho * G * q * h;
  const pShaft = pHyd / eta;
  const omega = (nRpm * 2 * Math.PI) / 60;
  const t = omega > 0 ? pShaft / omega : 0;

  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.2;
  r.outputSpeedRpm = nRpm;
  r.loadInertiaKgm2 = 1.2;
  r.accelTimeS = 5;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, 0.5));
  r.formulas = [
    { name: "Hydraulic power", expression: "P = ρ g Q H", value: pHyd, unit: "W" },
    { name: "Shaft power", expression: "P_shaft = P / η", value: pShaft, unit: "W" },
    { name: "Shaft torque", expression: "T = P_shaft / ω", value: t, unit: "N·m" },
  ];
  return finish(r);
}

export function calculateSizing(appId: ApplicationId, inputs: Inputs): SizingResult {
  switch (appId) {
    case "conveyor":
      return sizeLinearBeltLike(appId, inputs, { payload: "payloadKg", extra: "beltMassKg" }, "speedMps", "pulleyDiaM");
    case "roller-conveyor":
      return sizeLinearBeltLike(appId, inputs, { payload: "payloadKg", extra: "rollerMassKg" }, "speedMps", "rollerDiaM");
    case "crane":
      return sizeHoistLike(appId, inputs, "payloadKg", "hookSpeedMps", "drumDiaM", "falls");
    case "winch":
      return sizeHoistLike(appId, inputs, "payloadKg", "lineSpeedMps", "drumDiaM", null);
    case "ball-screw":
      return sizeScrew(appId, inputs);
    case "rack-pinion":
      return sizeRackOrGantry(appId, inputs, "pinionDiaM", true);
    case "gantry":
      return sizeRackOrGantry(appId, inputs, "pulleyDiaM", false);
    case "vertical-lift":
      return sizeVerticalLift(appId, inputs);
    case "rotary-table":
      return sizeRotary(appId, inputs);
    case "mixer":
      return sizeMixer(appId, inputs);
    case "fan":
      return sizeFan(appId, inputs);
    case "pump":
      return sizePump(appId, inputs);
    default:
      return finish(baseResult());
  }
}
