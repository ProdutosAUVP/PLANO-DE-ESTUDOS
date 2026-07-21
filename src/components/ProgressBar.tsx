export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium text-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: "var(--gradient-primary)" }}
        />
      </div>
    </div>
  );
}