import { createFileRoute } from "@tanstack/react-router";
import { CaliperShell } from "@/components/caliper/caliper-shell";

export const Route = createFileRoute("/caliper")({ component: CaliperShell });
