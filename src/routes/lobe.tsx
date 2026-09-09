import { createFileRoute } from "@tanstack/react-router";
import { LobeShell } from "@/components/lobe/lobe-shell";

export const Route = createFileRoute("/lobe")({ component: LobeShell });
