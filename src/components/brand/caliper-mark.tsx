export function CaliperMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <path
        d="M14 18 H42 V22 H18 V46 H14 Z"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M28 20 L50 20 L50 28 L40 28 L36 46 L28 46 Z"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M18 26 H30" stroke="var(--color-brand)" strokeWidth="1.6" />
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={i}
          x1={20 + i * 3.2}
          y1={26}
          x2={20 + i * 3.2}
          y2={i % 2 === 0 ? 22.5 : 23.5}
          stroke="var(--color-brand)"
          strokeWidth="1.1"
        />
      ))}
      <circle cx="44" cy="24" r="2.2" fill="var(--color-brand)" />
    </svg>
  );
}
