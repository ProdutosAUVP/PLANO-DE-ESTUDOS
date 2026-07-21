import { Check, CircleDashed, Play } from "lucide-react";
import type { Status } from "@/lib/progress-store";

/**
 * Tag de status tokenizada (DS: Tags & Badges) — usa os tokens semânticos
 * da Escola: feito = success (âmbar), em andamento = warning, não iniciado = muted.
 */
const config: Record<
  Status,
  { label: string; classes: string; Icon: typeof Check }
> = {
  "nao-iniciado": {
    label: "Não iniciado",
    classes:
      "bg-muted text-muted-foreground border-border hover:border-primary/50",
    Icon: CircleDashed,
  },
  "em-andamento": {
    label: "Em andamento",
    classes:
      "bg-warning/15 text-warning-foreground border-warning/40 dark:text-warning",
    Icon: Play,
  },
  feito: {
    label: "Feito",
    classes: "bg-success/15 text-success border-success/40",
    Icon: Check,
  },
};

export function StatusBadge({
  status,
  onClick,
}: {
  status: Status;
  onClick?: () => void;
}) {
  const { label, classes, Icon } = config[status];
  return (
    <button
      type="button"
      onClick={onClick}
      title="Clique para alternar o status"
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all duration-[240ms] ease-out hover:scale-[1.04] active:scale-95 ${classes}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
