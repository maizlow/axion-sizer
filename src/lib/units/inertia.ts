export type InertiaKind =
  | "point"
  | "cylAxis"
  | "cylHollow"
  | "ring"
  | "sphere"
  | "plate"
  | "rod"
  | "rodEnd"
  | "linPulley"
  | "linScrew";

export type InertiaField = "m" | "r" | "Di" | "Do" | "a" | "b" | "L" | "lead";

export type InertiaGroup = "body" | "linear";

export interface InertiaBody {
  id: InertiaKind;
  group: InertiaGroup;
  fields: InertiaField[];
  /** Display formula in SI symbols used on the sketch. */
  formula: string;
}

export const INERTIA_BODIES: InertiaBody[] = [
  { id: "point", group: "body", fields: ["m", "r"], formula: "J = m r²" },
  { id: "cylAxis", group: "body", fields: ["m", "Do"], formula: "J = ⅛ m D²" },
  { id: "cylHollow", group: "body", fields: ["m", "Do", "Di"], formula: "J = ⅛ m (Dₒ² + Dᵢ²)" },
  { id: "ring", group: "body", fields: ["m", "Do"], formula: "J = ¼ m D²" },
  { id: "sphere", group: "body", fields: ["m", "Do"], formula: "J = ⅒ m D²" },
  { id: "plate", group: "body", fields: ["m", "a", "b"], formula: "J = m (a² + b²) / 12" },
  { id: "rod", group: "body", fields: ["m", "L"], formula: "J = m L² / 12" },
  { id: "rodEnd", group: "body", fields: ["m", "L"], formula: "J = m L² / 3" },
  { id: "linPulley", group: "linear", fields: ["m", "Do"], formula: "J = m (D/2)²" },
  { id: "linScrew", group: "linear", fields: ["m", "lead"], formula: "J = m (P / 2π)²" },
];

export function getInertiaBody(id: InertiaKind): InertiaBody {
  return INERTIA_BODIES.find((b) => b.id === id) ?? INERTIA_BODIES[0];
}

/** Lengths in metres, mass in kg. Result kg·m² about the drawn axis through the CM (or end, for rodEnd). */
export function inertiaAboutCm(
  kind: InertiaKind,
  p: Partial<Record<InertiaField, number>>,
): number {
  const m = Math.max(0, p.m ?? 0);
  const r = Math.max(0, p.r ?? 0);
  const Do = Math.max(0, p.Do ?? 0);
  const Di = Math.max(0, Math.min(p.Di ?? 0, Do));
  const a = Math.max(0, p.a ?? 0);
  const b = Math.max(0, p.b ?? 0);
  const L = Math.max(0, p.L ?? 0);
  const lead = Math.max(0, p.lead ?? 0);
  switch (kind) {
    case "point":
      return m * r * r;
    case "cylAxis":
      return (m * Do * Do) / 8;
    case "cylHollow":
      return (m * (Do * Do + Di * Di)) / 8;
    case "ring":
      return (m * Do * Do) / 4;
    case "sphere":
      return (m * Do * Do) / 10;
    case "plate":
      return (m * (a * a + b * b)) / 12;
    case "rod":
      return (m * L * L) / 12;
    case "rodEnd":
      return (m * L * L) / 3;
    case "linPulley":
      return m * (Do / 2) * (Do / 2);
    case "linScrew":
      return m * (lead / (2 * Math.PI)) ** 2;
    default:
      return 0;
  }
}

/** Steiner: J = J_cm + m d². d in metres. */
export function withOffset(jCm: number, mKg: number, dM: number): number {
  const d = Math.max(0, dM);
  return jCm + Math.max(0, mKg) * d * d;
}

export function referToMotor(jLoad: number, ratio: number): number {
  const i = Math.max(ratio, 1e-12);
  return jLoad / (i * i);
}

export const INERTIA_OUT = [
  { id: "kgm2", label: "kg·m²", fromSi: 1 },
  { id: "kgcm2", label: "kg·cm²", fromSi: 1e4 },
  { id: "gcm2", label: "g·cm²", fromSi: 1e7 },
] as const;
