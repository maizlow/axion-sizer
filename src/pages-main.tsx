import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/app/app-shell";
import { CaliperShell } from "@/components/caliper/caliper-shell";
import { GraniaShell } from "@/components/grania/grania-shell";
import { LibrarianShell } from "@/components/librarian/librarian-shell";
import { LobeShell } from "@/components/lobe/lobe-shell";
import { ToolsHub } from "@/components/hub/tools-hub";
import { UnitsShell } from "@/components/units/units-shell";
import "@/styles.css";

function pageId(): "hub" | "axion" | "units" | "caliper" | "librarian" | "grania" | "lobe" {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.endsWith("/axion")) return "axion";
  if (path.endsWith("/units")) return "units";
  if (path.endsWith("/caliper")) return "caliper";
  if (path.endsWith("/librarian")) return "librarian";
  if (path.endsWith("/grania")) return "grania";
  if (path.endsWith("/lobe")) return "lobe";
  return "hub";
}

function PagesApp() {
  const [page, setPage] = useState(pageId);
  useEffect(() => {
    const sync = () => setPage(pageId());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  if (page === "axion") return <AppShell />;
  if (page === "units") return <UnitsShell />;
  if (page === "caliper") return <CaliperShell />;
  if (page === "librarian") return <LibrarianShell />;
  if (page === "grania") return <GraniaShell />;
  if (page === "lobe") return <LobeShell />;
  return <ToolsHub />;
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <PagesApp />
  </StrictMode>,
);
