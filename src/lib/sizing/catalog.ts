import type { Gearbox, Inverter, Motor } from "./types";

/** SEW-EURODRIVE published CM3C standstill data. Jmot is ×10⁻⁴ kg·m². */
const CM3C_ROWS = [
  { size: "63", length: "S" as const, m0: 2.7, mpk: 8.1, mass: 3.16, jE4: 1.3, n: 3000 },
  { size: "63", length: "M" as const, m0: 4.9, mpk: 14.7, mass: 4.51, jE4: 2.5, n: 4500 },
  { size: "63", length: "L" as const, m0: 6.4, mpk: 19.2, mass: 5.85, jE4: 3.6, n: 6000 },
  { size: "71", length: "S" as const, m0: 6.5, mpk: 19.5, mass: 6.42, jE4: 7.4, n: 2000 },
  { size: "71", length: "M" as const, m0: 9.5, mpk: 28.5, mass: 7.87, jE4: 10.7, n: 3000 },
  { size: "71", length: "L" as const, m0: 14, mpk: 42, mass: 10.7, jE4: 17.1, n: 4500 },
  { size: "80", length: "S" as const, m0: 10.5, mpk: 31.5, mass: 10.6, jE4: 17.6, n: 2000 },
  { size: "80", length: "M" as const, m0: 15.6, mpk: 46.8, mass: 13, jE4: 25.2, n: 3000 },
  { size: "80", length: "L" as const, m0: 22.8, mpk: 68.4, mass: 18, jE4: 40.6, n: 4500 },
  { size: "100", length: "S" as const, m0: 19, mpk: 57, mass: 16.5, jE4: 40, n: 2000 },
  { size: "100", length: "M" as const, m0: 26.8, mpk: 80.4, mass: 20.2, jE4: 57.3, n: 3000 },
  { size: "100", length: "L" as const, m0: 40, mpk: 120, mass: 27.7, jE4: 92.1, n: 4500 },
];

const CM3P_ROWS = [
  { size: "71", length: "S" as const, m0: 7.9, mpk: 20, mass: 6.4, jE4: 2.7, n: 2000 },
  { size: "71", length: "M" as const, m0: 10.1, mpk: 31, mass: 7.9, jE4: 3.7, n: 3000 },
  { size: "71", length: "L" as const, m0: 15.4, mpk: 52, mass: 10.7, jE4: 5.8, n: 4500 },
  { size: "80", length: "S" as const, m0: 17.2, mpk: 41, mass: 10.6, jE4: 7.5, n: 2000 },
  { size: "80", length: "M" as const, m0: 22, mpk: 60, mass: 13, jE4: 10, n: 3000 },
  { size: "80", length: "L" as const, m0: 31, mpk: 99, mass: 18, jE4: 14.7, n: 4500 },
  { size: "100", length: "S" as const, m0: 26, mpk: 70, mass: 16.5, jE4: 15.2, n: 2000 },
  { size: "100", length: "M" as const, m0: 36, mpk: 100, mass: 20.2, jE4: 20.7, n: 3000 },
  { size: "100", length: "L" as const, m0: 47, mpk: 163, mass: 27.7, jE4: 30.1, n: 4500 },
];

function motorPowerKw(m0: number, rpm: number): number {
  return (m0 * rpm * 2 * Math.PI) / 60 / 1000;
}

export const MOTORS: Motor[] = [
  ...CM3C_ROWS.map((row) => ({
    id: `cm3c-${row.size}${row.length}-${row.n}`,
    name: `CM3C${row.size}${row.length}`,
    kind: "cm3c" as const,
    series: "CM3C" as const,
    size: row.size,
    length: row.length,
    ratedPowerKw: Number(motorPowerKw(row.m0, row.n).toFixed(2)),
    ratedSpeedRpm: row.n,
    contTorqueNm: row.m0,
    peakTorqueNm: row.mpk,
    inertiaKgm2: row.jE4 * 1e-4,
    voltageV: 400,
    frame: row.size,
    massKg: row.mass,
    notes: `SEW-EURODRIVE CM3C medium-inertia, ${row.n} min⁻¹. M0 ${row.m0} N·m, Mpk ${row.mpk} N·m.`,
  })),
  ...CM3P_ROWS.map((row) => ({
    id: `cm3p-${row.size}${row.length}-${row.n}`,
    name: `CM3P${row.size}${row.length}`,
    kind: "cm3p" as const,
    series: "CM3P" as const,
    size: row.size,
    length: row.length,
    ratedPowerKw: Number(motorPowerKw(row.m0, row.n).toFixed(2)),
    ratedSpeedRpm: row.n,
    contTorqueNm: row.m0,
    peakTorqueNm: row.mpk,
    inertiaKgm2: row.jE4 * 1e-4,
    voltageV: 400,
    frame: row.size,
    massKg: row.mass,
    notes: `SEW-EURODRIVE CM3P high-dynamic, ${row.n} min⁻¹. M0 ${row.m0} N·m, Mpk ${row.mpk} N·m.`,
  })),
];

