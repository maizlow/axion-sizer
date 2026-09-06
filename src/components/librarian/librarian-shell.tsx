import { LibrarianMark } from "@/components/brand/librarian-mark";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { hubHref } from "@/lib/tools";
import { Moon, Sun } from "lucide-react";

export function LibrarianShell() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const notes = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`librarian.n${n}`));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-2 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <LibrarianMark className="size-8" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                  <a href={hubHref()} className="hover:text-foreground">
                    {t("hub.short")}
                  </a>
                  <span className="mx-1.5 text-border">/</span>
                  {t("librarian.name")}
                </div>
                <h1 className="truncate text-xs font-medium tracking-tight sm:text-base">{t("librarian.tag")}</h1>
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

      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-6">
        <aside className="rounded-[var(--radius-md)] border border-warn/40 bg-warn/10 px-4 py-3 text-sm" role="status">
          <p className="font-medium">{t("librarian.dead")}</p>
          <p className="mt-1 text-muted-foreground">{t("librarian.deadBody")}</p>
        </aside>

        <section className="rounded-[var(--radius-lg)] border border-dashed border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("librarian.idea")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("librarian.ideaBody")}</p>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-medium">{t("librarian.plan")}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {notes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>

        <section className="pointer-events-none select-none rounded-[var(--radius-lg)] border border-border bg-card p-4 opacity-55 sm:p-5">
          <h2 className="text-sm font-medium">{t("librarian.ask")}</h2>
          <div className="mt-3 h-24 rounded-[var(--radius-md)] border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
            {t("librarian.askHint")}
          </div>
          <button
            type="button"
            disabled
            className="mt-3 h-9 rounded-[var(--radius-sm)] border border-border px-3 text-sm text-muted-foreground"
          >
            {t("librarian.send")}
          </button>
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        {t("hub.footer")}
      </footer>
    </div>
  );
}
