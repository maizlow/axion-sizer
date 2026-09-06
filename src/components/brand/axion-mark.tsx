export function AxionMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <path
        d="M32 12 L48 52 H40.5 L37.2 43 H26.8 L23.5 52 H16 Z"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M28.2 39 H35.8 L32 29 Z" fill="var(--color-brand)" />
      <path
        d="M18 34 A14 14 0 0 1 32 22"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M46 34 A14 14 0 0 0 32 22"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