const PSF_SIZES = [
  { size: "121", t: 25, nMax: 6000, back: 8, mass: 1.8, frames: ["63", "71"] },
  { size: "221", t: 55, nMax: 6000, back: 6, mass: 3.2, frames: ["63", "71", "80"] },
  { size: "321", t: 110, nMax: 5500, back: 5, mass: 5.4, frames: ["71", "80", "100"] },
  { size: "521", t: 300, nMax: 4500, back: 4, mass: 9.5, frames: ["80", "100"] },
  { size: "621", t: 600, nMax: 4000, back: 4, mass: 16, frames: ["80", "100"] },
  { size: "721", t: 1000, nMax: 3500, back: 4, mass: 28, frames: ["100"] },
  { size: "821", t: 1750, nMax: 3000, back: 4, mass: 45, frames: ["100"] },
  { size: "921", t: 3000, nMax: 2500, back: 4, mass: 72, frames: ["100"] },
];
/** Official PS.F coaxial published i set (PSF121 table; same ladder used across sizes). */
const PSF_I1 = [3, 4, 5, 7, 10];
const PSF_I2 = [16, 20, 25, 28, 35, 40, 49, 70, 100];

const PSC_SIZES = [
  { size: "221", t: 30, nMax: 6000, back: 10, mass: 2.4, frames: ["63", "71"] },
  { size: "321", t: 65, nMax: 5500, back: 10, mass: 4.1, frames: ["71", "80"] },
  { size: "521", t: 160, nMax: 4500, back: 10, mass: 7.8, frames: ["80", "100"] },
  { size: "621", t: 320, nMax: 4000, back: 10, mass: 13, frames: ["100"] },
];
const PSC_I1 = [3, 5, 7, 10];
const PSC_I2 = [15, 21, 25, 30, 35, 49, 50, 70, 100];

const PXG_SIZES = [
  { size: "21", t: 66, nMax: 6000, back: 3, mass: 2.1, frames: ["63", "71"] },
  { size: "31", t: 200, nMax: 5500, back: 3, mass: 4.8, frames: ["71", "80"] },
  { size: "41", t: 600, nMax: 4500, back: 3, mass: 9.2, frames: ["80", "100"] },
  { size: "51", t: 1500, nMax: 3500, back: 3, mass: 18, frames: ["100"] },
  { size: "53", t: 4200, nMax: 3000, back: 3, mass: 38, frames: ["100"] },
];
const PXG_I1 = [3, 4, 5, 7, 8, 10];
const PXG_I2 = [12, 16, 20, 25, 32, 40, 50, 64, 100];

const R_SIZES = [
  { size: "R27", t: 130, nMax: 3600, mass: 10, frames: ["63", "71"] },
  { size: "R37", t: 200, nMax: 3600, mass: 14, frames: ["63", "71", "80"] },
  { size: "R47", t: 400, nMax: 3600, mass: 22, frames: ["71", "80"] },
  { size: "R57", t: 450, nMax: 3600, mass: 32, frames: ["71", "80", "100"] },
  { size: "R67", t: 600, nMax: 3600, mass: 46, frames: ["80", "100"] },
  { size: "R77", t: 820, nMax: 3000, mass: 68, frames: ["80", "100"] },
  { size: "R87", t: 1550, nMax: 3000, mass: 105, frames: ["100"] },
];
/** Representative SEW R two-/three-stage iN ladder. The full catalog is 3.21–289.74 with many exact values. */
const R_I = [
  4.29, 5.01, 5.89, 6.8, 8.04, 9.35, 10.83, 12.63, 14.73, 17.23, 20.09, 23.42, 27.27, 31.77, 37,
  43.05, 50.2, 58.38, 68.09, 79.22, 92.7, 107.72, 125.57,
];

const K_SIZES = [
  { size: "K37", t: 200, nMax: 3600, mass: 16, frames: ["63", "71", "80"] },
  { size: "K47", t: 400, nMax: 3600, mass: 24, frames: ["71", "80"] },
  { size: "K57", t: 600, nMax: 3600, mass: 36, frames: ["71", "80", "100"] },
  { size: "K67", t: 830, nMax: 3000, mass: 52, frames: ["80", "100"] },
  { size: "K77", t: 1500, nMax: 3000, mass: 78, frames: ["80", "100"] },
  { size: "K87", t: 2000, nMax: 2500, mass: 120, frames: ["100"] },
];
const K_I = [6.57, 8.23, 10.27, 12.86, 16.31, 20.48, 25.56, 32.18, 40.14, 50.24, 63.09, 78.73, 98.23, 122.5];

function expand(
  kind: Gearbox["kind"],
  family: string,
  sizes: { size: string; t: number; nMax: number; back?: number; mass: number; frames: string[] }[],
  ratios: number[],
  eta1: number,
  eta2: number,
): Gearbox[] {
  const out: Gearbox[] = [];
  for (const s of sizes) {
    for (const ratio of ratios) {
      const twoStage = ratio > 11.5;
      out.push({
        id: `${kind}-${s.size}-${ratio}`,
        name: `${family.split(" ")[0]} ${s.size}  i=${ratio}`,
        kind,
        ratio,
        efficiency: twoStage ? eta2 : eta1,
        ratedOutputNm: s.t,
        maxInputRpm: s.nMax,
        inertiaKgm2: 0.00012 * Math.sqrt(ratio) * (s.t / 200),
        backlashArcmin: s.back ?? (kind === "helical" ? 12 : 10),
        massKg: s.mass * (twoStage ? 1.15 : 1),
        family,
        size: s.size,
        motorFrames: s.frames,
        stages: twoStage ? 2 : 1,
      });
    }
  }
  return out;
}

