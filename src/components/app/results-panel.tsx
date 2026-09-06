import { useMemo } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { calculateSizing } from "@/lib/sizing/physics";
import { formatKw, formatNm, formatRpm, matchDrives } from "@/lib/sizing/match";
import type { GearboxKind, MotorKind } from "@/lib/sizing/types";
import { cn } from "@/lib/cn";
import { useSizingStore } from "@/store/sizing-store";
import { Button } from "@/components/ui/button";
import { ThermalCharts } from "@/components/app/thermal-charts";
import { useT } from "@/lib/i18n/locale";

const MOTOR_OPTS: { id: MotorKind; label: string }[] = [
  { id: "cm3c", label: "CM3C" },
  { id: "cm3p", label: "CM3P" },
];

const GB_OPTS: { id: GearboxKind; labelKey?: string; label?: string }[] = [
  { id: "psf", label: "PS.F" },
  { id: "psc", label: "PS.C" },
  { id: "pxg", label: "PxG" },
  { id: "helical", labelKey: "gb.helical" },
  { id: "bevel", labelKey: "gb.bevel" },
  { id: "direct", labelKey: "gb.direct" },
];

function UtilBar({ value, label }: { value: number; label: string }) {
  const tone = value > 1 ? "bg-danger" : value > 0.9 ? "bg-warn" : "bg-ok";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-foreground">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(value * 100, 100)}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
      <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono text-xl tabular-nums tracking-tight text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export function ResultsPanel() {
  const applicationId = useSizingStore((s) => s.applicationId);
  const inputs = useSizingStore((s) => s.inputs);
  const motorKinds = useSizingStore((s) => s.motorKinds);
  const gearboxKinds = useSizingStore((s) => s.gearboxKinds);
  const toggleMotorKind = useSizingStore((s) => s.toggleMotorKind);
  const toggleGearboxKind = useSizingStore((s) => s.toggleGearboxKind);
  const selectedMatchId = useSizingStore((s) => s.selectedMatchId);
  const setSelectedMatch = useSizingStore((s) => s.setSelectedMatch);

  const cycle = useSizingStore((s) => s.cycle);
  const t = useT();
  const result = useMemo(() => calculateSizing(applicationId, inputs, cycle), [applicationId, inputs, cycle]);
  const matches = useMemo(
    () => matchDrives(result, { motorKinds, gearboxKinds }),
    [result, motorKinds, gearboxKinds],
  );

  const lifting = result.holdingTorqueNm > 0 || result.loweringTorqueNm > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium tracking-tight">{t("results.need")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lifting ? t("results.liftNote") : t("results.note")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        <Stat label={lifting ? t("results.raise") : t("results.steady")} value={formatNm(result.outputTorqueNm)} unit="N·m" />
        <Stat label={t("results.peak")} value={formatNm(result.peakTorqueNm)} unit="N·m" />
        {lifting && <Stat label={t("results.lower")} value={formatNm(result.loweringTorqueNm)} unit="N·m" />}
        {lifting && <Stat label={t("results.hold")} value={formatNm(result.holdingTorqueNm)} unit="N·m" />}
        <Stat label={t("results.speed")} value={formatRpm(result.outputSpeedRpm)} unit="rpm" />
        <Stat label={t("results.power")} value={formatKw(result.outputPowerKw)} unit="kW" />
      </div>

      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <ul className="flex flex-col gap-2">
          {result.warnings.map((w) => (
            <li
              key={w}
              className="flex gap-2 rounded-[var(--radius-sm)] border border-warn/30 bg-warn/10 px-3 py-2 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              {translateNote(w, t)}
            </li>
          ))}
          {result.notes.map((n) => (
            <li key={n} className="text-sm text-muted-foreground">
              {translateNote(n, t)}
            </li>
          ))}
        </ul>
      )}

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("results.calc")}
        </h3>
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("results.quantity")}</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">{t("results.expr")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("results.value")}</th>
              </tr>
            </thead>
            <tbody>
              {result.formulas.map((f) => (
                <tr key={f.name} className="border-t border-border">
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="hidden px-3 py-2 font-mono text-xs text-muted-foreground sm:table-cell">
                    {f.expression}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatNm(f.value)} {f.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("results.matches")}
          </h3>
          <span className="text-xs text-muted-foreground">{t("results.fits", { n: matches.length })}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOTOR_OPTS.map((o) => (
            <Button
              key={o.id}
              type="button"
              size="sm"
              variant={motorKinds.includes(o.id) ? "secondary" : "outline"}
              onClick={() => toggleMotorKind(o.id)}
            >
              {o.label}
            </Button>
          ))}
          <span className="mx-1 h-8 w-px bg-border" />
          {GB_OPTS.map((o) => (
            <Button
              key={o.id}
              type="button"
              size="sm"
              variant={gearboxKinds.includes(o.id) ? "secondary" : "outline"}
              onClick={() => toggleGearboxKind(o.id)}
            >
              {o.labelKey ? t(o.labelKey) : o.label}
            </Button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {t("results.none")}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map((m) => {
              const id = `${m.motor.id}-${m.gearbox.id}`;
              const open = selectedMatchId === id;
              return (
                <li
                  key={id}
                  className={cn(
                    "rounded-[var(--radius-md)] border bg-card",
                    open ? "border-primary/35" : "border-border",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full flex-col gap-2 px-3 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
                    onClick={() => setSelectedMatch(open ? null : id)}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{m.motor.name}</span>
                        <span className="text-muted-foreground">+</span>
                        <span className="text-sm font-medium">{m.gearbox.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.motor.series} · {m.gearbox.family} · M0 {m.motor.contTorqueNm} N·m ·{" "}
                        {m.motor.ratedSpeedRpm} min⁻¹
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <UtilBar value={m.utilizationCont} label={t("results.cont")} />
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-border px-3 py-3">
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <div className="text-xs text-muted-foreground">{t("results.outCont")}</div>
                          <div className="font-mono tabular-nums">{formatNm(m.outputContNm)} N·m</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("results.outPeak")}</div>
                          <div className="font-mono tabular-nums">{formatNm(m.outputPeakNm)} N·m</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("results.outSpeed")}</div>
                          <div className="font-mono tabular-nums">{formatRpm(m.outputSpeedRpm)} rpm</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("results.jRatio")}</div>
                          <div className="font-mono tabular-nums">{m.inertiaRatio.toFixed(1)} : 1</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <UtilBar value={m.utilizationPeak} label={t("results.peakUtil")} />
                      </div>
                      <ul className="mt-3 flex flex-col gap-1">
                        {m.reasons.map((reason) => (
                          <li key={reason} className="flex gap-2 text-xs text-muted-foreground">
                            {m.inertiaOk && m.thermalOk ? (
                              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
                            ) : (
                              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warn" />
                            )}
                            {translateReason(reason, t)}
                          </li>
                        ))}
                      </ul>
                      <ThermalCharts result={result} match={m} cycle={cycle} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function translateNote(text: string, tr: (k: string, v?: Record<string, string | number>) => string): string {
  const cycle = text.match(/Motion cycle: (\d+) segments, period ([\d.]+) s, duty ([\d.]+)%/);
  if (cycle) return tr("note.cycle", { n: cycle[1], t: cycle[2], d: cycle[3] });
  const map: Record<string, string> = {
    "Inputs produce a non-positive speed or peak torque. Check values.": "warn.badInputs",
    "Specify a holding brake at least equal to holding torque × safety factor.": "warn.brake",
    "Vertical / inclined axis: size a holding brake for holding torque × safety factor.": "warn.vertBrake",
    "Ball screws back-drive. Do not rely on the screw to hold the load.": "warn.backdrive",
    "Lowering is gravity-assisted. Check regenerative energy on the inverter.": "note.lower",
    "Counterweight cuts gravity torque but adds inertia on raise and lower.": "note.cw",
  };
  const key = map[text];
  return key ? tr(key) : text;
}

function translateReason(reason: string, tr: (k: string, v?: Record<string, string | number>) => string): string {
  if (reason.startsWith("reason.inertia|")) {
    const [, n, series] = reason.split("|");
    return tr("reason.inertia", { n, series });
  }
  if (reason.startsWith("reason.flange|")) {
    const [, size, family, gb] = reason.split("|");
    return tr("reason.flange", { size, family, gb });
  }
  if (reason.startsWith("reason.")) return tr(reason);
  return reason;
}

