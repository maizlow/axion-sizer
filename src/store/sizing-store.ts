import { create } from "zustand";
import { defaultInputs } from "@/lib/sizing/applications";
import { defaultCycle } from "@/lib/sizing/cycle";
import type { ApplicationId, CycleSegment, GearboxKind, Inputs, MotionCycle, MotorKind } from "@/lib/sizing/types";
import { emptySegment, fillKinematics, relinkPositions } from "@/lib/sizing/cycle";

interface SizingState {
  applicationId: ApplicationId;
  inputs: Inputs;
  cycle: MotionCycle;
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  selectedMatchId: string | null;
  setApplication: (id: ApplicationId) => void;
  setInput: (key: string, value: number | string) => void;
  setCycleEnabled: (enabled: boolean) => void;
  updateSegment: (id: string, patch: Partial<CycleSegment>, edited: keyof CycleSegment) => void;
  addSegment: () => void;
  removeSegment: (id: string) => void;
  toggleMotorKind: (k: MotorKind) => void;
  toggleGearboxKind: (k: GearboxKind) => void;
  setSelectedMatch: (id: string | null) => void;
  resetInputs: () => void;
}

export const useSizingStore = create<SizingState>()((set, get) => ({
  applicationId: "ball-screw",
  inputs: defaultInputs("ball-screw"),
  cycle: defaultCycle("ball-screw", defaultInputs("ball-screw")),
  motorKinds: ["cm3c", "cm3p"],
  gearboxKinds: ["psf", "psc", "pxg", "helical", "bevel", "direct"],
  selectedMatchId: null,
  setApplication: (id) => {
    const inputs = defaultInputs(id);
    set({ applicationId: id, inputs, cycle: defaultCycle(id, inputs), selectedMatchId: null });
  },
  setInput: (key, value) => set({ inputs: { ...get().inputs, [key]: value } }),
  setCycleEnabled: (enabled) => set({ cycle: { ...get().cycle, enabled } }),
  updateSegment: (id, patch, edited) => {
    const segs = get().cycle.segments.map((s) => {
      if (s.id !== id) return s;
      return fillKinematics({ ...s, ...patch }, edited);
    });
    set({ cycle: { ...get().cycle, segments: relinkPositions(segs) } });
  },
  addSegment: () => {
    const segs = get().cycle.segments;
    set({
      cycle: {
        ...get().cycle,
        segments: relinkPositions([...segs, emptySegment(segs[segs.length - 1])]),
      },
    });
  },
  removeSegment: (id) => {
    const segs = get().cycle.segments.filter((s) => s.id !== id);
    set({
      cycle: {
        ...get().cycle,
        segments: relinkPositions(segs.length ? segs : [emptySegment()]),
      },
    });
  },
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
  resetInputs: () => {
    const id = get().applicationId;
    const inputs = defaultInputs(id);
    set({ inputs, cycle: defaultCycle(id, inputs), selectedMatchId: null });
  },
}));
