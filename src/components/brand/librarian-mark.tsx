export function LibrarianMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <path
        d="M16 18 H30 L32 22 H48 V48 H16 Z"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M16 28 H48" stroke="var(--color-foreground)" strokeWidth="1.2" />
      <path d="M22 34 H42 M22 39 H38 M22 44 H34" stroke="var(--color-brand)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
