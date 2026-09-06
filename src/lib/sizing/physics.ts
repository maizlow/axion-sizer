import { getApplication } from "./applications";
import { cycleSummary, peakAccel } from "./cycle";
import type { ApplicationId, Inputs, MotionCycle, SizingResult } from "./types";

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

function rmsFromDuty(steady: number, peak: number, accelTime: number, _speed: number, duty: number): number {
  const period = Math.max(accelTime * 2 + 1, 2);
  const cruiseTime = Math.max(0.2, period * duty - accelTime);
  const idle = Math.max(0, period - 2 * accelTime - cruiseTime);
  const sum = peak * peak * accelTime + steady * steady * cruiseTime + peak * peak * accelTime * 0.7 + 0 * idle;
  return Math.sqrt(sum / period);
}

function overlayCycle(
  r: SizingResult,
  cycle: MotionCycle | undefined,
  ctx: {
    massKg: number;
    fGrav: number;
    fFric: number;
    toTorque: (forceN: number) => number;
    vToRpm: (v: number) => number;
  },
): SizingResult {
  if (!cycle?.enabled || cycle.segments.length === 0) return r;
  const sum = cycleSummary(cycle);
  let energy = 0;
  let peakT = 0;
  let raiseT = 0;
  let lowerT = 0;
  for (const seg of cycle.segments) {
    const gravSign = seg.inclineDir === "decel" ? -1 : seg.inclineDir === "hold" ? 0 : 1;
    const a = peakAccel(seg);
    const f = gravSign * ctx.fGrav + ctx.fFric + ctx.massKg * a;
    const t = ctx.toTorque(f);
    const tAbs = Math.abs(t);
    energy += tAbs * tAbs * Math.max(seg.time, 0);
    if (tAbs > peakT) peakT = tAbs;
    if (gravSign >= 0 && tAbs > raiseT) raiseT = tAbs;
    if (gravSign < 0 && tAbs > lowerT) lowerT = tAbs;
  }
  const period = Math.max(sum.periodS, 1e-6);
  r.rmsTorqueNm = Math.sqrt(energy / period);
  r.peakTorqueNm = Math.max(r.peakTorqueNm, peakT);
  if (raiseT > 0) r.outputTorqueNm = Math.max(r.outputTorqueNm, ctx.toTorque(ctx.fGrav + ctx.fFric));
  if (lowerT > 0) r.loweringTorqueNm = Math.max(r.loweringTorqueNm, lowerT);
  r.outputSpeedRpm = ctx.vToRpm(sum.peakV);
  r.accelTimeS = cycle.segments.reduce((m, s) => (Math.abs(s.accel) > Math.abs(m.accel) ? s : m), cycle.segments[0]).time;
  r.dutyCycle = sum.duty;
  r.formulas.push({ name: "Cycle period", expression: "Σ t_i", value: sum.periodS, unit: "s" });
  r.formulas.push({ name: "Peak velocity", expression: "max |v|", value: sum.peakV, unit: "m/s" });
  r.formulas.push({ name: "Peak acceleration", expression: "max |a| including law", value: sum.peakA, unit: "m/s²" });
  r.formulas.push({ name: "Cycle travel", expression: "Σ |s_i|", value: sum.travelMm, unit: "mm" });
  r.formulas.push({ name: "RMS from cycle", expression: "√(Σ T_i² t_i / T)", value: r.rmsTorqueNm, unit: "N·m" });
  r.notes.push(`Motion cycle: ${cycle.segments.length} segments, period ${sum.periodS.toFixed(2)} s, duty ${(sum.duty * 100).toFixed(0)}%.`);
  return r;
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
  if (r.outputSpeedRpm <= 0 || r.peakTorqueNm < 0) {
    r.warnings.push("Inputs produce a non-positive speed or peak torque. Check values.");
  }
  return r;
}

function orientationTheta(inputs: Inputs, fallbackDeg: number): number {
  const o = String(inputs.orientation ?? "");
  if (o === "vertical") return Math.PI / 2;
  if (o === "horizontal") return 0;
  return (fallbackDeg * Math.PI) / 180;
}

