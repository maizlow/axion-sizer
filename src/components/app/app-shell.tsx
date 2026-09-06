import { useState } from "react";
import { ApplicationPicker } from "@/components/app/application-picker";
import { InputPanel } from "@/components/app/input-panel";
import { ResultsPanel } from "@/components/app/results-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSizingStore } from "@/store/sizing-store";

const TABS = [
  { id: "app", label: "Application" },
  { id: "inputs", label: "Inputs" },
  { id: "results", label: "Results" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AppShell() {
  const [tab, setTab] = useState<TabId>("app");
  const units = useSizingStore((s) => s.units);
  const setUnits = useSizingStore((s) => s.setUnits);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Axion
            </div>
            <h1 className="truncate text-sm font-medium tracking-tight sm:text-base">
              Motor and gearbox dimensioning
            </h1>
          </div>
          <div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-border p-0.5">
            <Button
              size="sm"
              variant={units === "metric" ? "secondary" : "ghost"}
              onClick={() => setUnits("metric")}
            >
              SI
            </Button>
            <Button
              size="sm"
              variant={units === "imperial" ? "secondary" : "ghost"}
              onClick={() => setUnits("imperial")}
            >
              US
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1400px] gap-1 px-4 pb-3 lg:hidden sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 flex-1 rounded-[var(--radius-sm)] text-sm font-medium",
                tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12 sm:px-6">
        <aside className={cn("lg:col-span-3 lg:block", tab === "app" ? "block" : "hidden")}>
          <ApplicationPicker />
        </aside>
        <section
          className={cn(
            "rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5 lg:col-span-4 lg:block",
            tab === "inputs" ? "block" : "hidden",
          )}
        >
          <InputPanel />
        </section>
        <section
          className={cn(
            "rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5 lg:col-span-5 lg:block",
            tab === "results" ? "block" : "hidden",
          )}
        >
          <ResultsPanel />
        </section>
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        Catalog units are sample Axion frames for engineering studies, not a vendor quote. Verify against
        manufacturer data, ambient derating and the applicable machinery standard before release.
      </footer>
    </div>
  );
}
