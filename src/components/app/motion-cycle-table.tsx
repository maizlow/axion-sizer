import { CycleChart } from "@/components/app/cycle-chart";
import { FieldTip } from "@/components/app/field-tip";
import { Plus, Trash2 } from "lucide-react";
import { ACCEL_LAW_OPTS, INCLINE_OPTS, TRAVEL_UNITS, appsWithCycle, cycleSummary, distFromDisp, distToDisp, travelLabels, velFromDisp, velToDisp } from "@/lib/sizing/cycle";
import { useT } from "@/lib/i18n/locale";
import type { AccelLaw, CycleSegment, InclineDir, TravelUnit } from "@/lib/sizing/types";
import { Button } from "@/components/ui/button";
import { useSizingStore } from "@/store/sizing-store";

function fmt(n: number, digits: number): string {
  if (!Number.isFinite(n)) return "";
  const s = n.toFixed(digits);
  return s.replace(/\.?0+$/, (m) => (m.includes(".") ? m.replace(/0+$/, "").replace(/\.$/, "") : m)) || "0";
}

const ROWS: {
  key: keyof CycleSegment;
  label: string;
  kind: "select" | "number" | "derived";
  dim?: "v" | "a" | "s";
  digits?: number;
}[] = [
  { key: "inclineDir", label: "Motion phase", kind: "select" },
  { key: "accelLaw", label: "Type of acceleration", kind: "select" },
  { key: "vStart", label: "Start velocity", kind: "number", dim: "v", digits: 1 },
  { key: "vEnd", label: "End velocity", kind: "number", dim: "v", digits: 1 },
  { key: "accel", label: "Acceleration", kind: "number", dim: "a", digits: 1 },
  { key: "time", label: "Time", kind: "number", digits: 1 },
  { key: "distanceMm", label: "Distance", kind: "number", dim: "s", digits: 1 },
  { key: "payloadKg", label: "Payload", kind: "number", digits: 1 },
  { key: "positionMm", label: "Position", kind: "derived", dim: "s", digits: 1 },
];

