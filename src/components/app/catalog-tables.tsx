import { CATALOG_SOURCE, GEARBOXES, MOTORS, RATIO_SETS } from "@/lib/sizing/catalog";
import { formatNm, formatRpm } from "@/lib/sizing/match";
import { useT } from "@/lib/i18n/locale";

const UNIQUE_BOXES = GEARBOXES.filter((g) => g.kind !== "direct").reduce(
  (acc, g) => {
    const key = `${g.kind}-${g.size}`;
    if (!acc.map.has(key)) {
      acc.map.set(key, g);
      acc.list.push(g);
    }
    return acc;
  },
  { map: new Map<string, (typeof GEARBOXES)[number]>(), list: [] as typeof GEARBOXES },
).list;

export function CatalogTables() {
  const t = useT();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base font-medium tracking-tight">{t("catalog.title")}</h2>

        <p className="mt-1 text-sm text-muted-foreground">{CATALOG_SOURCE}</p>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("catalog.motors")}
        </h3>
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("catalog.type")}</th>
                <th className="px-3 py-2 font-medium">{t("catalog.series")}</th>
                <th className="px-3 py-2 text-right font-medium">M0 N·m</th>
                <th className="px-3 py-2 text-right font-medium">Mpk N·m</th>
                <th className="px-3 py-2 text-right font-medium">n min⁻¹</th>
                <th className="px-3 py-2 text-right font-medium">J 10⁻⁴ kg·m²</th>
                <th className="px-3 py-2 text-right font-medium">m kg</th>
              </tr>
            </thead>
            <tbody>
              {MOTORS.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.series === "CM3C" ? t("catalog.medJ") : t("catalog.hiDyn")}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatNm(m.contTorqueNm)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatNm(m.peakTorqueNm)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatRpm(m.ratedSpeedRpm)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {(m.inertiaKgm2 * 1e4).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{m.massKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("catalog.gears")}
        </h3>
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("catalog.family")}</th>
                <th className="px-3 py-2 font-medium">{t("catalog.size")}</th>
                <th className="px-3 py-2 text-right font-medium">T class N·m</th>
                <th className="px-3 py-2 text-right font-medium">n1 max</th>
                <th className="px-3 py-2 text-right font-medium">Backlash ′</th>
                <th className="px-3 py-2 font-medium">{t("catalog.frames")}</th>
              </tr>
            </thead>
            <tbody>
              {UNIQUE_BOXES.map((g) => (
                <tr key={`${g.kind}-${g.size}`} className="border-t border-border">
                  <td className="px-3 py-2">{g.family}</td>
                  <td className="px-3 py-2 font-medium">{g.size}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatNm(g.ratedOutputNm)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{formatRpm(g.maxInputRpm)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{g.backlashArcmin}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{g.motorFrames.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Matches only pair a CM3 frame that is listed for that gear-unit size, and only if motor speed class ≤
          n1 max. This is a flange / speed screen, not a manufacturer mounting check of shaft, brake or encoder options.
          Use{" "}
          <a
            href="https://www.sew-eurodrive.com/products/motors/servomotors"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            official catalogs
          </a>{" "}
          for the full series.

        </p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("catalog.ratios")}
        </h3>
        <div className="flex flex-col gap-3">
          {RATIO_SETS.map((set) => (
            <div key={set.family} className="rounded-[var(--radius-md)] border border-border px-3 py-3">
              <div className="text-sm font-medium">{set.family}</div>
              {set.one.length > 0 && (
                <p className="mt-1 font-mono text-xs text-foreground">
                  1-stage i = {set.one.join(", ")}
                </p>
              )}
              {set.two.length > 0 && (
                <p className="mt-1 font-mono text-xs text-foreground">
                  {set.one.length ? "2-stage" : "iN"} i = {set.two.join(", ")}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{set.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
