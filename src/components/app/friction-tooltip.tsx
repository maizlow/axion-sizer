import { useState } from "react";
import { Info } from "lucide-react";
import { FRICTION_REFS } from "@/lib/sizing/friction";

export function FrictionTooltip({ onPick }: { onPick: (mu: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Typical friction values"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-6 z-30 w-[min(22rem,calc(100vw-2.5rem))] rounded-[var(--radius-md)] border border-border bg-card p-2 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="px-1.5 pb-1.5 text-[11px] leading-snug text-muted-foreground">
            Typical dry kinetic μ. Click a row to fill the field. Confirm against your surface and contamination.
          </p>
          <ul className="max-h-64 overflow-y-auto">
            {FRICTION_REFS.map((row) => (
              <li key={row.pair}>
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-2 rounded-[var(--radius-xs)] px-1.5 py-1 text-left hover:bg-muted"
                  onClick={() => {
                    onPick(row.mu);
                    setOpen(false);
                  }}
                >
                  <span>
                    <span className="block text-xs text-foreground">{row.pair}</span>
                    <span className="block text-[10px] text-muted-foreground">{row.note}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {row.range}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}
