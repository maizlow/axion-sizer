export type ApplicationId =
  | "conveyor"
  | "roller-conveyor"
  | "crane"
  | "winch"
  | "ball-screw"
  | "vertical-lift"
  | "rack-pinion"
  | "rotary-table"
  | "mixer"
  | "fan"
  | "pump"
  | "gantry";

export type MotorKind = "cm3c" | "cm3p";
export type GearboxKind = "psf" | "psc" | "pxg" | "helical" | "bevel" | "direct";
export type DutyType = "S1" | "S3" | "S5";

export interface ApplicationMeta {
  id: ApplicationId;
  name: string;
  short: string;
  description: string;
  group: "linear" | "lifting" | "rotary" | "process";
}

export interface FieldDef {
  key: string;
  label: string;
  unit: string;
  metricToSi: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  hint: string;
  diagram?: string;
  visibleWhen?: { key: string; values: string[] };
}

export interface SelectFieldDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue: string;
  hint: string;
}

export interface ApplicationDef extends ApplicationMeta {
  fields: FieldDef[];
  selects: SelectFieldDef[];
}

export interface Motor {
  id: string;
  name: string;
  kind: MotorKind;
  series: "CM3C" | "CM3P";
  size: string;
  length: "S" | "M" | "L";
  ratedPowerKw: number;
  ratedSpeedRpm: number;
  contTorqueNm: number;
  peakTorqueNm: number;
  inertiaKgm2: number;
  voltageV: number;
  frame: string;
  massKg: number;
  notes: string;
}

export interface Gearbox {
  id: string;
  name: string;
  kind: GearboxKind;
  ratio: number;
  efficiency: number;
  ratedOutputNm: number;
  maxInputRpm: number;
  inertiaKgm2: number;
  backlashArcmin: number;
  massKg: number;
  family: string;
  size: string;
  motorFrames: string[];
  stages: 0 | 1 | 2;
}

export interface FormulaLine {
  name: string;
  expression: string;
  value: number;
  unit: string;
}

export interface SizingResult {
  forceN: number;
  outputTorqueNm: number;
  peakTorqueNm: number;
  loweringTorqueNm: number;
  holdingTorqueNm: number;
  rmsTorqueNm: number;
  outputSpeedRpm: number;
  outputPowerKw: number;
  peakPowerKw: number;
  loadInertiaKgm2: number;
  accelRadS2: number;
  accelTimeS: number;
  dutyCycle: number;
  safetyFactor: number;
  formulas: FormulaLine[];
  warnings: string[];
  notes: string[];
}

export interface MatchScore {
  motor: Motor;
  gearbox: Gearbox;
  outputContNm: number;
  outputPeakNm: number;
  outputSpeedRpm: number;
  utilizationCont: number;
  utilizationPeak: number;
  inertiaRatio: number;
  thermalOk: boolean;
  speedOk: boolean;
  torqueOk: boolean;
  gbOk: boolean;
  inertiaOk: boolean;
  mountOk: boolean;
  score: number;
  reasons: string[];
}

export type AccelLaw = "linear" | "sin2" | "jerk";
export type InclineDir = "accel" | "decel" | "hold";

export interface CycleSegment {
  id: string;
  inclineDir: InclineDir;
  accelLaw: AccelLaw;
  vStart: number;
  vEnd: number;
  accel: number;
  time: number;
  distanceMm: number;
  positionMm: number;
}

export interface MotionCycle {
  enabled: boolean;
  segments: CycleSegment[];
}

export type Inputs = Record<string, number | string>;