export const GEARBOXES: Gearbox[] = [
  {
    id: "direct",
    name: "Direct drive",
    kind: "direct",
    ratio: 1,
    efficiency: 1,
    ratedOutputNm: 20000,
    maxInputRpm: 6000,
    inertiaKgm2: 0,
    backlashArcmin: 0,
    massKg: 0,
    family: "Direct",
    size: "—",
    motorFrames: ["63", "71", "80", "100"],
    stages: 0,
  },
  ...expand("psf", "PS.F planetary", PSF_SIZES, [...PSF_I1, ...PSF_I2], 0.97, 0.94),
  ...expand("psc", "PS.C planetary", PSC_SIZES, [...PSC_I1, ...PSC_I2], 0.96, 0.93),
  ...expand("pxg", "PxG P5 planetary", PXG_SIZES, [...PXG_I1, ...PXG_I2], 0.97, 0.94),
  ...expand("helical", "R helical", R_SIZES, R_I, 0.96, 0.95),
  ...expand("bevel", "K helical-bevel", K_SIZES, K_I, 0.95, 0.94),
];

export const RATIO_SETS: { family: string; one: number[]; two: number[]; note: string }[] = [
  {
    family: "PS.F planetary",
    one: PSF_I1,
    two: PSF_I2,
    note: "Published PSF coaxial set. Same i ladder is used for sizes 121–921 in this tool.",
  },
  {
    family: "PS.C planetary",
    one: PSC_I1,
    two: PSC_I2,
    note: "Published PSC coaxial set (size 221 table).",
  },
  {
    family: "PxG P5 planetary",
    one: PXG_I1,
    two: PXG_I2,
    note: "Typical PxG P5 integer ratios. Exact iN depends on the configured stages.",
  },
  {
    family: "R helical",
    one: [],
    two: R_I,
    note: "SEW R two-/three-stage iN runs 3.21–289.74 with hundreds of exact values. This is a preferred-ratio ladder, not the full catalog.",
  },
  {
    family: "K helical-bevel",
    one: [],
    two: K_I,
    note: "Representative K iN ladder. The full catalog is denser.",
  },
];

export const CATALOG_SOURCE =
  "CM3C / CM3P standstill figures and PS.F / PS.C ratios are representative. MOVITRAC advanced 3×380–500 V sizes follow SEW ecodesign data 31968821 (type key 33957886): code = I_N × 10. Confirm in Workbench. Not licensed, not complete options.";

/** Official MOVITRAC advanced MCX91A, 3×380–500 V. Code = nominal output current ×10. Overload 150% / 30 s. Source: SEW 31968821. */
const MCA_ROWS: { code: string; kw: number; iA: number }[] = [
  { code: "0010", kw: 0.25, iA: 1.0 },
  { code: "0016", kw: 0.37, iA: 1.6 },
  { code: "0020", kw: 0.55, iA: 2.0 },
  { code: "0025", kw: 0.75, iA: 2.5 },
  { code: "0032", kw: 1.1, iA: 3.2 },
  { code: "0040", kw: 1.5, iA: 4.0 },
  { code: "0055", kw: 2.2, iA: 5.5 },
  { code: "0070", kw: 3.0, iA: 7.0 },
  { code: "0095", kw: 4.0, iA: 9.5 },
  { code: "0125", kw: 5.5, iA: 12.5 },
  { code: "0160", kw: 7.5, iA: 16.0 },
  { code: "0240", kw: 11, iA: 24.0 },
  { code: "0320", kw: 15, iA: 32.0 },
  { code: "0460", kw: 22, iA: 46.0 },
  { code: "0620", kw: 30, iA: 62.0 },
  { code: "0750", kw: 37, iA: 75.0 },
  { code: "0910", kw: 45, iA: 91.0 },
  { code: "1130", kw: 55, iA: 113.0 },
  { code: "1490", kw: 75, iA: 149.0 },
  { code: "1770", kw: 90, iA: 177.0 },
  { code: "2200", kw: 110, iA: 220.0 },
  { code: "2500", kw: 132, iA: 250.0 },
  { code: "3000", kw: 160, iA: 300.0 },
  { code: "3800", kw: 200, iA: 380.0 },
  { code: "4700", kw: 250, iA: 470.0 },
  { code: "5880", kw: 315, iA: 588.0 },
];

export const INVERTERS: Inverter[] = MCA_ROWS.map((row) => ({
  id: `mcx91a-${row.code}`,
  name: `MCX91A-${row.code}-5E3-4`,
  family: "MOVITRAC advanced",
  ratedPowerKw: row.kw,
  ratedCurrentA: row.iA,
  maxCurrentA: row.iA * 1.5,
  voltageV: 400,
}));

