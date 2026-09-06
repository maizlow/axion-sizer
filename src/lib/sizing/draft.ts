import { buildProject, parseProject, type AxionProject } from "./project-file";
import type { ApplicationId, GearboxKind, Inputs, MotionCycle, MotorKind } from "./types";

const KEY = "axion-draft-v1";

export type DraftState = {
  applicationId: ApplicationId;
  inputs: Inputs;
  cycle: MotionCycle;
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  selectedMatchId: string | null;
  name: string;
  inverterId?: string | null;
  hoursPerDay?: number;
};

export function saveDraft(state: DraftState): void {
  if (typeof window === "undefined") return;
  try {
    const project = buildProject(state.name, state);
    window.localStorage.setItem(KEY, JSON.stringify({ ...project, inverterId: state.inverterId ?? null, hoursPerDay: state.hoursPerDay ?? 16 }));
  } catch {
    /* quota / private mode */
  }
}

export function loadDraft(): (AxionProject & { inverterId?: string | null; hoursPerDay?: number }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const extra = JSON.parse(raw) as { inverterId?: string | null; hoursPerDay?: number };
    const project = parseProject(raw);
    return { ...project, inverterId: extra.inverterId ?? null, hoursPerDay: extra.hoursPerDay ?? 16 };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
