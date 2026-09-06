import { ToolMark } from "@/components/brand/tool-mark";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import { TOOLS, toolHref } from "@/lib/tools";

export function AppsNav({ current }: { current?: string }) {
  const locale = useLocale((s) => s.locale);
  const ready = TOOLS.filter((t) => t.ready);

  return (
    <nav aria-label="Apps" className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
      {ready.map((tool) => {
        const active = current === tool.id;
        return (
          <a
            key={tool.id}
            href={toolHref(tool.path)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-2.5 text-sm font-medium sm:flex-none sm:min-w-[9.5rem]",
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <ToolMark id={tool.id} className="size-6 shrink-0 rounded-[4px]" />
            <span className="truncate">{locale === "sv" ? tool.nameSv : tool.name}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function AppCards() {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TOOLS.map((tool) => (
        <li key={tool.id} className="min-h-[7.5rem]">
          {tool.ready ? (
            <a
              href={toolHref(tool.path)}
              className="flex h-full min-h-[7.5rem] flex-col rounded-[var(--radius-lg)] border border-border bg-card p-4 hover:border-foreground/30"
            >
              <div className="flex items-start gap-3">
                <ToolMark id={tool.id} className="size-12 shrink-0 rounded-[var(--radius-sm)]" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{locale === "sv" ? tool.nameSv : tool.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {locale === "sv" ? tool.tagSv : tool.tag}
                  </p>
                </div>
              </div>
            </a>
          ) : (
            <div className="flex h-full min-h-[7.5rem] flex-col rounded-[var(--radius-lg)] border border-dashed border-border p-4 opacity-70">
              <div className="text-sm font-medium">{locale === "sv" ? tool.nameSv : tool.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t("hub.later")}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
