import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { Module } from "@/data/curriculum";
import {
  durationToSeconds,
  formatSeconds,
  getLessonUrl,
} from "@/data/curriculum";
import { getModuleIcon } from "@/lib/module-icons";
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
    const done = module.lessons.filter(
      (l) => progress[l.id] === "feito",
    ).length;
    const totalSec = module.lessons.reduce(
      (a, l) => a + durationToSeconds(l.duration),
      0,
    );
    const doneSec = module.lessons
      .filter((l) => progress[l.id] === "feito")
      .reduce((a, l) => a + durationToSeconds(l.duration), 0);
    return {
      total,
      done,
      pct: total ? (done / total) * 100 : 0,
      totalSec,
      doneSec,
    };
  }, [module, progress]);

  const Icon = getModuleIcon(module.id);
  const complete = stats.done === stats.total && stats.total > 0;

  return (
    <article
      id={`module-${module.id}`}
      className={`scroll-mt-4 overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)] transition-all duration-[240ms] ease-out ${
        // Fechado: hover com elevação; expandido: sem nenhum efeito de hover.
        open ? "" : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
      } ${complete ? "border-success/40" : `border-border ${open ? "" : "hover:border-primary/40"}`}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
        aria-expanded={open}
      >
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-[240ms] sm:size-12 ${
            complete
              ? "bg-success/15 text-success"
              : "bg-accent/10 text-primary-emphasis"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs font-bold tracking-widest text-primary-emphasis uppercase">
              {module.index !== null
                ? `Módulo ${String(module.index).padStart(2, "0")}`
                : "Bônus"}
            </span>
            <span className="text-xs text-muted-foreground">
              {module.subtitle}
            </span>
          </div>
          <h3 className="font-display mt-0.5 text-lg leading-snug font-bold text-foreground">
            {module.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {module.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">{stats.done}</strong>/
              {stats.total} aulas
            </span>
            <span>
              <strong className="text-foreground">
                {formatSeconds(stats.doneSec)}
              </strong>{" "}
              / {formatSeconds(stats.totalSec)}
            </span>
            {complete && (
              <span className="font-bold tracking-wider text-success uppercase">
                Concluído
              </span>
            )}
          </div>
          <div className="mt-3">
            <ProgressBar value={stats.pct} size="sm" />
          </div>
        </div>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-[240ms] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="animate-in fade-in slide-in-from-top-1 divide-y divide-border border-t border-border duration-300">
          {module.lessons.map((l) => {
            const status = progress[l.id] ?? "nao-iniciado";
            return (
              <li
                key={l.id}
                className="flex items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-muted/50 sm:gap-3 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {l.number} · {l.duration}
                  </div>
                  <p
                    className={`mt-0.5 text-sm leading-snug transition-colors duration-[240ms] ${
                      status === "feito"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {l.title}
                  </p>
                </div>
                <a
                  href={getLessonUrl(l)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir aula na plataforma"
                  aria-label={`Abrir a aula "${l.title}" na plataforma`}
                  className="shrink-0 rounded-full p-2 text-muted-foreground transition-all duration-[240ms] ease-out hover:bg-accent/10 hover:text-primary-emphasis active:scale-90"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <StatusBadge status={status} onClick={() => onCycle(l.id)} />
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
