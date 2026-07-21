import type { Status } from "@/lib/progress-store";

const labels: Record<Status, string> = {
  "nao-iniciado": "Não iniciado",
  "em-andamento": "Em andamento",
  feito: "Feito!",
};

const styles: Record<Status, string> = {
  "nao-iniciado": "bg-muted text-muted-foreground border-border",
  "em-andamento": "bg-accent/15 text-accent border-accent/30",
  feito: "bg-primary/15 text-primary border-primary/40",
};

export function StatusBadge({
  status,
  onClick,
}: {
  status: Status;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all hover:scale-105 ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </button>
  );
}