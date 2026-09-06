import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const AppShell = lazy(() =>
  import("@/components/app/app-shell").then((m) => ({ default: m.AppShell })),
);

export const Route = createFileRoute("/axion")({
  component: function AxionPage() {
    return (
      <Suspense fallback={null}>
        <AppShell />
      </Suspense>
    );
  },
});
