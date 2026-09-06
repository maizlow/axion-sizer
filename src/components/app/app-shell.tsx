import { useEffect, useState } from "react";
import { ApplicationPicker } from "@/components/app/application-picker";
import { CatalogTables } from "@/components/app/catalog-tables";
import { DisclaimerBanner } from "@/components/app/disclaimer-banner";
import { InputPanel } from "@/components/app/input-panel";
import { ProjectBar } from "@/components/app/project-bar";
import { ResultsPanel } from "@/components/app/results-panel";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { loadDraft, saveDraft } from "@/lib/sizing/draft";
import { readProjectFromLocation } from "@/lib/sizing/project-file";
import { AxionMark } from "@/components/brand/axion-mark";
import { hubHref } from "@/lib/tools";
import { useSizingStore } from "@/store/sizing-store";

const TAB_IDS = ["app", "inputs", "results", "catalog"] as const;
type TabId = (typeof TAB_IDS)[number];

export function AppShell() {
  const [tab, setTab] = useState<TabId>("app");
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const loadProject = useSizingStore((s) => s.loadProject);

  useEffect(() => {
    const fromLink = readProjectFromLocation();
    if (fromLink) {
      loadProject(fromLink);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } else {
      const draft = loadDraft();
      if (draft) loadProject(draft);
    }
    let timer = 0;
    const unsub = useSizingStore.subscribe((s) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        saveDraft({
          applicationId: s.applicationId,
          inputs: s.inputs,
          cycle: s.cycle,
          motorKinds: s.motorKinds,
          gearboxKinds: s.gearboxKinds,
          selectedMatchId: s.selectedMatchId,
          name: s.projectName,
          inverterId: s.inverterId,
          hoursPerDay: s.hoursPerDay,
        });
      }, 300);
    });
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [loadProject]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <AxionMark className="size-8" />
              <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              <a href={hubHref()} className="hover:text-foreground">
                {t("hub.short")}
              </a>
              <span className="mx-1.5 text-border">/</span>
              Axion
            </div>
            <h1 className="truncate text-xs font-medium tracking-tight sm:text-base">{t("brand.tag")}</h1>
              </div>
            </div>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-1.5">
            <div
              className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-border p-0.5"
              role="group"
              aria-label={t("lang.switch")}
            >
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
            <ProjectBar compact />
          </div>
        </div>
        <nav className="mx-auto grid max-w-[1100px] grid-cols-4 gap-1 px-3 pb-2 sm:flex sm:px-6 sm:pb-3">
          {TAB_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "h-9 rounded-[var(--radius-sm)] px-1 text-center text-[11px] font-medium sm:h-10 sm:px-3 sm:text-sm",
                tab === id ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {t(`tab.${id}`)}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        {tab === "app" && <ApplicationPicker onPicked={() => setTab("inputs")} />}
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

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs leading-relaxed text-muted-foreground sm:px-6">
        <DisclaimerBanner />
        <p className="mt-2">{t("footer.legal")}</p>
        <div className="mt-3 font-mono text-[10px] tracking-wide text-muted-foreground/50">
          {typeof __AXION_SHA__ === "string" && __AXION_SHA__ ? __AXION_SHA__.slice(0, 7) : "local"}
        </div>
      </footer>
    </div>
  );
}
