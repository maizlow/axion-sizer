export function LobeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <path d="M12 46 H52 M12 46 V18" fill="none" stroke="var(--color-foreground)" strokeWidth="1.4" />
      <path
        d="M16 42 C22 42 24 22 32 22 C40 22 42 36 50 28"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="42" r="2.2" fill="var(--color-foreground)" />
      <circle cx="32" cy="22" r="2.2" fill="var(--color-foreground)" />
      <circle cx="50" cy="28" r="2.2" fill="var(--color-foreground)" />
    </svg>
  );
}
