import { AxionMark } from "@/components/brand/axion-mark";
import { CaliperMark } from "@/components/brand/caliper-mark";
import { MetronMark } from "@/components/brand/metron-mark";
import { GraniaMark } from "@/components/brand/grania-mark";
import { LibrarianMark } from "@/components/brand/librarian-mark";

export function ToolMark({ id, className }: { id: string; className?: string }) {
  if (id === "units") return <MetronMark className={className} />;
  if (id === "caliper") return <CaliperMark className={className} />;
  if (id === "grania") return <GraniaMark className={className} />;
  if (id === "librarian") return <LibrarianMark className={className} />;
  return <AxionMark className={className} />;
}