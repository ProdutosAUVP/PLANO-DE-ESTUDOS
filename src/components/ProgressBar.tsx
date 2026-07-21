/**
 * Barra de progresso (DS: Progress Bar estilo Geist) — trilha clara,
 * preenchimento sólido e cantos totalmente arredondados.
 * Aos 100% o preenchimento muda para o token success.
 */
export function ProgressBar({
  value,
  label,
  size = "md",
}: {
  value: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const complete = value >= 100;
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span className="font-bold tracking-wider uppercase">{label}</span>
          <span
            className={`font-bold ${complete ? "text-success" : "text-foreground"}`}
          >
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-muted ${size === "sm" ? "h-1.5" : "h-2"}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            complete ? "bg-success" : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
