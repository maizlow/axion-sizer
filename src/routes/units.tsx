import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const UnitsShell = lazy(() =>
  import("@/components/units/units-shell").then((m) => ({ default: m.UnitsShell })),
);

export const Route = createFileRoute("/units")({
  component: function UnitsPage() {
    return (
      <Suspense fallback={null}>
        <UnitsShell />
      </Suspense>
    );
  },
});
