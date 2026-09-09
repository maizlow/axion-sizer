import { useMemo, useState } from "react";
import { FieldTip } from "@/components/app/field-tip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { MetronMark } from "@/components/brand/metron-mark";
import { hubHref } from "@/lib/tools";
import {
  FAMILIES,
  convert,
  encoderScale,
  fmt,
  angToRevs,
  revsToAng,
  type AngUnit,
  type MechKind,
} from "@/lib/units/motion-units";
import { Moon, Sun } from "lucide-react";

const field =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-foreground";
const unitPick =
  "h-10 shrink-0 border-l border-border bg-input px-2 text-xs text-foreground";

function CopyBlock({ label, code }: { label: string; code: string }) {
  const t = useT();
  const [ok, setOk] = useState(false);
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setOk(true);
              window.setTimeout(() => setOk(false), 1200);
            });
          }}
        >
          {ok ? t("units.copied") : t("units.copy")}
        </Button>
      </div>
      <pre className="overflow-x-auto font-[family-name:var(--font-math)] text-[15px] italic leading-relaxed">{code}</pre>
    </div>
  );
}

export function UnitsShell() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);

  const [familyId, setFamilyId] = useState("linSpeed");
  const family = FAMILIES.find((f) => f.id === familyId) ?? FAMILIES[0];
  const [fromId, setFromId] = useState(family.units[2]?.id ?? family.units[0].id);
  const [toId, setToId] = useState(family.units[3]?.id ?? family.units[1].id);
  const [raw, setRaw] = useState(10);

  const fromU = family.units.find((u) => u.id === fromId) ?? family.units[0];
  const toU = family.units.find((u) => u.id === toId) ?? family.units[1];
  const converted = convert(family, raw, fromU.id, toU.id);

  const [ppr, setPpr] = useState(4096);
  const [gearboxI, setGearboxI] = useState(10);
  const [extraI, setExtraI] = useState(1);
  const [kind, setKind] = useState<MechKind>("screw");
  const [dimDisp, setDimDisp] = useState(10);
  const [dimUnit, setDimUnit] = useState<"mm" | "in">("mm");
  const [lenUnit, setLenUnit] = useState<"mm" | "in" | "m">("mm");
  const [spdUnit, setSpdUnit] = useState<"mm_s" | "m_s" | "m_min" | "ft_min">("mm_s");
  const [freqUnit, setFreqUnit] = useState<"Hz" | "kHz">("Hz");
  const [angUnit, setAngUnit] = useState<AngUnit>("deg");
  const [counts, setCounts] = useState(4096);
  const [freqDisp, setFreqDisp] = useState(2000);
  const [nMotRpm, setNMotRpm] = useState(1500);
  const [speedFrom, setSpeedFrom] = useState<"motor" | "load">("motor");
  const [loadAngS, setLoadAngS] = useState(90);

  const i = Math.max(gearboxI, 1e-12) * Math.max(extraI, 1e-12);
  const dimMm = dimDisp * (dimUnit === "in" ? 25.4 : 1);
  const freqHz = freqUnit === "kHz" ? freqDisp * 1000 : freqDisp;
  const nMot = speedFrom === "motor" ? nMotRpm : angToRevs(loadAngS, angUnit) * 60 * i;
  const nLoad = nMot / i;
  const loadAngSOut = revsToAng(nLoad / 60, angUnit);
  const motRpmOut = nMot;

  const scale = useMemo(() => encoderScale({ ppr, ratio: i, kind, dimMm }), [ppr, i, kind, dimMm]);
  const toLen = (mm: number) => {
    if (lenUnit === "in") return mm / 25.4;
    if (lenUnit === "m") return mm / 1000;
    return mm;
  };
  const toSpd = (mmS: number) => {
    if (spdUnit === "m_s") return mmS / 1000;
    if (spdUnit === "m_min") return mmS * 0.06;
    if (spdUnit === "ft_min") return mmS * (60 / 304.8);
    return mmS;
  };
  const lenLabel = lenUnit;
  const spdLabel = spdUnit === "mm_s" ? "mm/s" : spdUnit === "m_s" ? "m/s" : spdUnit === "m_min" ? "m/min" : "ft/min";
  const pos = toLen(counts * scale.mmPerPulse);
  const vel = toSpd(freqHz * scale.mmPerPulse);
  const pprSafe = Math.max(ppr, 1e-9);
  const motorRevsPerPulse = 1 / pprSafe;
  const loadRevsPerPulse = motorRevsPerPulse / i;
  const angMotPulse = revsToAng(motorRevsPerPulse, angUnit);
  const angLoadPulse = revsToAng(loadRevsPerPulse, angUnit);
  const angLoadPerMotRev = revsToAng(1 / i, angUnit);
  const motorRevs = counts / pprSafe;
  const loadRevs = motorRevs / i;
  const angMot = revsToAng(motorRevs, angUnit);
  const angLoad = revsToAng(loadRevs, angUnit);
  const freqLoadRevsS = freqHz / pprSafe / i;
  const angSpdLoad = revsToAng(freqLoadRevsS, angUnit);

  const dimName = kind === "screw" ? `lead_${dimUnit}` : `D_${dimUnit}`;
  const dimToMm = dimUnit === "in" ? `${dimName} * 25.4` : dimName;
  const travelLine = kind === "screw" ? `travel_mm = ${dimToMm}` : `travel_mm = PI * (${dimToMm})`;
  const angName = angUnit;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-2 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MetronMark className="size-8" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                  <a href={hubHref()} className="hover:text-foreground">
                    {t("hub.short")}
                  </a>
                  <span className="mx-1.5 text-border">/</span>
                  {t("units.name")}
                </div>
                <h1 className="truncate text-xs font-medium tracking-tight sm:text-base">{t("units.tag")}</h1>
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

      <main className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 py-6 sm:px-6">
        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("units.convert")}</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FAMILIES.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={familyId === f.id ? "secondary" : "outline"}
                onClick={() => {
                  setFamilyId(f.id);
                  setFromId(f.units[0].id);
                  setToId(f.units[Math.min(1, f.units.length - 1)].id);
                }}
              >
                {t(`units.fam.${f.id}`)}
              </Button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              {t("units.value")}
              <input
                type="number"
                className="h-10 rounded-[var(--radius-sm)] border border-border bg-input px-3 font-mono text-sm"
                value={raw}
                onChange={(e) => setRaw(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              {t("units.from")}
              <select
                className={field}
                value={fromU.id}
                onChange={(e) => setFromId(e.target.value)}
              >
                {family.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              {t("units.to")}
              <select
                className={field}
                value={toU.id}
                onChange={(e) => setToId(e.target.value)}
              >
                {family.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 font-[family-name:var(--font-math)] text-xl italic">
            {raw} {fromU.label} = {fmt(converted, 6)} {toU.label}
          </p>
          <div className="mt-3">
            <CopyBlock
              label={t("units.formula")}
              code={`${toU.id} = ${fromU.id} * ${fmt(fromU.toSi / toU.toSi)}`}
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("units.encoder")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("units.encoderHint")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {t("units.ppr")}
                <FieldTip text={t("help.unitsPpr")} label={t("units.ppr")} />
              </span>
              <input
                type="number"
                className={`${field} font-mono`}
                value={ppr}
                onChange={(e) => setPpr(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {t("units.gearboxI")}
                <FieldTip text={t("help.unitsGearboxI")} label={t("units.gearboxI")} />
              </span>
              <input
                type="number"
                className={`${field} font-mono`}
                value={gearboxI}
                onChange={(e) => setGearboxI(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {t("units.extraI")}
                <FieldTip text={t("help.unitsExtraI")} label={t("units.extraI")} />
              </span>
              <input
                type="number"
                className={`${field} font-mono`}
                value={extraI}
                onChange={(e) => setExtraI(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("units.mech")}
              <select className={field} value={kind} onChange={(e) => setKind(e.target.value as MechKind)}>
                <option value="screw">{t("units.screw")}</option>
                <option value="pulley">{t("units.pulley")}</option>
                <option value="rack">{t("units.rack")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {kind === "screw" ? `${t("units.lead")} [${dimUnit}/rev]` : `${t("units.dia")} [${dimUnit}]`}
              <span className="flex overflow-hidden rounded-[var(--radius-sm)] border border-border">
                <input
                  type="number"
                  className="h-10 min-w-0 flex-1 bg-input px-3 font-mono text-sm text-foreground"
                  value={dimDisp}
                  onChange={(e) => setDimDisp(Number(e.target.value))}
                />
                <select
                  className={unitPick}
                  value={dimUnit}
                  onChange={(e) => {
                    const next = e.target.value as "mm" | "in";
                    const mm = dimDisp * (dimUnit === "in" ? 25.4 : 1);
                    setDimUnit(next);
                    setDimDisp(next === "in" ? mm / 25.4 : mm);
                  }}
                >
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                </select>
              </span>
            </label>
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {t("units.totalI")} = {fmt(gearboxI)} × {fmt(extraI)} = {fmt(i)}
            {" · "}
            1 {t("units.loadRev")} = {fmt(i)} {t("units.motRev")} = {fmt(revsToAng(i, angUnit))} {angName} {t("units.motor")}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              {t("units.outLen")}
              <select
                className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 text-sm text-foreground"
                value={lenUnit}
                onChange={(e) => setLenUnit(e.target.value as "mm" | "in" | "m")}
              >
                <option value="mm">mm</option>
                <option value="in">in</option>
                <option value="m">m</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              {t("units.outSpd")}
              <select
                className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 text-sm text-foreground"
                value={spdUnit}
                onChange={(e) => setSpdUnit(e.target.value as "mm_s" | "m_s" | "m_min" | "ft_min")}
              >
                <option value="mm_s">mm/s</option>
                <option value="m_s">m/s</option>
                <option value="m_min">m/min</option>
                <option value="ft_min">ft/min</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              {t("units.outAng")}
              <select
                className="h-8 rounded-[var(--radius-sm)] border border-border bg-input px-2 text-sm text-foreground"
                value={angUnit}
                onChange={(e) => setAngUnit(e.target.value as AngUnit)}
              >
                <option value="deg">deg</option>
                <option value="rad">rad</option>
                <option value="rev">rev</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label={t("units.perPulse", { u: lenLabel })} value={`${fmt(toLen(scale.mmPerPulse))} ${lenLabel}`} />
            <Stat
              label={t("units.pulsePer", { u: lenLabel })}
              value={fmt(1 / Math.max(toLen(scale.mmPerPulse), 1e-12))}
            />
            <Stat label={t("units.perMot", { u: lenLabel })} value={`${fmt(toLen(scale.mmPerMotorRev))} ${lenLabel}`} />
            <Stat label={t("units.perLoad", { u: lenLabel })} value={`${fmt(toLen(scale.mmPerLoadRev))} ${lenLabel}`} />
            <Stat label={t("units.motAngPulse", { u: angName })} value={`${fmt(angMotPulse)} ${angName}`} />
            <Stat label={t("units.loadAngPulse", { u: angName })} value={`${fmt(angLoadPulse)} ${angName}`} />
            <Stat label={t("units.pulsePerAng", { u: angName })} value={fmt(1 / Math.max(angLoadPulse, 1e-12))} />
            <Stat label={t("units.loadAngMot", { u: angName })} value={`${fmt(angLoadPerMotRev)} ${angName}`} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("units.counts")}
              <input
                type="number"
                className={`${field} font-mono`}
                value={counts}
                onChange={(e) => setCounts(Number(e.target.value))}
              />
              <span className="font-mono text-foreground/80">
                {fmt(pos)} {lenLabel}
                {" · "}
                {fmt(angLoad)} {angName} {t("units.load")}
                {" · "}
                {fmt(angMot)} {angName} {t("units.motor")}
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("units.freq")} [{freqUnit}]
              <span className="flex overflow-hidden rounded-[var(--radius-sm)] border border-border">
                <input
                  type="number"
                  className="h-10 min-w-0 flex-1 bg-input px-3 font-mono text-sm text-foreground"
                  value={freqDisp}
                  onChange={(e) => setFreqDisp(Number(e.target.value))}
                />
                <select
                  className={unitPick}
                  value={freqUnit}
                  onChange={(e) => {
                    const next = e.target.value as "Hz" | "kHz";
                    const hz = freqUnit === "kHz" ? freqDisp * 1000 : freqDisp;
                    setFreqUnit(next);
                    setFreqDisp(next === "kHz" ? hz / 1000 : hz);
                  }}
                >
                  <option value="Hz">Hz</option>
                  <option value="kHz">kHz</option>
                </select>
              </span>
              <span className="font-mono text-foreground/80">
                {fmt(vel)} {spdLabel}
                {" · "}
                {fmt(angSpdLoad)} {angName}/s {t("units.load")}
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("units.nMot")} [rpm]
              <input
                type="number"
                className={`${field} font-mono`}
                value={speedFrom === "motor" ? nMotRpm : motRpmOut}
                onChange={(e) => {
                  setSpeedFrom("motor");
                  setNMotRpm(Number(e.target.value));
                }}
              />
              <span className="font-mono text-foreground/80">
                {fmt(loadAngSOut)} {angName}/s {t("units.load")}
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("units.nLoadAng")} [{angName}/s]
              <input
                type="number"
                className={`${field} font-mono`}
                value={speedFrom === "load" ? loadAngS : loadAngSOut}
                onChange={(e) => {
                  setSpeedFrom("load");
                  setLoadAngS(Number(e.target.value));
                }}
              />
              <span className="font-mono text-foreground/80">
                {fmt(motRpmOut)} rpm {t("units.motor")}
              </span>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <CopyBlock
              label={t("units.plcScale")}
              code={`${travelLine}\ni = i_gb * i_extra\nmm_per_pulse = travel_mm / (i * PPR)\n${angName}_motor_per_pulse = ${angUnit === "deg" ? "360" : angUnit === "rad" ? "2*PI" : "1"} / PPR\n${angName}_load_per_pulse = ${angUnit === "deg" ? "360" : angUnit === "rad" ? "2*PI" : "1"} / (i * PPR)\nposition_mm = counts * mm_per_pulse\n${angName}_load = counts * ${angName}_load_per_pulse\nv_mm_s = f_Hz * mm_per_pulse\nload_${angName}_s = n_motor_rpm * ${angUnit === "deg" ? "6" : angUnit === "rad" ? "(2*PI/60)" : "(1/60)"} / i\nn_motor_rpm = load_${angName}_s * i / ${angUnit === "deg" ? "6" : angUnit === "rad" ? "(2*PI/60)" : "(1/60)"}`}
            />
            <CopyBlock
              label={t("units.namedValues")}
              code={[
                `${t("units.ppr")} = ${ppr}`,
                `${t("units.gearboxI")} = ${gearboxI}`,
                `${t("units.extraI")} = ${extraI}`,
                `${t("units.totalI")} = ${fmt(i)}`,
                `${t("units.mech")} = ${t(`units.${kind}`)}`,
                `${kind === "screw" ? t("units.lead") : t("units.dia")} = ${dimDisp} ${dimUnit}`,
                `${t("units.outLen")} = ${lenLabel}`,
                `${t("units.outSpd")} = ${spdLabel}`,
                `${t("units.outAng")} = ${angName}`,
                `${t("units.counts")} = ${counts}`,
                `${t("units.freq")} = ${freqDisp} ${freqUnit}`,
                `${t("units.nMot")} = ${fmt(motRpmOut)} rpm`,
                `${t("units.nLoadAng")} = ${fmt(loadAngSOut)} ${angName}/s`,
                `${t("units.pulsePerAng", { u: angName })} = ${fmt(1 / Math.max(angLoadPulse, 1e-12))}`,
              ].join("\n")}
            />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs leading-relaxed text-muted-foreground sm:px-6">
        {t("hub.footer")}
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  );
}
