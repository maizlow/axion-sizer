import { useMemo } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { calculateSizing } from "@/lib/sizing/physics";
import { formatKw, formatNm, formatRpm, matchDrives } from "@/lib/sizing/match";
import type { GearboxKind, MotorKind } from "@/lib/sizing/types";
import { cn } from "@/lib/cn";
import { useSizingStore } from "@/store/sizing-store";
import { Button } from "@/components/ui/button";
import { ThermalCharts } from "@/components/app/thermal-charts";

const MOTOR_OPTS: { id: MotorKind; label: string }[] = [
  { id: "cm3c", label: "CM3C" },
  { id: "cm3p", label: "CM3P" },
];

const GB_OPTS: { id: GearboxKind; label: string }[] = [
  { id: "psf", label: "PS.F" },
  { id: "psc", label: "PS.C" },
  { id: "pxg", label: "PxG" },
  { id: "helical", label: "R helical" },
  { id: "bevel", label: "K bevel" },
  { id: "direct", label: "Direct" },
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
  const result = useMemo(() => calculateSizing(applicationId, inputs, cycle), [applicationId, inputs, cycle]);
  const matches = useMemo(
    () => matchDrives(result, { motorKinds, gearboxKinds }),
    [result, motorKinds, gearboxKinds],
  );

  const lifting = result.holdingTorqueNm > 0 || result.loweringTorqueNm > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium tracking-tight">Required at the load shaft</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lifting
            ? "Raise, lower and holding are calculated separately. Safety factor is applied when matching."
            : "Safety factor is applied when matching the reference table."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        <Stat label={lifting ? "Raise torque" : "Steady torque"} value={formatNm(result.outputTorqueNm)} unit="N·m" />
        <Stat label="Peak torque" value={formatNm(result.peakTorqueNm)} unit="N·m" />
        {lifting && <Stat label="Lower torque" value={formatNm(result.loweringTorqueNm)} unit="N·m" />}
        {lifting && <Stat label="Holding" value={formatNm(result.holdingTorqueNm)} unit="N·m" />}
        <Stat label="Speed" value={formatRpm(result.outputSpeedRpm)} unit="rpm" />
        <Stat label="Steady power" value={formatKw(result.outputPowerKw)} unit="kW" />
      </div>

      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <ul className="flex flex-col gap-2">
          {result.warnings.map((w) => (
            <li
              key={w}
              className="flex gap-2 rounded-[var(--radius-sm)] border border-warn/30 bg-warn/10 px-3 py-2 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              {w}
            </li>
          ))}
          {result.notes.map((n) => (
            <li key={n} className="text-sm text-muted-foreground">
              {n}
            </li>
          ))}
        </ul>
      )}

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Calculation
        </h3>
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Expression</th>
                <th className="px-3 py-2 text-right font-medium">Value</th>
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
            Suggested matches
          </h3>
          <span className="text-xs text-muted-foreground">{matches.length} fits</span>
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
              {o.label}
            </Button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No CM3 + gear-unit combination meets torque, speed and rating. Relax the safety factor or check
            inputs.
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
                      <UtilBar value={m.utilizationCont} label="Cont." />
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-border px-3 py-3">
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Output continuous</div>
                          <div className="font-mono tabular-nums">{formatNm(m.outputContNm)} N·m</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Output peak</div>
                          <div className="font-mono tabular-nums">{formatNm(m.outputPeakNm)} N·m</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Output speed</div>
                          <div className="font-mono tabular-nums">{formatRpm(m.outputSpeedRpm)} rpm</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Inertia ratio</div>
                          <div className="font-mono tabular-nums">{m.inertiaRatio.toFixed(1)} : 1</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <UtilBar value={m.utilizationPeak} label="Peak utilization" />
                      </div>
                      <ul className="mt-3 flex flex-col gap-1">
                        {m.reasons.map((reason) => (
                          <li key={reason} className="flex gap-2 text-xs text-muted-foreground">
                            {m.inertiaOk && m.thermalOk ? (
                              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
                            ) : (
                              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warn" />
                            )}
                            {reason}
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
