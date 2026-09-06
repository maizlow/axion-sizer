import { createFileRoute } from "@tanstack/react-router";
import { UnitsShell } from "@/components/units/units-shell";

export const Route = createFileRoute("/units")({ component: UnitsShell });
