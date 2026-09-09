export const SIEVE_MM = [0.062, 0.125, 0.25, 0.5, 1, 2, 4, 4.75, 5.6, 9.52] as const;

export type EnvelopeRow = { mm: number; min: number; max: number };

export const DEFAULT_ENVELOPE: EnvelopeRow[] = [
  { mm: 0.062, min: 0, max: 2 },
  { mm: 0.125, min: 3, max: 11 },
  { mm: 0.25, min: 15, max: 23 },
  { mm: 0.5, min: 33, max: 42 },
  { mm: 1, min: 63, max: 75 },
  { mm: 2, min: 86, max: 95 },
  { mm: 4, min: 92, max: 100 },
];

export const H_MIN = 707;
export const H_MAX = 778;

export interface SandSource {
  id: string;
  name: string;
  onSite: boolean;
  /** Residue grams: pan first, then each sieve in SIEVE_MM order. */
  residueG: number[];
  blendPct: number;
  moisturePct: number;
  sampledAt: string;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyResidues(): number[] {
  return [0, ...SIEVE_MM.map(() => 0)];
}

export function analyze(residueG: number[]): { total: number; retPct: number[]; passPct: number[] } {
  const total = residueG.reduce((s, n) => s + (Number(n) || 0), 0);
  const retPct = residueG.map((n) => (total > 0 ? ((Number(n) || 0) / total) * 100 : 0));
  const passPct: number[] = [];
  let finer = 0;
  for (let i = 0; i < residueG.length; i++) {
    const p = total > 0 ? (finer / total) * 100 : 0;
    passPct.push(p);
    finer += Number(residueG[i]) || 0;
  }
  return { total, retPct, passPct };
}

/** Pass % on SIEVE_MM[k] is passPct[k+1] (index 0 is the pan). */
export function passOnSieve(passPct: number[], sieveIndex: number): number {
  return passPct[sieveIndex + 1] ?? 100;
}

export function hValue(passPct: number[]): number {
  let sum = 0;
  for (let i = 0; i < SIEVE_MM.length; i++) sum += passOnSieve(passPct, i);
  return 100 + sum;
}

export function mixResidues(sands: SandSource[]): number[] {
  const active = sands.filter((s) => s.onSite);
  const n = 1 + SIEVE_MM.length;
  const out = Array.from({ length: n }, () => 0);
  for (const s of active) {
    const w = (Number(s.blendPct) || 0) / 100;
    for (let i = 0; i < n; i++) out[i] += w * (Number(s.residueG[i]) || 0);
  }
  return out;
}

export function envelopeStatus(
  passPct: number[],
  envelope: EnvelopeRow[] = DEFAULT_ENVELOPE,
): { mm: number; pass: number; min: number; max: number; ok: boolean }[] {
  return envelope.map((e) => {
    const idx = SIEVE_MM.indexOf(e.mm as (typeof SIEVE_MM)[number]);
    const pass = passOnSieve(passPct, idx);
    return { mm: e.mm, pass, min: e.min, max: e.max, ok: pass >= e.min - 1e-9 && pass <= e.max + 1e-9 };
  });
}

export const SAMPLE_SANDS: SandSource[] = [
  {
    id: "s03",
    name: "Sand 1",
    onSite: true,
    blendPct: 25,
    moisturePct: 0,
    sampledAt: todayIso(),
    residueG: [60, 349, 77, 101, 172, 348, 238, 0, 0, 0, 0],
  },
  {
    id: "s04",
    name: "Sand 2",
    onSite: true,
    blendPct: 75,
    moisturePct: 0,
    sampledAt: todayIso(),
    residueG: [3, 8, 49, 254, 246, 255, 206, 28, 0, 0, 0],
  },
  {
    id: "s02",
    name: "Sand 3",
    onSite: false,
    blendPct: 0,
    moisturePct: 0,
    sampledAt: todayIso(),
    residueG: [5, 79, 124, 172, 242, 309, 63, 8, 0, 0, 0],
  },
];
