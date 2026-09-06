export interface FrictionRef {
  pair: string;
  note: string;
  mu: number;
  range: string;
}

/** Typical dry kinetic μ unless noted. Mid values are what the tooltip applies. */
export const FRICTION_REFS: FrictionRef[] = [
  { pair: "Concrete — steel", note: "Dry sliding, clean slab", mu: 0.52, range: "0.45–0.60" },
  { pair: "Concrete — tungsten carbide", note: "Hard insert or shoe on slab", mu: 0.38, range: "0.30–0.45" },
  { pair: "Concrete — rubber", note: "Tyre, pad, or polycord on slab", mu: 0.72, range: "0.60–0.85" },
  { pair: "Concrete — PU / polycord", note: "Round or V-cord drive on concrete", mu: 0.62, range: "0.50–0.75" },
  { pair: "Concrete — cast iron", note: "Machine foot or plate", mu: 0.48, range: "0.40–0.55" },
  { pair: "Steel — steel, dry", note: "Unlubricated slide", mu: 0.60, range: "0.50–0.80" },
  { pair: "Steel — steel, greased", note: "Oil or grease film", mu: 0.12, range: "0.08–0.16" },
  { pair: "Steel — bronze", note: "Bush or wear strip", mu: 0.16, range: "0.12–0.20" },
  { pair: "Rubber — steel", note: "Pad or tyre on plate", mu: 0.65, range: "0.50–0.80" },
  { pair: "Nylon / POM — steel", note: "Wear pad", mu: 0.22, range: "0.15–0.35" },
  { pair: "PTFE — steel", note: "Low-friction tape or pad", mu: 0.07, range: "0.04–0.10" },
  { pair: "Wood — concrete", note: "Dry timber", mu: 0.50, range: "0.40–0.60" },
  { pair: "Roller bed (rolling)", note: "Equivalent c, not sliding μ", mu: 0.03, range: "0.02–0.04" },
  { pair: "Profile rail", note: "Recirculating ball guide", mu: 0.01, range: "0.005–0.02" },
];
