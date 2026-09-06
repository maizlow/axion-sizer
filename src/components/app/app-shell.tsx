import { useState } from "react";
import { ApplicationPicker } from "@/components/app/application-picker";
import { CatalogTables } from "@/components/app/catalog-tables";
import { DisclaimerBanner } from "@/components/app/disclaimer-banner";
import { InputPanel } from "@/components/app/input-panel";
import { ProjectBar } from "@/components/app/project-bar";
import { ResultsPanel } from "@/components/app/results-panel";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "app", label: "Application" },
  { id: "inputs", label: "Inputs" },
  { id: "results", label: "Results" },
  { id: "catalog", label: "Catalog" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AppShell() {
  const [tab, setTab] = useState<TabId>("app");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DisclaimerBanner />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Axion
            </div>
            <h1 className="truncate text-sm font-medium tracking-tight sm:text-base">
              Industrial motion drive sizing
            </h1>
          </div>
          <ProjectBar />
        </div>
        <nav className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 shrink-0 rounded-[var(--radius-sm)] px-3 text-sm font-medium",
                tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
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
        Axion is an independent engineering calculator. Product names such as CM3C, CM3P and
        Workbench belong to SEW-EURODRIVE. SI units only. Confirm every type code in official
        documentation before release.
      </footer>
    </div>
  );
}
