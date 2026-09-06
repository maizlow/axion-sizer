import { CycleChart } from "@/components/app/cycle-chart";
import { FieldTip } from "@/components/app/field-tip";
import { Plus, Trash2 } from "lucide-react";
import { ACCEL_LAW_OPTS, INCLINE_OPTS, appsWithCycle, cycleSummary } from "@/lib/sizing/cycle";
import { useT } from "@/lib/i18n/locale";
import type { AccelLaw, CycleSegment, InclineDir } from "@/lib/sizing/types";
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
  unit: string;
  kind: "select" | "number" | "derived";
  digits?: number;
}[] = [
  { key: "inclineDir", label: "Motion phase", unit: "—", kind: "select" },
  { key: "accelLaw", label: "Type of acceleration", unit: "—", kind: "select" },
  { key: "vStart", label: "Start velocity", unit: "m/s", kind: "number", digits: 2 },
  { key: "vEnd", label: "End velocity", unit: "m/s", kind: "number", digits: 2 },
  { key: "accel", label: "Acceleration", unit: "m/s²", kind: "number", digits: 2 },
  { key: "time", label: "Time", unit: "s", kind: "number", digits: 2 },
  { key: "distanceMm", label: "Distance", unit: "mm", kind: "number", digits: 1 },
  { key: "positionMm", label: "Position", unit: "mm", kind: "derived", digits: 1 },
];

export function MotionCycleTable() {
  const applicationId = useSizingStore((s) => s.applicationId);
  const cycle = useSizingStore((s) => s.cycle);
  const setCycleEnabled = useSizingStore((s) => s.setCycleEnabled);
  const updateSegment = useSizingStore((s) => s.updateSegment);
  const addSegment = useSizingStore((s) => s.addSegment);
  const removeSegment = useSizingStore((s) => s.removeSegment);
  const t = useT();

  if (!appsWithCycle(applicationId)) return null;

  const sum = cycleSummary(cycle);

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
            {ROWS.map((row) => (
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
                                    : "cycle.position",
                    )}
                    <FieldTip text={t(`help.${row.key}`)} label={row.label} />
                  </span>
                  <span className="ml-1 font-mono font-normal text-muted-foreground">{row.unit}</span>
                </th>
                {cycle.segments.map((seg) => (
                  <td key={seg.id} className="px-2 py-1">
                    <Cell seg={seg} row={row} onEdit={updateSegment} />
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
          T = {sum.periodS.toFixed(2)} s · travel {sum.travelMm.toFixed(0)} mm · v<sub>max</sub> {sum.peakV.toFixed(2)}{" "}
          m/s · a<sub>max</sub> {sum.peakA.toFixed(2)} m/s²
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
  onEdit,
}: {
  seg: CycleSegment;
  row: (typeof ROWS)[number];
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
  const raw = seg[row.key];
  const n = typeof raw === "number" ? raw : Number(raw);
  if (row.kind === "derived") {
    return <span className="block h-8 px-2 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">{fmt(n, row.digits ?? 2)}</span>;
  }
  return (
    <input
      type="number"
      step="any"
      inputMode="decimal"
      className="h-8 w-full min-w-[5.5rem] rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-xs tabular-nums"
      value={Number.isFinite(n) ? n : 0}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (!Number.isFinite(v)) return;
        onEdit(seg.id, { [row.key]: v } as Partial<CycleSegment>, row.key);
      }}
    />
  );
}
