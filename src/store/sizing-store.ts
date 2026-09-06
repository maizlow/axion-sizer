import { create } from "zustand";
import { defaultInputs } from "@/lib/sizing/applications";
import type { ApplicationId, GearboxKind, Inputs, MotorKind } from "@/lib/sizing/types";

interface SizingState {
  applicationId: ApplicationId;
  inputs: Inputs;
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  selectedMatchId: string | null;
  setApplication: (id: ApplicationId) => void;
  setInput: (key: string, value: number | string) => void;
  toggleMotorKind: (k: MotorKind) => void;
  toggleGearboxKind: (k: GearboxKind) => void;
  setSelectedMatch: (id: string | null) => void;
  resetInputs: () => void;
}

export const useSizingStore = create<SizingState>()((set, get) => ({
  applicationId: "conveyor",
  inputs: defaultInputs("conveyor"),
  motorKinds: ["cm3c", "cm3p"],
  gearboxKinds: ["psf", "psc", "pxg", "helical", "bevel", "direct"],
  selectedMatchId: null,
  setApplication: (id) =>
    set({
      applicationId: id,
      inputs: defaultInputs(id),
      selectedMatchId: null,
    }),
  setInput: (key, value) => set({ inputs: { ...get().inputs, [key]: value } }),
  toggleMotorKind: (k) => {
    const cur = get().motorKinds;
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    set({ motorKinds: next.length ? next : cur });
  },
  toggleGearboxKind: (k) => {
    const cur = get().gearboxKinds;
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    set({ gearboxKinds: next.length ? next : cur });
  },
  setSelectedMatch: (id) => set({ selectedMatchId: id }),
  resetInputs: () => set({ inputs: defaultInputs(get().applicationId), selectedMatchId: null }),
}));
