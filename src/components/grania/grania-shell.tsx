import { useMemo, useState } from "react";
import { FieldTip } from "@/components/app/field-tip";
import { GraniaMark } from "@/components/brand/grania-mark";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import {
  DEFAULT_ENVELOPE,
  H_MAX,
  H_MIN,
  SAMPLE_SANDS,
  SIEVE_MM,
  analyze,
  emptyResidues,
  envelopeStatus,
  hValue,
  mixResidues,
  todayIso,
  type EnvelopeRow,
  type SandSource,
} from "@/lib/sand/grading";
import { downloadSieveReport } from "@/lib/sand/sieve-report";
import { computeMix, TILE_MOISTURE_MAX, TILE_MOISTURE_MIN } from "@/lib/sand/mix-recipe";
import { useTheme } from "@/lib/theme";
import { hubHref } from "@/lib/tools";
import { Moon, Sun } from "lucide-react";

function Curve({ pass, envelope }: { pass: number[]; envelope: EnvelopeRow[] }) {
  const W = 640;
  const H = 280;
  const pad = { l: 44, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x0 = Math.log10(0.05);
  const x1 = Math.log10(10);
  const x = (mm: number) => pad.l + ((Math.log10(mm) - x0) / (x1 - x0)) * innerW;
  const y = (p: number) => pad.t + innerH - (p / 100) * innerH;
  const minLine = envelope.map((e, i) => `${i ? "L" : "M"} ${x(e.mm).toFixed(1)} ${y(e.min).toFixed(1)}`).join(" ");
  const maxLine = envelope.map((e, i) => `${i ? "L" : "M"} ${x(e.mm).toFixed(1)} ${y(e.max).toFixed(1)}`).join(" ");
  const meas = SIEVE_MM.map((mm, i) => `${i ? "L" : "M"} ${x(mm).toFixed(1)} ${y(pass[i + 1] ?? 100).toFixed(1)}`).join(" ");
  const band =
    envelope.map((e, i) => `${i ? "L" : "M"} ${x(e.mm).toFixed(1)} ${y(e.min).toFixed(1)}`).join(" ") +
    " " +
    [...envelope].reverse().map((e) => `L ${x(e.mm).toFixed(1)} ${y(e.max).toFixed(1)}`).join(" ") +
    " Z";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full">
      <path d={band} fill="var(--color-brand)" opacity="0.12" />
      <path d={minLine} fill="none" stroke="var(--color-muted-foreground)" strokeDasharray="4 3" />
      <path d={maxLine} fill="none" stroke="var(--color-muted-foreground)" strokeDasharray="4 3" />
      <path d={meas} fill="none" stroke="var(--color-brand)" strokeWidth="2" />
      {SIEVE_MM.map((mm) => (
        <text key={mm} x={x(mm)} y={H - 8} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="9">
          {mm}
        </text>
      ))}
      {[0, 25, 50, 75, 100].map((p) => (
        <text key={p} x={pad.l - 6} y={y(p) + 3} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="9">
          {p}
        </text>
      ))}
    </svg>
  );
}

function FieldLabel({ text, tip, tipLabel }: { text: string; tip?: string; tipLabel?: string }) {
  return (
    <div className="mb-1 flex h-5 items-center gap-1 text-[11px] text-muted-foreground">
      <span>{text}</span>
      {tip ? <FieldTip text={tip} label={tipLabel ?? text} /> : null}
    </div>
  );
}

