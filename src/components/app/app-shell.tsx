import { useState } from "react";
import { ApplicationPicker } from "@/components/app/application-picker";
import { CatalogTables } from "@/components/app/catalog-tables";
import { DisclaimerBanner } from "@/components/app/disclaimer-banner";
import { InputPanel } from "@/components/app/input-panel";
import { ProjectBar } from "@/components/app/project-bar";
import { ResultsPanel } from "@/components/app/results-panel";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";

const TAB_IDS = ["app", "inputs", "results", "catalog"] as const;
type TabId = (typeof TAB_IDS)[number];

export function AppShell() {
  const [tab, setTab] = useState<TabId>("app");
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DisclaimerBanner />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Axion
            </div>
            <h1 className="truncate text-sm font-medium tracking-tight sm:text-base">{t("brand.tag")}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-[var(--radius-sm)] border border-border p-0.5"
              role="group"
              aria-label={t("lang.switch")}
            >
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={cn(
                    "h-8 min-w-8 rounded-[calc(var(--radius-sm)-2px)] px-2 font-mono text-xs",
                    locale === code ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`lang.${code}`)}
                </button>
              ))}
            </div>
            <ProjectBar />
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {TAB_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "h-10 shrink-0 rounded-[var(--radius-sm)] px-3 text-sm font-medium",
                tab === id ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {t(`tab.${id}`)}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        {tab === "app" && <ApplicationPicker />}
        {tab === "inputs" && (
          <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
            <InputPanel />
          </section>
        )}
        {tab === "results" && (
          <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
            <ResultsPanel />
          </section>
        )}
        {tab === "catalog" && (
          <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
            <CatalogTables />
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        {t("footer.legal")}
        <div className="mt-3 font-mono text-[10px] tracking-wide text-muted-foreground/50">
          {typeof __AXION_SHA__ === "string" && __AXION_SHA__ ? __AXION_SHA__.slice(0, 7) : "local"}
        </div>
      </footer>
    </div>
  );
}