export function MotionCycleTable() {
  const applicationId = useSizingStore((s) => s.applicationId);
  const inputs = useSizingStore((s) => s.inputs);
  const cycle = useSizingStore((s) => s.cycle);
  const setCycleEnabled = useSizingStore((s) => s.setCycleEnabled);
  const setTravelUnit = useSizingStore((s) => s.setTravelUnit);
  const updateSegment = useSizingStore((s) => s.updateSegment);
  const addSegment = useSizingStore((s) => s.addSegment);
  const removeSegment = useSizingStore((s) => s.removeSegment);
  const t = useT();

  if (!appsWithCycle(applicationId)) return null;

  const sum = cycleSummary(cycle);
  const unit: TravelUnit = cycle.travelUnit ?? "mm";
  const labels = travelLabels(unit);

  const rowUnit = (row: (typeof ROWS)[number]): string => {
    if (row.dim === "v") return labels.v;
    if (row.dim === "a") return labels.a;
    if (row.dim === "s") return labels.s;
    if (row.key === "time") return "s";
    if (row.key === "payloadKg") return "kg";
    return "—";
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{t("cycle.title")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{cycle.enabled ? t("cycle.on") : t("cycle.off")}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={cycle.enabled}
            onChange={(e) => setCycleEnabled(e.target.checked)}
            className="size-3.5 accent-primary"
          />
          {t("cycle.use")}
        </label>
      </div>

      {cycle.enabled && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{t("cycle.travelUnit")}</span>
            <div className="inline-flex rounded-[var(--radius-sm)] border border-border p-0.5">
              {TRAVEL_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setTravelUnit(u)}
                  className={
                    unit === u
                      ? "h-7 rounded-[calc(var(--radius-sm)-2px)] bg-muted px-2.5 font-mono text-foreground"
                      : "h-7 rounded-[calc(var(--radius-sm)-2px)] px-2.5 font-mono"
                  }
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <CycleChart cycle={cycle} />

          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 bg-muted px-3 py-2 font-medium">{t("cycle.quantity")}</th>
              {cycle.segments.map((seg, i) => (
                <th key={seg.id} className="px-2 py-2 font-medium">
                  <div className="flex items-center justify-between gap-2">
                    <span>{t("cycle.step", { n: i + 1 })}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-danger"
                      onClick={() => removeSegment(seg.id)}
                      aria-label={t("cycle.remove", { n: i + 1 })}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.filter((row) => row.key !== "payloadKg" || Number.isFinite(Number(inputs.payloadKg))).map((row) => (
              <tr key={row.key} className="border-t border-border">
                <th className="sticky left-0 bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                  <span className="inline-flex items-center gap-1">
                    {t(
                      row.key === "inclineDir"
                        ? "cycle.phase"
                        : row.key === "accelLaw"
                          ? "cycle.law"
                          : row.key === "vStart"
                            ? "cycle.vStart"
                            : row.key === "vEnd"
                              ? "cycle.vEnd"
                              : row.key === "accel"
                                ? "cycle.accel"
                                : row.key === "time"
                                  ? "cycle.time"
                                  : row.key === "distanceMm"
                                    ? "cycle.distance"
                                    : row.key === "payloadKg"
                                      ? "cycle.payload"
                                      : "cycle.position",
                    )}
                    <FieldTip text={t(`help.${row.key}`)} label={row.label} />
                  </span>
                  <span className="ml-1 font-mono font-normal text-muted-foreground">{rowUnit(row)}</span>
                </th>
                {cycle.segments.map((seg) => (
                  <td key={seg.id} className="px-2 py-1">
                    <Cell seg={seg} row={row} unit={unit} onEdit={updateSegment} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" size="sm" variant="outline" onClick={addSegment}>
          <Plus className="size-3.5" />
          {t("cycle.add")}
        </Button>
        <p className="font-mono text-xs text-muted-foreground">
          T = {sum.periodS.toFixed(1)} s · travel {distToDisp(sum.travelMm, unit).toFixed(1)} {labels.s} · v
          <sub>max</sub> {velToDisp(sum.peakV, unit).toFixed(1)} {labels.v} · a<sub>max</sub>{" "}
          {velToDisp(sum.peakA, unit).toFixed(1)} {labels.a}
        </p>
          </div>
        </>
      )}
    </section>
  );
}

function Cell({
  seg,
  row,
  unit,
  onEdit,
}: {
  seg: CycleSegment;
  row: (typeof ROWS)[number];
  unit: TravelUnit;
  onEdit: (id: string, patch: Partial<CycleSegment>, edited: keyof CycleSegment) => void;
}) {
  const t = useT();
  if (row.kind === "select" && row.key === "inclineDir") {
    return (
      <select
        className="h-8 w-full min-w-[7.5rem] rounded-[var(--radius-sm)] border border-border bg-input px-2 text-xs"
        value={seg.inclineDir}
        onChange={(e) => onEdit(seg.id, { inclineDir: e.target.value as InclineDir }, "inclineDir")}
      >
        {INCLINE_OPTS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(
              o.value === "accel"
                ? "cycle.accelPhase"
                : o.value === "decel"
                  ? "cycle.decelPhase"
                  : "cycle.holdPhase",
            )}
          </option>
        ))}
      </select>
    );
  }
  if (row.kind === "select" && row.key === "accelLaw") {
    return (
      <select
        className="h-8 w-full min-w-[7.5rem] rounded-[var(--radius-sm)] border border-border bg-input px-2 text-xs"
        value={seg.accelLaw}
        onChange={(e) => onEdit(seg.id, { accelLaw: e.target.value as AccelLaw }, "accelLaw")}
      >
        {ACCEL_LAW_OPTS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.value === "linear" ? "cycle.linear" : o.value === "sin2" ? "cycle.sin2" : "cycle.jerk")}
          </option>
        ))}
      </select>
    );
  }
  const fallbackPay = 0;
  let n = row.key === "payloadKg" ? (seg.payloadKg ?? fallbackPay) : Number(seg[row.key]);
  if (row.dim === "v" || row.dim === "a") n = velToDisp(n, unit);
  if (row.dim === "s") n = distToDisp(n, unit);
  if (row.kind === "derived") {
    return <span className="block h-8 px-2 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">{fmt(n, row.digits ?? 2)}</span>;
  }
  return (
    <input
      type="number"
      step="0.1"
      inputMode="decimal"
      className="h-8 w-full min-w-[5.5rem] rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-xs tabular-nums"
      value={Number.isFinite(n) ? n.toFixed(1) : "0.0"}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (!Number.isFinite(v)) return;
        let stored = Math.round(v * 10) / 10;
        if (row.dim === "v" || row.dim === "a") stored = velFromDisp(stored, unit);
        if (row.dim === "s") stored = distFromDisp(stored, unit);
        onEdit(seg.id, { [row.key]: stored } as Partial<CycleSegment>, row.key);
      }}
    />
  );
}
