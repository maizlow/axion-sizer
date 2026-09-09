import { normalizePhase } from "./cycle";
import type { ApplicationId, CycleSegment, GearboxKind, Inputs, MotionCycle, MotorKind, TravelUnit } from "./types";

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
  openUrl?: string;
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
  let applicationId = data.applicationId as string;
  const inputs = { ...data.inputs };
  if (applicationId === "vertical-lift") {
    const mechanism = String(inputs.mechanism ?? "ball-screw");
    inputs.orientation = "vertical";
    inputs.inclineDeg = 90;
    if (mechanism === "rack") applicationId = "rack-pinion";
    else if (mechanism === "belt") applicationId = "gantry";
    else applicationId = "ball-screw";
  }
  return {
    kind: PROJECT_KIND,
    version: typeof data.version === "number" ? data.version : 1,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Untitled",
    savedAt: typeof data.savedAt === "string" ? data.savedAt : new Date().toISOString(),
    applicationId: applicationId as ApplicationId,
    inputs,
    cycle: {
      enabled: Boolean(data.cycle.enabled),
      travelUnit: (["m", "mm", "deg"].includes(String(data.cycle.travelUnit))
        ? data.cycle.travelUnit
        : "mm") as TravelUnit,
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

export function encodeProjectPayload(project: AxionProject): string {
  const compact = JSON.stringify(project);
  return btoa(unescape(encodeURIComponent(compact)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeProjectPayload(raw: string): AxionProject {
  const pad = raw + "===".slice((raw.length + 3) % 4);
  const json = decodeURIComponent(escape(atob(pad.replace(/-/g, "+").replace(/_/g, "/"))));
  return parseProject(json);
}

export function projectHref(project: AxionProject): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://maizlow.github.io";
  const root = (import.meta.env.BASE_URL || "/").endsWith("/")
    ? import.meta.env.BASE_URL || "/"
    : `${import.meta.env.BASE_URL || "/"}/`;
  return `${origin}${root}axion#p=${encodeProjectPayload(project)}`;
}

export function withOpenUrl(project: AxionProject): AxionProject {
  return { ...project, openUrl: projectHref(project) };
}

export function readProjectFromLocation(): AxionProject | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (hash.startsWith("#p=")) {
    try {
      return decodeProjectPayload(hash.slice(3));
    } catch {
      return null;
    }
  }
  const q = new URLSearchParams(window.location.search).get("p");
  if (q) {
    try {
      return decodeProjectPayload(q);
    } catch {
      return null;
    }
  }
  return null;
}
