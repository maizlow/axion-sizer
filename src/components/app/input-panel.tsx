import { RotateCcw } from "lucide-react";
import { getApplication } from "@/lib/sizing/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSizingStore } from "@/store/sizing-store";

export function InputPanel() {
  const applicationId = useSizingStore((s) => s.applicationId);
  const inputs = useSizingStore((s) => s.inputs);
  const setInput = useSizingStore((s) => s.setInput);
  const resetInputs = useSizingStore((s) => s.resetInputs);
  const app = getApplication(applicationId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium tracking-tight">{app.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{app.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetInputs} className="shrink-0">
          <RotateCcw className="size-3.5" />
          Defaults
        </Button>
      </div>

      {app.selects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {app.selects.map((sel) => (
            <label key={sel.key} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">{sel.label}</span>
              <select
                className="h-10 rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={String(inputs[sel.key] ?? sel.defaultValue)}
                onChange={(e) => setInput(sel.key, e.target.value)}
              >
                {sel.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-snug text-muted-foreground">{sel.hint}</span>
            </label>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {app.fields
          .filter((field) => {
            if (!field.visibleWhen) return true;
            const cur = String(inputs[field.visibleWhen.key] ?? "");
            return field.visibleWhen.values.includes(cur);
          })
          .map((field) => {
            const raw = inputs[field.key];
            const stored = typeof raw === "number" ? raw : Number(raw);
            const shown = Number.isFinite(stored) ? stored : "";
            return (
              <label key={field.key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">{field.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{field.unit}</span>
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={shown}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      setInput(field.key, "");
                      return;
                    }
                    const n = Number(v);
                    if (Number.isFinite(n)) setInput(field.key, n);
                  }}
                />
                <span className="text-xs leading-snug text-muted-foreground">{field.hint}</span>
              </label>
            );
          })}
      </div>
    </div>
  );
}
