import { useMemo, useState } from "react";
import { FieldTip } from "@/components/app/field-tip";
import { Button } from "@/components/ui/button";
import { InertiaGlyph, InertiaSketch } from "@/components/units/inertia-sketches";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/locale";
import {
  INERTIA_BODIES,
  INERTIA_OUT,
  getInertiaBody,
  inertiaAboutCm,
  referToMotor,
  withOffset,
  type InertiaField,
  type InertiaKind,
} from "@/lib/units/inertia";
import { fmt } from "@/lib/units/motion-units";

const field =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-foreground font-mono";

function mmToM(mm: number): number {
  return Math.max(0, mm) / 1000;
}

function fieldLabel(key: InertiaField, t: (k: string) => string): string {
  const map: Record<InertiaField, string> = {
    m: t("units.j.m"),
    r: t("units.j.r"),
    Do: t("units.j.Do"),
    Di: t("units.j.Di"),
    a: t("units.j.a"),
    b: t("units.j.b"),
    L: t("units.j.L"),
    lead: t("units.j.lead"),
  };
  return map[key];
}

function fieldUnit(key: InertiaField): string {
  return key === "m" ? "kg" : "mm";
}

function fieldHelp(key: InertiaField, kind: InertiaKind, t: (k: string) => string): string {
  if (key === "L" && kind === "rodEnd") return t("help.unitsJ.Lend");
  if (key === "Do" && kind === "ring") return t("help.unitsJ.ringD");
  if (key === "Do" && kind === "linPulley") return t("help.unitsJ.pulleyD");
  return t(`help.unitsJ.${key}`);
}

type Part = { id: string; kind: InertiaKind; label: string; j: number; note: string };