export function GraniaShell() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const [sands, setSands] = useState<SandSource[]>(SAMPLE_SANDS);
  const [envelope] = useState<EnvelopeRow[]>(DEFAULT_ENVELOPE);
  const [cementKg, setCementKg] = useState(440);
  const [sandKg, setSandKg] = useState(1538);
  const [adds, setAdds] = useState<[number, number, number]>([0, 0, 0]);
  const [addW, setAddW] = useState<[number, number, number]>([0, 0, 0]);
  const [pigmentKg, setPigmentKg] = useState(0);
  const [pigmentWet, setPigmentWet] = useState(false);
  const [pigmentWater, setPigmentWater] = useState(50);
  const [targetWc, setTargetWc] = useState(0.38);

  const mix = useMemo(() => analyze(mixResidues(sands)), [sands]);
  const waterFromBlend = sands
    .filter((s) => s.onSite)
    .reduce((w, s) => w + sandKg * ((Number(s.blendPct) || 0) / 100) * ((Number(s.moisturePct) || 0) / 100), 0);
  const recipe = useMemo(
    () =>
      computeMix({
        cementKg,
        sandKg,
        sandMoisturePct: sandKg > 0 ? (waterFromBlend / sandKg) * 100 : 0,
        additiveKg: adds,
        additiveWaterPct: addW,
        pigmentKg,
        pigmentWet,
        pigmentWaterPct: pigmentWater,
        targetWc,
      }),
    [cementKg, sandKg, sands, adds, addW, pigmentKg, pigmentWet, pigmentWater, targetWc],
  );
  const h = hValue(mix.passPct);
  const env = envelopeStatus(mix.passPct, envelope);
  const hOk = h >= H_MIN && h <= H_MAX;
  const curveOk = env.every((e) => e.ok);
  const blendSum = sands.filter((s) => s.onSite).reduce((a, s) => a + (Number(s.blendPct) || 0), 0);
  const blendOk = Math.abs(blendSum - 100) < 0.05;

  function setBlend(id: string, raw: number) {
    setSands((cur) => {
      const others = cur.filter((s) => s.id !== id && s.onSite).reduce((a, s) => a + (Number(s.blendPct) || 0), 0);
      const cap = Math.max(0, 100 - others);
      const blendPct = Math.min(Math.max(0, raw), cap);
      return cur.map((s) => (s.id === id ? { ...s, blendPct } : s));
    });
  }

  function setOnSite(id: string, onSite: boolean) {
    setSands((cur) =>
      cur.map((s) => {
        if (s.id !== id) return s;
        if (!onSite) return { ...s, onSite };
        const others = cur.filter((x) => x.id !== id && x.onSite).reduce((a, x) => a + (Number(x.blendPct) || 0), 0);
        const blendPct = Math.min(Number(s.blendPct) || 0, Math.max(0, 100 - others));
        return { ...s, onSite, blendPct };
      }),
    );
  }

  function patch(id: string, next: Partial<SandSource>) {
    setSands((cur) => cur.map((s) => (s.id === id ? { ...s, ...next } : s)));
  }

  function setRes(id: string, index: number, value: number) {
    setSands((cur) =>
      cur.map((s) => {
        if (s.id !== id) return s;
        const residueG = [...s.residueG];
        residueG[index] = value;
        return { ...s, residueG };
      }),
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-2 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <GraniaMark className="size-8" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                  <a href={hubHref()} className="hover:text-foreground">
                    {t("hub.short")}
                  </a>
                  <span className="mx-1.5 text-border">/</span>
                  {t("grania.name")}
                </div>
                <h1 className="truncate text-xs font-medium tracking-tight sm:text-base">{t("grania.tag")}</h1>
              </div>
            </div>
          </div>
          <div className="flex h-8 items-center gap-1.5">
            <div className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-border p-0.5">
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={cn(
                    "h-7 min-w-8 rounded-[calc(var(--radius-sm)-2px)] px-2 font-mono text-xs",
                    locale === code ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`lang.${code}`)}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "light"}
              aria-label={t("theme.toggle")}
              onClick={toggleTheme}
              className="flex h-8 w-14 items-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-muted p-1"
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full bg-foreground text-background transition-transform",
                  theme === "light" ? "translate-x-6" : "translate-x-0",
                )}
              >
                {theme === "light" ? <Sun className="size-3" /> : <Moon className="size-3" />}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-[var(--radius-md)] border px-4 py-3", hOk ? "border-ok/40" : "border-warn/50")}>
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("grania.h")} <FieldTip text={t("help.graniaH")} label={t("grania.h")} />
            </div>
            <div className="mt-1 font-mono text-2xl tabular-nums">{h.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              {H_MIN}–{H_MAX} · {hOk ? t("grania.inBand") : t("grania.outBand")}
            </div>
          </div>
          <div className={cn("rounded-[var(--radius-md)] border px-4 py-3", curveOk ? "border-ok/40" : "border-warn/50")}>
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("grania.curve")}</div>
            <div className="mt-1 text-sm">{curveOk ? t("grania.curveOk") : t("grania.curveBad")}</div>
            <div className="text-xs text-muted-foreground">{t("grania.curveHint")}</div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border px-4 py-3 text-xs text-muted-foreground">
            {t("grania.mixNote")}
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("grania.blend")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("grania.blendHint")}</p>
          <p className="mt-2 text-sm" style={blendOk ? undefined : { color: "#c45a4a" }}>
            {t("grania.blendTotal", { n: blendSum.toFixed(1) })}
            {blendOk ? "" : ` — ${t("grania.blendNeed100")}`}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1 font-medium">{t("grania.sand")}</th>
                  <th className="py-1 font-medium">{t("grania.sampled")}</th>
                  <th className="py-1 font-medium">{t("grania.onSite")}</th>
                  <th className="py-1 font-medium">
                    {t("grania.pct")} <FieldTip text={t("help.graniaPct")} label={t("grania.pct")} />
                  </th>
                  <th className="py-1 font-medium">
                    {t("grania.massShare")} <FieldTip text={t("help.graniaShare")} label={t("grania.massShare")} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sands.map((s) => {
                  const part = s.onSite ? (s.blendPct / 100) * analyze(s.residueG).total : 0;
                  const share = mix.total > 0 && s.onSite ? (part / mix.total) * 100 : 0;
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="h-8 w-full max-w-[10rem] rounded-[var(--radius-sm)] border border-border bg-input px-2"
                            value={s.name}
                            onChange={(e) => patch(s.id, { name: e.target.value })}
                          />
                          {sands.length > 1 && (
                            <button type="button" className="text-xs text-muted-foreground" onClick={() => setSands((cur) => cur.filter((x) => x.id !== s.id))}>
                              {t("grania.remove")}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        <input
                          type="date"
                          className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 text-sm"
                          value={s.sampledAt || ""}
                          onChange={(e) => patch(s.id, { sampledAt: e.target.value })}
                        />
                      </td>
                      <td className="py-2">
                        <input type="checkbox" checked={s.onSite} onChange={(e) => setOnSite(s.id, e.target.checked)} />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          disabled={!s.onSite}
                          className="h-8 w-20 rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono disabled:opacity-40"
                          value={s.blendPct}
                          max={100}
                          onChange={(e) => setBlend(s.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 font-mono text-xs tabular-nums text-muted-foreground">{share.toFixed(1)} %</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-3 h-9 rounded-[var(--radius-sm)] border border-border px-3 text-sm"
            onClick={() =>
              setSands((cur) => [
                ...cur,
                {
                  id: `s${Date.now()}`,
                  name: `Sand ${cur.length + 1}`,
                  onSite: true,
                  blendPct: 0,
                  moisturePct: 0,
                  sampledAt: todayIso(),
                  residueG: emptyResidues(),
                },
              ])
            }
          >
            {t("grania.add")}
          </button>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">{t("grania.plot")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("grania.plotHint")}</p>
            </div>
            <button
              type="button"
              className="h-9 shrink-0 rounded-[var(--radius-sm)] border border-border px-3 text-sm"
              onClick={() => {
                try {
                  downloadSieveReport(sands, envelope);
                } catch {
                  window.alert("Could not build the PDF.");
                }
              }}
            >
              {t("grania.pdf")}
            </button>
          </div>
          <Curve pass={mix.passPct} envelope={envelope} />
          <h3 className="mt-4 text-sm font-medium">{t("grania.spec")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("grania.specHint")}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 font-medium">mm</th>
                  <th className="py-1 font-medium">{t("grania.min")}</th>
                  <th className="py-1 font-medium">{t("grania.pass")}</th>
                  <th className="py-1 font-medium">{t("grania.max")}</th>
                </tr>
              </thead>
              <tbody>
                {env.map((e) => (
                  <tr key={e.mm} className="border-t border-border">
                    <td className="py-1 font-mono">{e.mm}</td>
                    <td className="py-1 font-mono text-muted-foreground">{e.min}</td>
                    <td className={cn("py-1 font-mono", e.ok ? "text-foreground" : "text-warn")}>{e.pass.toFixed(1)}</td>
                    <td className="py-1 font-mono text-muted-foreground">{e.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {sands.map((s) => {
          const lab = analyze(s.residueG);
          return (
          <section key={s.id} className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-medium">
              {s.name}
              {s.sampledAt ? <span className="ml-2 text-xs font-normal text-muted-foreground">{s.sampledAt}</span> : null}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("grania.residueHint")}</p>
            <label className="mt-3 flex max-w-[16rem] flex-col text-[11px] text-muted-foreground">
              <FieldLabel text={`${t("grania.sandMoist")} ${s.name} [%]`} tip={t("help.graniaMoist")} tipLabel={t("grania.sandMoist")} />
              <input
                type="number"
                className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
                value={s.moisturePct}
                onChange={(e) => patch(s.id, { moisturePct: Number(e.target.value) })}
              />
            </label>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1 font-medium">{t("grania.sieve")}</th>
                    <th className="py-1 font-medium">{t("grania.grams")}</th>
                    <th className="py-1 font-medium">{t("grania.ret")}</th>
                    <th className="py-1 font-medium">{t("grania.pass")}</th>
                  </tr>
                </thead>
                <tbody>
                  {["pan", ...SIEVE_MM.map(String)].map((label, i) => (
                    <tr key={label} className="border-t border-border">
                      <td className="py-1.5">
                        <span className="inline-flex items-center gap-1">
                          {label === "pan" ? t("grania.pan") : `${label} mm`}
                          <FieldTip text={i === 0 ? t("help.graniaPan") : t("help.graniaSieve")} label={label} />
                        </span>
                      </td>
                      <td className="py-1.5">
                        <input
                          type="number"
                          className="h-8 w-24 rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
                          value={s.residueG[i] ?? 0}
                          onChange={(e) => setRes(s.id, i, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-1.5 font-mono text-xs tabular-nums text-muted-foreground">{lab.retPct[i]?.toFixed(1) ?? "0.0"} %</td>
                      <td className="py-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                        {i === 0 ? "—" : `${lab.passPct[i]?.toFixed(1) ?? "0.0"} %`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          );
        })}

        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("grania.recipe")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("grania.recipeHint")}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block min-w-0">
              <FieldLabel text={`${t("grania.cement")} [kg]`} tip={t("help.graniaCement")} tipLabel={t("grania.cement")} />
              <input type="number" className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={cementKg} onChange={(e) => setCementKg(Number(e.target.value))} />
            </label>
            <label className="block min-w-0">
              <FieldLabel text={`${t("grania.sandKg")} [kg]`} tip={t("help.graniaSandKg")} tipLabel={t("grania.sandKg")} />
              <input type="number" className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={sandKg} onChange={(e) => setSandKg(Number(e.target.value))} />
            </label>
            <label className="block min-w-0">
              <FieldLabel text={t("grania.vct")} tip={t("help.graniaVct")} tipLabel={t("grania.vct")} />
              <input type="number" step="0.01" className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={targetWc} onChange={(e) => setTargetWc(Number(e.target.value))} />
            </label>
          </div>
          <div className="mt-3 rounded-[var(--radius-sm)] border border-border px-3 py-2 text-xs text-muted-foreground">
            {sands.filter((s) => s.onSite).map((s) => (
              <div key={s.id}>
                {s.name}: {(sandKg * (Number(s.blendPct) || 0) / 100).toFixed(1)} kg
                {" · "}
                {s.blendPct} %{" · "}
                {t("grania.sandMoist")} {(Number(s.moisturePct) || 0).toFixed(1)} %
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {([0, 1, 2] as const).map((n) => (
              <div key={n} className="grid grid-cols-2 gap-2 rounded-[var(--radius-sm)] border border-border p-3">
                <label className="block min-w-0">
                  <FieldLabel text={`${t("grania.addN", { n: n + 1 })} [kg]`} tip={t("help.graniaAdd")} tipLabel={t("grania.addN", { n: n + 1 })} />
                  <input
                    type="number"
                    className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
                    value={adds[n]}
                    onChange={(e) => setAdds((a) => a.map((v, i) => (i === n ? Number(e.target.value) : v)) as [number, number, number])}
                  />
                </label>
                <label className="block min-w-0">
                  <FieldLabel text={`${t("grania.addWater")} [%]`} />
                  <input
                    type="number"
                    className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground"
                    value={addW[n]}
                    onChange={(e) => setAddW((a) => a.map((v, i) => (i === n ? Number(e.target.value) : v)) as [number, number, number])}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block min-w-0">
              <FieldLabel text={`${t("grania.pigment")} [kg]`} tip={t("help.graniaPigment")} tipLabel={t("grania.pigment")} />
              <input type="number" className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={pigmentKg} onChange={(e) => setPigmentKg(Number(e.target.value))} />
            </label>
            <label className="flex h-[3.25rem] items-end gap-2 pb-1 text-sm">
              <input type="checkbox" checked={pigmentWet} onChange={(e) => setPigmentWet(e.target.checked)} />
              {t("grania.pigmentWet")}
            </label>
            <label className="block min-w-0">
              <FieldLabel text={`${t("grania.pigmentWater")} [%]`} />
              <input
                type="number"
                disabled={!pigmentWet}
                className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground disabled:opacity-40"
                value={pigmentWater}
                onChange={(e) => setPigmentWater(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-[var(--radius-sm)] border border-border px-3 py-3">
              <div className="text-[11px] text-muted-foreground">{t("grania.addedWater")}</div>
              <div className="mt-1 font-mono text-xl tabular-nums">{recipe.addedWaterKg.toFixed(1)} kg</div>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border px-3 py-3">
              <div className="text-[11px] text-muted-foreground">{t("grania.actualWc")}</div>
              <div className="mt-1 font-mono text-xl tabular-nums">{recipe.actualWc.toFixed(3)}</div>
            </div>
            <div className="rounded-[var(--radius-sm)] border px-3 py-3" style={recipe.moistureOk ? undefined : { borderColor: "#c45a4a" }}>
              <div className="text-[11px] text-muted-foreground">{t("grania.moisture")}</div>
              <div className="mt-1 font-mono text-xl tabular-nums">{recipe.moisturePct.toFixed(1)} %</div>
              <div className="text-[11px] text-muted-foreground">
                {TILE_MOISTURE_MIN}–{TILE_MOISTURE_MAX} %
              </div>
            </div>
          </div>
          {recipe.waterShort && (
            <p className="mt-2 text-sm" style={{ color: "#c45a4a" }}>
              {t("grania.waterShort")}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">{t("grania.recipeNote")}</p>
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        {t("hub.footer")}
      </footer>
    </div>
  );
}
