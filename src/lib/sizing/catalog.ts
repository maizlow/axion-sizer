import type { Gearbox, Motor } from "./types";

/** Published SEW-EURODRIVE CM3C / CM3P standstill data (M0, Mpk, Jmot ×10⁻⁴ kg·m², speed class). */
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
    notes: `SEW-EURODRIVE CM3C medium-inertia, speed class ${row.n} min⁻¹. M0 ${row.m0} N·m, Mpk ${row.mpk} N·m.`,
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
    notes: `SEW-EURODRIVE CM3P high-dynamic, speed class ${row.n} min⁻¹. M0 ${row.m0} N·m, Mpk ${row.mpk} N·m.`,
  })),
];

const PSF_SIZES = [
  { size: "121", t: 25, nMax: 6000, back: 8, mass: 1.8 },
  { size: "221", t: 55, nMax: 6000, back: 6, mass: 3.2 },
  { size: "321", t: 110, nMax: 5500, back: 5, mass: 5.4 },
  { size: "521", t: 300, nMax: 4500, back: 4, mass: 9.5 },
  { size: "621", t: 600, nMax: 4000, back: 4, mass: 16 },
  { size: "721", t: 1000, nMax: 3500, back: 4, mass: 28 },
  { size: "821", t: 1750, nMax: 3000, back: 4, mass: 45 },
  { size: "921", t: 3000, nMax: 2500, back: 4, mass: 72 },
];
const PSF_I1 = [3, 4, 5, 7, 10];
const PSF_I2 = [16, 20, 25, 40, 70, 100];

const PSC_SIZES = [
  { size: "221", t: 30, nMax: 6000, back: 10, mass: 2.4 },
  { size: "321", t: 65, nMax: 5500, back: 10, mass: 4.1 },
  { size: "521", t: 160, nMax: 4500, back: 10, mass: 7.8 },
  { size: "621", t: 320, nMax: 4000, back: 10, mass: 13 },
];
const PSC_I = [5, 7, 10, 25, 35, 50, 70, 100];

const PXG_SIZES = [
  { size: "21", t: 66, nMax: 6000, back: 3, mass: 2.1 },
  { size: "31", t: 200, nMax: 5500, back: 3, mass: 4.8 },
  { size: "41", t: 600, nMax: 4500, back: 3, mass: 9.2 },
  { size: "51", t: 1500, nMax: 3500, back: 3, mass: 18 },
  { size: "53", t: 4200, nMax: 3000, back: 3, mass: 38 },
];
const PXG_I = [4, 5, 8, 10, 16, 25, 40, 100];

const R_SIZES = [
  { size: "R27", t: 130, nMax: 3600, mass: 10 },
  { size: "R37", t: 200, nMax: 3600, mass: 14 },
  { size: "R47", t: 400, nMax: 3600, mass: 22 },
  { size: "R57", t: 450, nMax: 3600, mass: 32 },
  { size: "R67", t: 600, nMax: 3600, mass: 46 },
  { size: "R77", t: 820, nMax: 3000, mass: 68 },
  { size: "R87", t: 1550, nMax: 3000, mass: 105 },
];
const R_I = [4.32, 7.6, 12.57, 20.87, 34.24, 54.33, 89.24];

const K_SIZES = [
  { size: "K37", t: 200, nMax: 3600, mass: 16 },
  { size: "K47", t: 400, nMax: 3600, mass: 24 },
  { size: "K57", t: 600, nMax: 3600, mass: 36 },
  { size: "K67", t: 830, nMax: 3000, mass: 52 },
  { size: "K77", t: 1500, nMax: 3000, mass: 78 },
  { size: "K87", t: 2000, nMax: 2500, mass: 120 },
];
const K_I = [6.57, 10.27, 16.31, 25.56, 40.14, 63.09, 98.23];

function expand(
  kind: Gearbox["kind"],
  family: string,
  sizes: { size: string; t: number; nMax: number; back?: number; mass: number }[],
  ratios: number[],
  eta1: number,
  eta2: number,
): Gearbox[] {
  const out: Gearbox[] = [];
  for (const s of sizes) {
    for (const ratio of ratios) {
      const twoStage = ratio > 12;
      out.push({
        id: `${kind}-${s.size}-${ratio}`,
        name: `${s.size} i=${ratio}`,
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
  },
  ...expand("psf", "PS.F planetary", PSF_SIZES, [...PSF_I1, ...PSF_I2], 0.97, 0.94),
  ...expand("psc", "PS.C planetary", PSC_SIZES, PSC_I, 0.96, 0.93),
  ...expand("pxg", "PxG P5 planetary", PXG_SIZES, PXG_I, 0.97, 0.94),
  ...expand("helical", "R helical", R_SIZES, R_I, 0.96, 0.95),
  ...expand("bevel", "K helical-bevel", K_SIZES, K_I, 0.95, 0.94),
];

export const CATALOG_SOURCE =
  "Standstill data from SEW-EURODRIVE published CM3C.. and CM3P.. tables. Gear-unit torque classes from PS.F / PS.C / PxG and standard R / K catalogs. Always confirm in SEW Workbench before release.";
