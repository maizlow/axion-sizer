import { AppCards } from "@/components/hub/apps-nav";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function ToolsHub() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Abece</div>
            <h1 className="text-base font-medium tracking-tight sm:text-lg">{t("hub.title")}</h1>
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

      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <p className="max-w-xl text-sm text-muted-foreground">{t("hub.intro")}</p>
        <div className="mt-6">
          <AppCards />
        </div>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs leading-relaxed text-muted-foreground sm:px-6">
        {t("hub.footer")}
      </footer>
    </div>
  );
}
