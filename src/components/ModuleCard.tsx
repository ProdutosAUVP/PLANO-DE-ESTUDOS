import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Module } from "@/data/curriculum";
import { durationToSeconds, formatSeconds } from "@/data/curriculum";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import type { Status } from "@/lib/progress-store";

export function ModuleCard({
  module,
  progress,
  onCycle,
  defaultOpen,
}: {
  module: Module;
  progress: Record<string, Status>;
  onCycle: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const stats = useMemo(() => {
    const total = module.lessons.length;
    const done = module.lessons.filter((l) => progress[l.id] === "feito").length;
    const totalSec = module.lessons.reduce((a, l) => a + durationToSeconds(l.duration), 0);
    const doneSec = module.lessons
      .filter((l) => progress[l.id] === "feito")
      .reduce((a, l) => a + durationToSeconds(l.duration), 0);
    return { total, done, pct: total ? (done / total) * 100 : 0, totalSec, doneSec };
  }, [module, progress]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {module.index !== null ? `M${module.index}` : "★"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-base font-semibold text-foreground">{module.title}</h3>
            <span className="text-xs text-muted-foreground">{module.subtitle}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{module.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{stats.done}</strong>/{stats.total} aulas</span>
            <span><strong className="text-foreground">{formatSeconds(stats.doneSec)}</strong> / {formatSeconds(stats.totalSec)}</span>
          </div>
          <div className="mt-3"><ProgressBar value={stats.pct} /></div>
        </div>
        <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {module.lessons.map((l) => {
            const status = progress[l.id] ?? "nao-iniciado";
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">{l.number}</span>
                <span className={`flex-1 text-sm ${status === "feito" ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.title}</span>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">{l.duration}</span>
                <StatusBadge status={status} onClick={() => onCycle(l.id)} />
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}