import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

export function FieldTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - 24);
      let left = r.left;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
      if (left < 12) left = 12;
      let top = r.bottom + 8;
      const approxH = 120;
      if (top + approxH > window.innerHeight - 8) top = Math.max(8, r.top - approxH - 8);
      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (!text) return null;

  return (
    <span className="inline-flex">
      <button
        ref={btnRef}
        type="button"
        className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        aria-label={`Help: ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!tipRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        <Info className="size-3.5" />
      </button>
      {open &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            className="fixed z-[80] w-[min(18rem,calc(100vw-1.5rem))] rounded-[var(--radius-md)] border border-border bg-card px-2.5 py-2 text-[11px] leading-snug text-muted-foreground shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
