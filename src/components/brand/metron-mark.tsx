export function MetronMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="10" fill="var(--color-muted)" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="var(--color-foreground)" strokeWidth="1.4" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="var(--color-foreground)" strokeWidth="1.1" opacity="0.55" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * Math.PI) / 12;
        const inner = i % 3 === 0 ? 17.5 : 19.2;
        return (
          <line
            key={i}
            x1={32 + Math.sin(a) * inner}
            y1={32 - Math.cos(a) * inner}
            x2={32 + Math.sin(a) * 21.2}
            y2={32 - Math.cos(a) * 21.2}
            stroke="var(--color-foreground)"
            strokeWidth={i % 3 === 0 ? 1.6 : 1}
          />
        );
      })}
      <circle cx="32" cy="32" r="3.2" fill="var(--color-brand)" />
      <path d="M32 8.5 L35.2 15.2 L28.8 15.2 Z" fill="var(--color-brand)" />
    </svg>
  );
}
