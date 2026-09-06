import {
  ArrowUpDown,
  Boxes,
  Cog,
  Fan,
  Gauge,
  Layers,
  MoveHorizontal,
  RotateCw,
  Sailboat,
  Truck,
  Wind,
} from "lucide-react";
import { APPLICATIONS } from "@/lib/sizing/applications";
import type { ApplicationId } from "@/lib/sizing/types";
import { cn } from "@/lib/cn";
import { useSizingStore } from "@/store/sizing-store";

const ICONS: Record<ApplicationId, typeof Cog> = {
  conveyor: Layers,
  "roller-conveyor": Boxes,
  crane: ArrowUpDown,
  winch: Sailboat,
  "ball-screw": MoveHorizontal,
  "vertical-lift": ArrowUpDown,
  "rack-pinion": Gauge,
  gantry: Truck,
  "rotary-table": RotateCw,
  mixer: Cog,
  fan: Wind,
  pump: Fan,
};

const GROUPS = [
  { id: "linear", label: "Linear motion" },
  { id: "lifting", label: "Lifting" },
  { id: "rotary", label: "Rotary" },
  { id: "process", label: "Process" },
] as const;

export function ApplicationPicker() {
  const applicationId = useSizingStore((s) => s.applicationId);
  const setApplication = useSizingStore((s) => s.setApplication);

  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((group) => {
        const items = APPLICATIONS.filter((a) => a.group === group.id);
        return (
          <section key={group.id}>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((app) => {
                const Icon = ICONS[app.id];
                const active = app.id === applicationId;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setApplication(app.id)}
                    className={cn(
                      "flex min-h-11 items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors",
                      active
                        ? "border-primary/40 bg-muted text-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/25 hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)]",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug">{app.name}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {app.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
