import { createFileRoute } from "@tanstack/react-router";
import { ToolsHub } from "@/components/hub/tools-hub";

export const Route = createFileRoute("/")({ component: ToolsHub });
