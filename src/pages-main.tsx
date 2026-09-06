import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ToolsHub } from "@/components/hub/tools-hub";
import "@/styles.css";

const AppShell = lazy(() =>
  import("@/components/app/app-shell").then((m) => ({ default: m.AppShell })),
);
const UnitsShell = lazy(() =>
  import("@/components/units/units-shell").then((m) => ({ default: m.UnitsShell })),
);

function pageId(): "hub" | "axion" | "units" {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.endsWith("/axion")) return "axion";
  if (path.endsWith("/units")) return "units";
  return "hub";
}

function PagesApp() {
  const [page, setPage] = useState(pageId);
  useEffect(() => {
    const sync = () => setPage(pageId());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return (
    <Suspense fallback={null}>
      {page === "axion" ? <AppShell /> : page === "units" ? <UnitsShell /> : <ToolsHub />}
    </Suspense>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <PagesApp />
  </StrictMode>,
);
