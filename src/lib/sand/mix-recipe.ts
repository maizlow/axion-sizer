export interface MixInputs {
  cementKg: number;
  sandKg: number;
  sandMoisturePct: number;
  additiveKg: [number, number, number];
  additiveWaterPct: [number, number, number];
  pigmentKg: number;
  pigmentWet: boolean;
  pigmentWaterPct: number;
  targetWc: number;
}

export interface MixResult {
  targetWaterKg: number;
  waterFromSand: number;
  waterFromAdditives: number;
  waterFromPigment: number;
  addedWaterKg: number;
  totalWaterKg: number;
  pigmentSolidsKg: number;
  batchKg: number;
  moisturePct: number;
  actualWc: number;
  moistureOk: boolean;
  waterShort: boolean;
}

export const TILE_MOISTURE_MIN = 7;
export const TILE_MOISTURE_MAX = 9;

export function computeMix(i: MixInputs): MixResult {
  const C = Math.max(0, i.cementKg);
  const S = Math.max(0, i.sandKg);
  const targetWaterKg = C * Math.max(0, i.targetWc);
  const waterFromSand = S * (Math.max(0, i.sandMoisturePct) / 100);
  const waterFromAdditives = i.additiveKg.reduce(
    (s, kg, n) => s + Math.max(0, kg) * (Math.max(0, i.additiveWaterPct[n]) / 100),
    0,
  );
  const pigmentWaterPct = i.pigmentWet ? Math.max(0, i.pigmentWaterPct) : 0;
  const waterFromPigment = Math.max(0, i.pigmentKg) * (pigmentWaterPct / 100);
  const pigmentSolidsKg = Math.max(0, i.pigmentKg) - waterFromPigment;
  const bound = waterFromSand + waterFromAdditives + waterFromPigment;
  const addedWaterKg = targetWaterKg - bound;
  const totalWaterKg = bound + Math.max(0, addedWaterKg);
  const addSolids = i.additiveKg.reduce((s, kg, n) => s + Math.max(0, kg) * (1 - Math.max(0, i.additiveWaterPct[n]) / 100), 0);
  const batchKg = C + S + addSolids + pigmentSolidsKg + totalWaterKg;
  const actualWc = C > 0 ? totalWaterKg / C : 0;
  const moisturePct = batchKg > 0 ? (totalWaterKg / batchKg) * 100 : 0;
  return {
    targetWaterKg,
    waterFromSand,
    waterFromAdditives,
    waterFromPigment,
    addedWaterKg,
    totalWaterKg,
    pigmentSolidsKg,
    batchKg,
    moisturePct,
    actualWc,
    moistureOk: moisturePct >= TILE_MOISTURE_MIN && moisturePct <= TILE_MOISTURE_MAX,
    waterShort: addedWaterKg < -0.05,
  };
}