function sizeLinearBeltLike(
  appId: ApplicationId,
  inputs: Inputs,
  massKeys: { payload: string; extra: string },
  speedKey: string,
  diaKey: string,
  cycle?: MotionCycle,
): SizingResult {
  const r = baseResult();
  const m = toSi(appId, inputs, massKeys.payload) + toSi(appId, inputs, massKeys.extra);
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
  r.loweringTorqueNm = 0;
  r.holdingTorqueNm = 0;
  r.outputSpeedRpm = v > 0 && d > 0 ? (v / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = m * radius * radius;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
  r.formulas = [
    { name: "Moving mass", expression: "m = m_payload + m_equivalent", value: m, unit: "kg" },
    { name: "Gravity component", expression: "F_g = m g sinθ", value: fGrav, unit: "N" },
    { name: "Friction", expression: "F_μ = μ m g cosθ", value: fFric, unit: "N" },
    { name: "Inertial force", expression: "F_a = m a", value: fAcc, unit: "N" },
    { name: "Steady belt pull", expression: "F = F_g + F_μ", value: fSteady, unit: "N" },
    { name: "Peak belt pull", expression: "F_pk = F + F_a", value: fPeak, unit: "N" },
    { name: "Steady torque", expression: "T = F · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = F_pk · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Pulley speed", expression: "n = v / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  overlayCycle(r, cycle, {
    massKg: m,
    fGrav,
    fFric,
    toTorque: (f) => (f * radius) / eta,
    vToRpm: (vel) => (vel > 0 && d > 0 ? (vel / (Math.PI * d)) * 60 : 0),
  });
  return finish(r);
}

function sizeHoistLike(
  appId: ApplicationId,
  inputs: Inputs,
  massKey: string,
  speedKey: string,
  diaKey: string,
  fallsKey: string | null,
  cycle?: MotionCycle,
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
  const fLower = Math.max(0, (m * G - m * a) / falls);

  r.forceN = m * G;
  r.outputTorqueNm = (fSteady * radius) / eta;
  r.peakTorqueNm = (fPeak * radius) / eta;
  r.loweringTorqueNm = (fLower * radius) / eta;
  r.holdingTorqueNm = r.outputTorqueNm;
  r.outputSpeedRpm = d > 0 ? ((v * falls) / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = (m / (falls * falls)) * radius * radius;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
  r.formulas = [
    { name: "Hook force", expression: "F = m g", value: m * G, unit: "N" },
    { name: "Force at drum", expression: "F_d = m g / falls", value: fSteady, unit: "N" },
    { name: "Raise torque", expression: "T↑ = F_d · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak raise", expression: "T_pk = ((m g + m a) / falls) · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = ((m g − m a) / falls) · r / η", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Holding torque", expression: "T_hold = T↑", value: r.holdingTorqueNm, unit: "N·m" },
    { name: "Drum speed", expression: "n = (v · falls) / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  r.warnings.push("Specify a holding brake at least equal to holding torque × safety factor.");
  overlayCycle(r, cycle, {
    massKg: m / falls,
    fGrav: fSteady,
    fFric: 0,
    toTorque: (f) => (f * radius) / eta,
    vToRpm: (vel) => (d > 0 ? ((vel * falls) / (Math.PI * d)) * 60 : 0),
  });
  return finish(r);
}

function sizeScrew(appId: ApplicationId, inputs: Inputs, cycle?: MotionCycle): SizingResult {
  const r = baseResult();
  const mPay = toSi(appId, inputs, "payloadKg");
  const mCw = Math.max(0, toSi(appId, inputs, "counterweightKg"));
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
  const mInert = mPay + mCw;
  const fGrav = (mPay - mCw) * G * Math.sin(theta);
  const fFric = mu * mInert * G * Math.cos(theta) + preload;
  const fAcc = mInert * a;
  const fRaise = fGrav + fFric;
  const fRaisePk = fRaise + fAcc;
  const fLowerCruise = fGrav - fFric;
  const fLowerDecel = fGrav - fFric + fAcc;

  const toT = (f: number) => (f * lead) / (2 * Math.PI * eta);
  r.forceN = fRaise;
  r.outputTorqueNm = toT(fRaise);
  r.peakTorqueNm = Math.max(toT(fRaisePk), toT(Math.abs(fLowerDecel)));
  r.loweringTorqueNm = toT(Math.abs(fLowerCruise));
  r.holdingTorqueNm = (Math.abs(fGrav) * lead) / (2 * Math.PI * Math.max(eta, 0.3));
  r.outputSpeedRpm = lead > 0 ? (v / lead) * 60 : 0;
  r.loadInertiaKgm2 = lead > 0 ? mInert * (lead / (2 * Math.PI)) ** 2 : 0;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
  r.formulas = [
    { name: "Unbalanced mass", expression: "m_u = m_pay − m_cw", value: mPay - mCw, unit: "kg" },
    { name: "Inertia mass", expression: "m_j = m_pay + m_cw", value: mInert, unit: "kg" },
    { name: "Gravity force", expression: "F_g = m_u g sinθ", value: fGrav, unit: "N" },
    { name: "Friction + drag", expression: "F_μ = μ m_j g cosθ + F_pre", value: fFric, unit: "N" },
    { name: "Raise force", expression: "F↑ = F_g + F_μ", value: fRaise, unit: "N" },
    { name: "Peak raise", expression: "F↑_pk = F↑ + m_j a", value: fRaisePk, unit: "N" },
    { name: "Lower cruise", expression: "F↓ = F_g − F_μ", value: fLowerCruise, unit: "N" },
    { name: "Lower stop", expression: "F↓_pk = F↓ + m_j a", value: fLowerDecel, unit: "N" },
    { name: "Raise torque", expression: "T↑ = F↑ · lead / (2π η)", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk from raise accel or lower stop", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = |F↓| · lead / (2π η)", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Holding torque", expression: "T_hold = |F_g| · lead / (2π η)", value: r.holdingTorqueNm, unit: "N·m" },
    { name: "Screw speed", expression: "n = v / lead · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  if (theta > 0.4) {
    r.warnings.push("Vertical / inclined axis: size a holding brake for holding torque × safety factor.");
  }
  if (eta >= 0.8 && theta > 1.2) {
    r.warnings.push("Ball screws back-drive. Do not rely on the screw to hold the load.");
  }
  if (theta > 1.2) {
    r.notes.push("Lowering is gravity-assisted. Check regenerative energy on the inverter.");
  }
  if (mCw > 0) r.notes.push("Counterweight cuts gravity torque but adds inertia on raise and lower.");
  overlayCycle(r, cycle, {
    massKg: mInert,
    fGrav,
    fFric,
    toTorque: (f) => (f * lead) / (2 * Math.PI * eta),
    vToRpm: (vel) => (lead > 0 ? (vel / lead) * 60 : 0),
  });
  return finish(r);
}

function sizeRackOrGantry(
  appId: ApplicationId,
  inputs: Inputs,
  diaKey: string,
  incline: boolean,
  cycle?: MotionCycle,
): SizingResult {
  const r = baseResult();
  const mPay = toSi(appId, inputs, "payloadKg");
  const mCw = Math.max(0, toSi(appId, inputs, "counterweightKg"));
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
  const mInert = mPay + mCw;
  const fGrav = (mPay - mCw) * G * Math.sin(theta);
  const fFric = mu * mInert * G * Math.cos(theta);
  const fAcc = mInert * a;
  const fRaise = fGrav + fFric;
  const fRaisePk = fRaise + fAcc;
  const fLowerCruise = fGrav - fFric;
  const fLowerDecel = fGrav - fFric + fAcc;

  r.forceN = fRaise;
  r.outputTorqueNm = (fRaise * radius) / eta;
  r.peakTorqueNm = Math.max((fRaisePk * radius) / eta, (Math.abs(fLowerDecel) * radius) / eta);
  r.loweringTorqueNm = (Math.abs(fLowerCruise) * radius) / eta;
  r.holdingTorqueNm = (Math.abs(fGrav) * radius) / Math.max(eta, 0.3);
  r.outputSpeedRpm = d > 0 ? (v / (Math.PI * d)) * 60 : 0;
  r.loadInertiaKgm2 = mInert * radius * radius;
  r.accelTimeS = tAcc;
  r.dutyCycle = duty;
  r.safetyFactor = sf;
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
  r.formulas = [
    { name: "Unbalanced mass", expression: "m_u = m_pay − m_cw", value: mPay - mCw, unit: "kg" },
    { name: "Raise force", expression: "F↑ = m_u g sinθ + μ m_j g cosθ", value: fRaise, unit: "N" },
    { name: "Peak raise", expression: "F↑_pk = F↑ + m_j a", value: fRaisePk, unit: "N" },
    { name: "Lower cruise", expression: "F↓ = m_u g sinθ − μ m_j g cosθ", value: fLowerCruise, unit: "N" },
    { name: "Lower stop", expression: "F↓_pk = F↓ + m_j a", value: fLowerDecel, unit: "N" },
    { name: "Raise torque", expression: "T↑ = F↑ · r / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = max(F↑_pk, |F↓_pk|) · r / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "Lower torque", expression: "T↓ = |F↓| · r / η", value: r.loweringTorqueNm, unit: "N·m" },
    { name: "Holding torque", expression: "T_hold = |F_g| · r / η", value: r.holdingTorqueNm, unit: "N·m" },
    { name: "Speed", expression: "n = v / (π D) · 60", value: r.outputSpeedRpm, unit: "rpm" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  if (theta > 0.4) {
    r.warnings.push("Vertical / inclined axis: size a holding brake for holding torque × safety factor.");
    r.notes.push("Lowering is gravity-assisted. Check regenerative energy on the inverter.");
  }
  overlayCycle(r, cycle, {
    massKg: mInert,
    fGrav,
    fFric,
    toTorque: (f) => (f * radius) / eta,
    vToRpm: (vel) => (d > 0 ? (vel / (Math.PI * d)) * 60 : 0),
  });
  return finish(r);
}

function sizeVerticalLift(appId: ApplicationId, inputs: Inputs, cycle?: MotionCycle): SizingResult {
  const mechanism = String(inputs.mechanism ?? "ball-screw");
  if (mechanism === "ball-screw") {
    return sizeScrew(appId, { ...inputs, orientation: "vertical", inclineDeg: 90 }, cycle);
  }
  const diaKey = mechanism === "rack" ? "pinionDiaM" : "pulleyDiaM";
  return sizeRackOrGantry(appId, { ...inputs, orientation: "vertical", inclineDeg: 90 }, diaKey, true, cycle);
}

function sizeRotary(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const j = toSi(appId, inputs, "tableInertia") + toSi(appId, inputs, "payloadInertia");
  const n = toSi(appId, inputs, "speedRpm");
  const tFric = toSi(appId, inputs, "fricTorqueNm");
  const tUnb = toSi(appId, inputs, "unbalanceNm");
  const tAcc = toSi(appId, inputs, "accelTimeS");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const omega = (n * 2 * Math.PI) / 60;
  const alpha = omega / Math.max(tAcc, 0.05);
  const tInert = j * alpha;
  r.outputTorqueNm = (tFric + tUnb) / eta;
  r.peakTorqueNm = (tInert + tFric + tUnb) / eta;
  r.outputSpeedRpm = n;
  r.loadInertiaKgm2 = j;
  r.accelTimeS = tAcc;
  r.dutyCycle = toSi(appId, inputs, "dutyCycle");
  r.safetyFactor = toSi(appId, inputs, "safetyFactor");
  r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, n, r.dutyCycle);
  r.formulas = [
    { name: "Total inertia", expression: "J = J_table + J_payload", value: j, unit: "kg·m²" },
    { name: "Inertial torque", expression: "T_j = J α", value: tInert, unit: "N·m" },
    { name: "Steady torque", expression: "T = (T_fric + T_unb) / η", value: r.outputTorqueNm, unit: "N·m" },
    { name: "Peak torque", expression: "T_pk = (T_j + T_fric + T_unb) / η", value: r.peakTorqueNm, unit: "N·m" },
    { name: "RMS torque", expression: "T_rms from duty cycle", value: r.rmsTorqueNm, unit: "N·m" },
  ];
  return finish(r);
}

function sizeMixer(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const rho = toSi(appId, inputs, "density");
  const d = toSi(appId, inputs, "impellerDiaM");
  const nRpm = toSi(appId, inputs, "speedRpm");
  const np = toSi(appId, inputs, "powerNumber");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const n = nRpm / 60;
  const pHyd = np * rho * n ** 3 * d ** 5;
  const pShaft = (pHyd * toSi(appId, inputs, "serviceFactor")) / eta;
  const omega = 2 * Math.PI * n;
  const t = omega > 0 ? pShaft / omega : 0;
  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.4;
  r.outputSpeedRpm = nRpm;
  r.dutyCycle = toSi(appId, inputs, "dutyCycle");
  r.safetyFactor = toSi(appId, inputs, "safetyFactor");
  r.rmsTorqueNm = t * Math.sqrt(Math.max(r.dutyCycle, 0.2));
  r.formulas = [
    { name: "Hydraulic power", expression: "P = Np ρ N³ D⁵", value: pHyd, unit: "W" },
    { name: "Shaft torque", expression: "T = P_shaft / ω", value: t, unit: "N·m" },
  ];
  return finish(r);
}

function sizeFan(appId: ApplicationId, inputs: Inputs): SizingResult {
  const r = baseResult();
  const q = toSi(appId, inputs, "flowM3s");
  const dp = toSi(appId, inputs, "pressurePa");
  const nRpm = toSi(appId, inputs, "speedRpm");
  const eta = Math.max(0.2, toSi(appId, inputs, "efficiency"));
  const pShaft = (q * dp) / eta;
  const omega = (nRpm * 2 * Math.PI) / 60;
  const t = omega > 0 ? pShaft / omega : 0;
  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.25;
  r.outputSpeedRpm = nRpm;
  r.dutyCycle = toSi(appId, inputs, "dutyCycle");
  r.safetyFactor = toSi(appId, inputs, "safetyFactor");
  r.rmsTorqueNm = t * Math.sqrt(Math.max(r.dutyCycle, 0.5));
  r.formulas = [
    { name: "Air power", expression: "P = Q · Δp", value: q * dp, unit: "W" },
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
  const pHyd = rho * G * q * h;
  const omega = (nRpm * 2 * Math.PI) / 60;
  const t = omega > 0 ? pHyd / eta / omega : 0;
  r.outputTorqueNm = t;
  r.peakTorqueNm = t * 1.2;
  r.outputSpeedRpm = nRpm;
  r.dutyCycle = toSi(appId, inputs, "dutyCycle");
  r.safetyFactor = toSi(appId, inputs, "safetyFactor");
  r.rmsTorqueNm = t * Math.sqrt(Math.max(r.dutyCycle, 0.5));
  r.formulas = [
    { name: "Hydraulic power", expression: "P = ρ g Q H", value: pHyd, unit: "W" },
    { name: "Shaft torque", expression: "T = P_shaft / ω", value: t, unit: "N·m" },
  ];
  return finish(r);
}

export function calculateSizing(appId: ApplicationId, inputs: Inputs, cycle?: MotionCycle): SizingResult {
  switch (appId) {
    case "conveyor":
      return sizeLinearBeltLike(appId, inputs, { payload: "payloadKg", extra: "beltMassKg" }, "speedMps", "pulleyDiaM", cycle);
    case "roller-conveyor":
      return sizeLinearBeltLike(appId, inputs, { payload: "payloadKg", extra: "rollerMassKg" }, "speedMps", "rollerDiaM", cycle);
    case "crane":
      return sizeHoistLike(appId, inputs, "payloadKg", "hookSpeedMps", "drumDiaM", "falls", cycle);
    case "winch":
      return sizeHoistLike(appId, inputs, "payloadKg", "lineSpeedMps", "drumDiaM", null, cycle);
    case "ball-screw":
      return sizeScrew(appId, inputs, cycle);
    case "rack-pinion":
      return sizeRackOrGantry(appId, inputs, "pinionDiaM", true, cycle);
    case "gantry":
      return sizeRackOrGantry(appId, inputs, "pulleyDiaM", false, cycle);
    case "vertical-lift":
      return sizeVerticalLift(appId, inputs, cycle);
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
