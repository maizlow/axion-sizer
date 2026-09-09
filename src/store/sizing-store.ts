import { create } from "zustand";
import { defaultInputs } from "@/lib/sizing/applications";
import { defaultCycle } from "@/lib/sizing/cycle";
import type { ApplicationId, CycleSegment, GearboxKind, Inputs, MotionCycle, MotorKind, TravelUnit } from "@/lib/sizing/types";
import { emptySegment, fillKinematics, relinkPositions } from "@/lib/sizing/cycle";

interface SizingState {
  applicationId: ApplicationId;
  inputs: Inputs;
  cycle: MotionCycle;
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  selectedMatchId: string | null;
  inverterId: string | null;
  hoursPerDay: number;
  projectName: string;
  setApplication: (id: ApplicationId) => void;
  setInput: (key: string, value: number | string) => void;
  setCycleEnabled: (enabled: boolean) => void;
  setTravelUnit: (unit: TravelUnit) => void;
  updateSegment: (id: string, patch: Partial<CycleSegment>, edited: keyof CycleSegment) => void;
  addSegment: () => void;
  removeSegment: (id: string) => void;
  resetCyclePayload: () => void;
  toggleMotorKind: (k: MotorKind) => void;
  toggleGearboxKind: (k: GearboxKind) => void;
  setSelectedMatch: (id: string | null) => void;
  setInverterId: (id: string | null) => void;
  setHoursPerDay: (hours: number) => void;
  setProjectName: (name: string) => void;
  loadProject: (data: {
    applicationId: ApplicationId;
    inputs: Inputs;
    cycle: MotionCycle;
    motorKinds: MotorKind[];
    gearboxKinds: GearboxKind[];
    selectedMatchId: string | null;
    name: string;
    inverterId?: string | null;
    hoursPerDay?: number;
  }) => void;
  resetInputs: () => void;
}

export const useSizingStore = create<SizingState>()((set, get) => ({
  applicationId: "ball-screw",
  inputs: defaultInputs("ball-screw"),
  cycle: defaultCycle("ball-screw", defaultInputs("ball-screw")),
  motorKinds: ["cm3c", "cm3p"],
  gearboxKinds: ["psf", "psc", "pxg", "helical", "bevel", "direct"],
  selectedMatchId: null,
  inverterId: null,
  hoursPerDay: 16,
  projectName: "Untitled",
  setApplication: (id) => {
    const inputs = defaultInputs(id);
    set({ applicationId: id, inputs, cycle: defaultCycle(id, inputs), selectedMatchId: null });
  },
  setInput: (key, value) => set({ inputs: { ...get().inputs, [key]: value } }),
  setCycleEnabled: (enabled) => set({ cycle: { ...get().cycle, enabled } }),
  setTravelUnit: (travelUnit) => set({ cycle: { ...get().cycle, travelUnit } }),
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
  resetCyclePayload: () => {
    const segs = get().cycle.segments.map((s) => ({ ...s, payloadKg: 0 }));
    set({ cycle: { ...get().cycle, segments: segs } });
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
  setInverterId: (id) => set({ inverterId: id }),
  setHoursPerDay: (hours) => set({ hoursPerDay: hours }),
  setProjectName: (name) => set({ projectName: name }),
  loadProject: (data) =>
    set({
      applicationId: data.applicationId,
      inputs: data.inputs,
      cycle: {
        ...data.cycle,
        travelUnit: data.cycle.travelUnit === "m" || data.cycle.travelUnit === "deg" ? data.cycle.travelUnit : "mm",
        segments: data.cycle.segments ?? [],
      },
      motorKinds: data.motorKinds.length ? data.motorKinds : ["cm3c"],
      gearboxKinds: data.gearboxKinds.length ? data.gearboxKinds : ["psf"],
      selectedMatchId: data.selectedMatchId,
      projectName: data.name,
      inverterId: data.inverterId ?? null,
      hoursPerDay: data.hoursPerDay ?? 16,
    }),
  resetInputs: () => {
    const id = get().applicationId;
    const inputs = defaultInputs(id);
    set({ inputs, cycle: defaultCycle(id, inputs), selectedMatchId: null });
  },
}));
