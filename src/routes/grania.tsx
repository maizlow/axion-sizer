import { createFileRoute } from "@tanstack/react-router";
import { GraniaShell } from "@/components/grania/grania-shell";

export const Route = createFileRoute("/grania")({ component: GraniaShell });
