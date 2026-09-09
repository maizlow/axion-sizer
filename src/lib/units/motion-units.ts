export interface UnitDef {
  id: string;
  label: string;
  toSi: number;
}

export interface UnitFamily {
  id: string;
  si: string;
  units: UnitDef[];
}

export const FAMILIES: UnitFamily[] = [
  {
    id: "length",
    si: "m",
    units: [
      { id: "mm", label: "mm", toSi: 0.001 },
      { id: "m", label: "m", toSi: 1 },
      { id: "in", label: "in", toSi: 0.0254 },
      { id: "ft", label: "ft", toSi: 0.3048 },
    ],
  },
  {
    id: "linSpeed",
    si: "m/s",
    units: [
      { id: "mm_s", label: "mm/s", toSi: 0.001 },
      { id: "m_s", label: "m/s", toSi: 1 },
      { id: "m_min", label: "m/min", toSi: 1 / 60 },
      { id: "ft_min", label: "ft/min", toSi: 0.3048 / 60 },
      { id: "in_s", label: "in/s", toSi: 0.0254 },
    ],
  },
  {
    id: "angle",
    si: "rad",
    units: [
      { id: "deg", label: "deg", toSi: Math.PI / 180 },
      { id: "rad", label: "rad", toSi: 1 },
      { id: "rev", label: "rev", toSi: 2 * Math.PI },
    ],
  },
  {
    id: "angSpeed",
    si: "rad/s",
    units: [
      { id: "rpm", label: "rpm", toSi: (2 * Math.PI) / 60 },
      { id: "rps", label: "1/s", toSi: 2 * Math.PI },
      { id: "rad_s", label: "rad/s", toSi: 1 },
      { id: "deg_s", label: "deg/s", toSi: Math.PI / 180 },
    ],
  },
  {
    id: "torque",
    si: "N·m",
    units: [
      { id: "Nm", label: "N·m", toSi: 1 },
      { id: "Ncm", label: "N·cm", toSi: 0.01 },
      { id: "lbft", label: "lb·ft", toSi: 1.355817948 },
      { id: "lbin", label: "lb·in", toSi: 0.112984829 },
    ],
  },
  {
    id: "force",
    si: "N",
    units: [
      { id: "N", label: "N", toSi: 1 },
      { id: "kN", label: "kN", toSi: 1000 },
      { id: "kgf", label: "kgf", toSi: 9.80665 },
      { id: "lbf", label: "lbf", toSi: 4.448221615 },
    ],
  },
  {
    id: "inertia",
    si: "kg·m²",
    units: [
      { id: "kgm2", label: "kg·m²", toSi: 1 },
      { id: "kgcm2", label: "kg·cm²", toSi: 1e-4 },
      { id: "gcm2", label: "g·cm²", toSi: 1e-7 },
      { id: "lbin2", label: "lb·in²", toSi: 0.000292639653 },
    ],
  },
];

export function convert(family: UnitFamily, value: number, fromId: string, toId: string): number {
  const from = family.units.find((u) => u.id === fromId);
  const to = family.units.find((u) => u.id === toId);
  if (!from || !to) return NaN;
  return (value * from.toSi) / to.toSi;
}

export type MechKind = "screw" | "pulley" | "rack";

export function travelPerRevMm(kind: MechKind, dimMm: number): number {
  if (kind === "screw") return dimMm;
  if (kind === "pulley") return Math.PI * dimMm;
  return Math.PI * dimMm;
}

export function encoderScale(opts: {
  ppr: number;
  ratio: number;
  kind: MechKind;
  dimMm: number;
}): {
  mmPerPulse: number;
  pulsesPerMm: number;
  mmPerMotorRev: number;
  mmPerLoadRev: number;
} {
  const ppr = Math.max(opts.ppr, 1e-9);
  const i = Math.max(opts.ratio, 1e-9);
  const mmLoadRev = travelPerRevMm(opts.kind, opts.dimMm);
  const mmMotorRev = mmLoadRev / i;
  const mmPerPulse = mmMotorRev / ppr;
  return {
    mmPerPulse,
    pulsesPerMm: mmPerPulse !== 0 ? 1 / mmPerPulse : 0,
    mmPerMotorRev: mmMotorRev,
    mmPerLoadRev: mmLoadRev,
  };
}

export function fmt(n: number, digits = 6): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a === 0) return "0";
  if (a >= 1000) return n.toFixed(2);
  if (a >= 1) return n.toPrecision(6).replace(/\.?0+$/, "");
  if (a >= 1e-4) return n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return n.toExponential(4);
}

export type AngUnit = "deg" | "rad" | "rev";
export type ShaftSpeedUnit = "rpm" | "rps" | "deg_s" | "rad_s";

export function revsToAng(revs: number, u: AngUnit): number {
  if (u === "deg") return revs * 360;
  if (u === "rad") return revs * 2 * Math.PI;
  return revs;
}

export function angToRevs(ang: number, u: AngUnit): number {
  if (u === "deg") return ang / 360;
  if (u === "rad") return ang / (2 * Math.PI);
  return ang;
}

export function rpmFrom(v: number, u: ShaftSpeedUnit): number {
  if (u === "rps") return v * 60;
  if (u === "deg_s") return v / 6;
  if (u === "rad_s") return (v * 60) / (2 * Math.PI);
  return v;
}

export function rpmTo(rpm: number, u: ShaftSpeedUnit): number {
  if (u === "rps") return rpm / 60;
  if (u === "deg_s") return rpm * 6;
  if (u === "rad_s") return (rpm * 2 * Math.PI) / 60;
  return rpm;
}

export function shaftSpeedLabel(u: ShaftSpeedUnit): string {
  if (u === "rps") return "1/s";
  if (u === "deg_s") return "deg/s";
  if (u === "rad_s") return "rad/s";
  return "rpm";
}
