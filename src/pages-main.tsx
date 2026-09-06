import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/app/app-shell";
import { ToolsHub } from "@/components/hub/tools-hub";
import { UnitsShell } from "@/components/units/units-shell";
import "@/styles.css";

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
  if (page === "axion") return <AppShell />;
  if (page === "units") return <UnitsShell />;
  return <ToolsHub />;
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <PagesApp />
  </StrictMode>,
);
