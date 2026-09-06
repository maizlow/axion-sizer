import { AxionMark } from "@/components/brand/axion-mark";
import { MetronMark } from "@/components/brand/metron-mark";

export function ToolMark({ id, className }: { id: string; className?: string }) {
  if (id === "units") return <MetronMark className={className} />;
  return <AxionMark className={className} />;
}
