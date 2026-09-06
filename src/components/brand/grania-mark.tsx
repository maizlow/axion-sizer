export function GraniaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <path
        d="M12 46 L20 34 L28 38 L38 24 L48 30 L54 18"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M14 48 H52" stroke="var(--color-foreground)" strokeWidth="1.4" />
      <path d="M14 48 V20" stroke="var(--color-foreground)" strokeWidth="1.4" />
      <circle cx="20" cy="34" r="1.6" fill="var(--color-foreground)" />
      <circle cx="38" cy="24" r="1.6" fill="var(--color-foreground)" />
    </svg>
  );
}
