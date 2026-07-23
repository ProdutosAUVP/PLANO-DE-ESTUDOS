import { useEffect, useState } from "react";

/**
 * Anel de progresso do DS (Dashboard do Aluno): SVG com stroke-dashoffset
 * animado em 1.5s ease-out a partir do zero. Abaixo de 100px o anel entra
 * em modo compacto (percentual menor, sem rótulo interno).
 */
export function ProgressRing({
  pct,
  size = 132,
  label = "Concluído",
}: {
  pct: number;
  size?: number;
  label?: string;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [mounted, setMounted] = useState(false);
  const compact = size < 100;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const shown = mounted ? pct : 0;
  const offset = circumference * (1 - shown / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display leading-none font-bold text-foreground ${
            compact ? "text-base" : "text-3xl"
          }`}
        >
          {Math.round(pct)}%
        </span>
        {!compact && (
          <span className="mt-1 text-[10px] tracking-wider text-muted-foreground uppercase">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
