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