export function InertiaCalc() {
  const t = useT();
  const [kind, setKind] = useState<InertiaKind>("cylAxis");
  const body = getInertiaBody(kind);
  const [vals, setVals] = useState<Record<InertiaField, number>>({
    m: 25,
    r: 200,
    Do: 180,
    Di: 80,
    a: 600,
    b: 400,
    L: 800,
    lead: 10,
  });
  const [offsetMm, setOffsetMm] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [copied, setCopied] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);

  const si = useMemo(() => {
    const p = {
      m: vals.m,
      r: mmToM(vals.r),
      Do: mmToM(vals.Do),
      Di: mmToM(vals.Di),
      a: mmToM(vals.a),
      b: mmToM(vals.b),
      L: mmToM(vals.L),
      lead: mmToM(vals.lead),
    };
    const jCm = inertiaAboutCm(kind, p);
    const j = withOffset(jCm, vals.m, mmToM(offsetMm));
    const jMot = referToMotor(j, ratio);
    return { jCm, j, jMot };
  }, [kind, vals, offsetMm, ratio]);

  const hollowBad = kind === "cylHollow" && vals.Di >= vals.Do && vals.Do > 0;

  const set = (key: InertiaField, n: number) => setVals((v) => ({ ...v, [key]: n }));

  const addPart = () => {
    const n = parts.filter((p) => p.kind === kind).length + 1;
    setParts((list) => [
      ...list,
      {
        id: `${kind}-${Date.now()}`,
        kind,
        label: `${t(`units.j.body.${kind}`)} ${n}`,
        j: si.j,
        note: body.formula + (offsetMm > 0 ? " + m d²" : ""),
      },
    ]);
  };

  const total = parts.reduce((s, p) => s + p.j, 0);
  const totalMot = referToMotor(total, ratio);

  const copyCode = [
    `${body.formula}${offsetMm > 0 ? " + m d²" : ""}`,
    `m = ${vals.m} kg`,
    ...body.fields
      .filter((f) => f !== "m")
      .map((f) => `${f} = ${vals[f]} mm`),
    offsetMm > 0 ? `d = ${offsetMm} mm` : "",
    `J = ${fmt(si.j, 6)} kg·m²`,
    ratio !== 1 ? `i = ${ratio}` : "",
    ratio !== 1 ? `J_motor = J / i² = ${fmt(si.jMot, 6)} kg·m²` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const groups: { id: "body" | "linear"; items: typeof INERTIA_BODIES }[] = [
    { id: "body", items: INERTIA_BODIES.filter((b) => b.group === "body") },
    { id: "linear", items: INERTIA_BODIES.filter((b) => b.group === "linear") },
  ];

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-medium">{t("units.j.title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("units.j.hint")}</p>

      {groups.map((g) => (
        <div key={g.id} className="mt-3">
          <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t(`units.j.group.${g.id}`)}
          </h3>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
            {g.items.map((b) => {
              const on = kind === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setKind(b.id)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-11 rounded-[var(--radius-md)] border px-2 py-1 text-left transition-colors duration-150",
                    on
                      ? "border-foreground bg-muted text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/60",
                  )}
                >
                  <InertiaGlyph kind={b.id} />
                  <div className="mt-0.5 text-xs font-medium leading-snug">{t(`units.j.body.${b.id}`)}</div>
                  <div className="font-[family-name:var(--font-math)] text-[11px] italic text-muted-foreground">
                    {b.formula}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="rounded-[var(--radius-md)] border border-border bg-background px-2 py-1">
          <InertiaSketch kind={kind} vals={vals} offsetMm={offsetMm} />
          <p className="px-2 font-[family-name:var(--font-math)] text-sm italic text-muted-foreground">
            {body.formula}
            {offsetMm > 0 ? " + m d²" : ""}
          </p>
          <p className="px-2 pb-2 text-xs leading-relaxed text-muted-foreground">{t(`units.j.axis.${kind}`)}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-[var(--radius-md)] border border-foreground/20 bg-muted/40 px-3 py-3">
            <div className="text-[11px] text-muted-foreground">J</div>
            <div className="font-mono text-2xl tabular-nums leading-tight">{fmt(si.j, 6)} kg·m²</div>
            <div className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              {fmt(si.j * 1e4, 6)} kg·cm²
              <span className="mx-1.5 text-border">·</span>
              {fmt(si.jMot, 6)} kg·m² {t("units.j.jMot").toLowerCase()}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {body.fields.map((key) => (
              <label key={key} className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {fieldLabel(key, t)} [{fieldUnit(key)}]
                  <FieldTip text={fieldHelp(key, kind, t)} label={fieldLabel(key, t)} />
                </span>
                <input
                  type="number"
                  className={field}
                  value={vals[key]}
                  min={0}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
              </label>
            ))}
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {t("units.j.offset")} [mm]
                <FieldTip text={t("help.unitsJ.offset")} label={t("units.j.offset")} />
              </span>
              <input
                type="number"
                className={field}
                value={offsetMm}
                min={0}
                onChange={(e) => setOffsetMm(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {t("units.j.ratio")}
                <FieldTip text={t("help.unitsJ.ratio")} label={t("units.j.ratio")} />
              </span>
              <input
                type="number"
                className={field}
                value={ratio}
                min={0.001}
                onChange={(e) => setRatio(Number(e.target.value))}
              />
            </label>
          </div>
          {hollowBad && <p className="text-xs text-danger">{t("units.j.hollowWarn")}</p>}
          <div className="grid grid-cols-2 gap-2">
            {INERTIA_OUT.map((u) => (
              <div key={u.id} className="rounded-[var(--radius-md)] border border-border px-3 py-2">
                <div className="text-[11px] text-muted-foreground">J [{u.label}]</div>
                <div className="font-mono text-sm tabular-nums">{fmt(si.j * u.fromSi, 6)}</div>
              </div>
            ))}
            <div className="rounded-[var(--radius-md)] border border-border px-3 py-2">
              <div className="text-[11px] text-muted-foreground">{t("units.j.jMot")}</div>
              <div className="font-mono text-sm tabular-nums">{fmt(si.jMot, 6)} kg·m²</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={addPart}>
          {t("units.j.add")}
        </Button>
        {parts.length > 0 && (
          <Button type="button" size="sm" variant="outline" onClick={() => setParts([])}>
            {t("units.j.clear")}
          </Button>
        )}
      </div>

      {parts.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("units.j.part")}</th>
                <th className="px-3 py-2 font-medium">J [kg·m²]</th>
                <th className="px-3 py-2 font-medium">{t("units.formula")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">{p.label}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{fmt(p.j, 6)}</td>
                  <td className="px-3 py-2 font-[family-name:var(--font-math)] italic text-muted-foreground">
                    {p.note}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setParts((list) => list.filter((x) => x.id !== p.id))}
                    >
                      {t("units.j.remove")}
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-medium">{t("units.j.total")}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{fmt(total, 6)}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {t("units.j.jMot")} = {fmt(totalMot, 6)} kg·m²
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{t("units.formula")}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(copyCode).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              });
            }}
          >
            {copied ? t("units.copied") : t("units.copy")}
          </Button>
        </div>
        <pre className="overflow-x-auto font-[family-name:var(--font-math)] text-[15px] italic leading-relaxed">
          {copyCode}
        </pre>
      </div>
    </section>
  );
}
