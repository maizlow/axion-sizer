import { normalizePhase } from "./cycle";
import type { ApplicationId, CycleSegment, GearboxKind, Inputs, MotionCycle, MotorKind } from "./types";

export const PROJECT_KIND = "axion-sizer-project";
export const PROJECT_VERSION = 1;

export interface AxionProject {
  kind: typeof PROJECT_KIND;
  version: number;
  name: string;
  savedAt: string;
  applicationId: ApplicationId;
  inputs: Inputs;
  cycle: MotionCycle;
  motorKinds: MotorKind[];
  gearboxKinds: GearboxKind[];
  selectedMatchId: string | null;
}

export function buildProject(
  name: string,
  state: Omit<AxionProject, "kind" | "version" | "name" | "savedAt">,
): AxionProject {
  return {
    kind: PROJECT_KIND,
    version: PROJECT_VERSION,
    name: name.trim() || "Untitled",
    savedAt: new Date().toISOString(),
    ...state,
  };
}

export function parseProject(raw: string): AxionProject {
  const data = JSON.parse(raw) as Partial<AxionProject>;
  if (!data || data.kind !== PROJECT_KIND) {
    throw new Error("This file is not an Axion project.");
  }
  if (!data.applicationId || !data.inputs || !data.cycle) {
    throw new Error("The project file is missing machine data.");
  }
  return {
    kind: PROJECT_KIND,
    version: typeof data.version === "number" ? data.version : 1,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Untitled",
    savedAt: typeof data.savedAt === "string" ? data.savedAt : new Date().toISOString(),
    applicationId: data.applicationId,
    inputs: data.inputs,
    cycle: {
      enabled: Boolean(data.cycle.enabled),
      segments: (data.cycle.segments ?? []).map((seg) => ({
        ...seg,
        inclineDir: normalizePhase(seg.inclineDir),
      })) as CycleSegment[],
    },
    motorKinds: Array.isArray(data.motorKinds) ? data.motorKinds : ["cm3c", "cm3p"],
    gearboxKinds: Array.isArray(data.gearboxKinds)
      ? data.gearboxKinds
      : ["psf", "psc", "pxg", "helical", "bevel", "direct"],
    selectedMatchId: data.selectedMatchId ?? null,
  };
}

export function fileNameFor(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${slug || "axion-project"}.axion.json`;
}
