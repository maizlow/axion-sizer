export interface InternalTool {
  id: string;
  path: string;
  name: string;
  nameSv: string;
  tag: string;
  tagSv: string;
  ready: boolean;
  mark?: string;
}

export const TOOLS: InternalTool[] = [
  {
    id: "axion",
    path: "axion",
    name: "Axion",
    nameSv: "Axion",
    tag: "Motor and gearbox sizing for industrial motion.",
    tagSv: "Motor- och växeldimensionering för industriell rörelse.",
    ready: true,
    mark: "/logos/axion-mark.jpg",
  },
  {
    id: "units",
    path: "units",
    name: "Metron",
    nameSv: "Metron",
    tag: "Motion unit conversion, encoder scale and copyable formulas.",
    tagSv: "Enhetsomvandling, pulsgivarskala och formler att kopiera.",
    ready: true,
    mark: "metron",
  },
  {
    id: "caliper",
    path: "caliper",
    name: "Caliper",
    nameSv: "Caliper",
    tag: "Drawing review from PDF — template only, not built yet.",
    tagSv: "Granskning av ritnings-PDF — endast mall, inte byggt än.",
    ready: true,
    mark: "caliper",
  },
  {
    id: "librarian",
    path: "librarian",
    name: "Librarian",
    nameSv: "Librarian",
    tag: "Internal knowledge desk — template only, not built yet.",
    tagSv: "Intern kunskapsdisk — endast mall, inte byggt än.",
    ready: true,
    mark: "librarian",
  },
  {
    id: "grania",
    path: "grania",
    name: "Grania",
    nameSv: "Grania",
    tag: "Sand blend, sieve curve and H-band.",
    tagSv: "Sandblandning, siktkurva och H-band.",
    ready: true,
    mark: "grania",
  },
  {
    id: "lobe",
    path: "lobe",
    name: "Lobe",
    nameSv: "Lobe",
    tag: "Cam curve editor — drag points on an X–Y plot.",
    tagSv: "Kamkurva — dra punkter i ett X–Y-diagram.",
    ready: true,
    mark: "lobe",
  },
];

export function toolHref(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}${path}`.replace(/\/{2,}/g, "/");
}

export function assetHref(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}${path.replace(/^\//, "")}`;
}

export function hubHref(): string {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : `${base}/`;
}
