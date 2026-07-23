import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import { buildSchedule } from "@/lib/schedule";
import { formatSeconds, getLessonUrl, modules } from "@/data/curriculum";
import type { Status } from "@/lib/progress-store";
import { StatusBadge } from "./StatusBadge";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));

export function StudyCalendar({
  meta,
  progress,
  onCycle,
}: {
  meta: {
    startDate: string;
    plan: string;
    targetDate?: string;
    studyDays?: number[];
  };
  progress: Record<string, Status>;
  onCycle: (id: string) => void;
}) {
  const {
    byDate,
    endDateISO,
    overdueLessons,
    overdueSeconds,
    isLate,
    todayISO,
  } = useMemo(() => buildSchedule(meta, progress), [meta, progress]);

  const startDate = new Date(meta.startDate + "T00:00:00");
  const [cursor, setCursor] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ dateISO: string; day: number } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateISO = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ dateISO, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDay = selected ? byDate.get(selected) : null;

  if (!endDateISO) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="font-display text-xl font-bold text-primary-emphasis">
          Calendário de estudos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina uma data alvo no plano <strong>Livre</strong> ou escolha um
          plano fixo para gerar seu calendário automaticamente.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary-emphasis uppercase">
            Calendário
          </p>
          <h2 className="font-display mt-1 text-xl font-bold text-primary-emphasis sm:text-2xl">
            Suas aulas, dia a dia
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cronograma de {startDate.toLocaleDateString("pt-BR")} até{" "}
            {new Date(endDateISO + "T00:00:00").toLocaleDateString("pt-BR")}.
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-full border border-border p-2 text-foreground transition-all duration-[240ms] ease-out hover:bg-muted active:scale-90"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-display min-w-[10rem] text-center text-sm font-bold text-foreground">
            {MONTHS[month]} {year}
          </div>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-full border border-border p-2 text-foreground transition-all duration-[240ms] ease-out hover:bg-muted active:scale-90"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {isLate && (
        <div className="animate-in fade-in slide-in-from-top-1 mt-5 flex flex-wrap items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 duration-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-destructive">
              Você está atrasado em {overdueLessons.length} aula
              {overdueLessons.length > 1 ? "s" : ""} (
              {formatSeconds(overdueSeconds)})
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground">
              <RefreshCw className="h-3 w-3 text-primary-emphasis" />
              Sua rota foi recalculada — as aulas pendentes foram redistribuídas
              nos próximos dias de estudo até{" "}
              {new Date(endDateISO + "T00:00:00").toLocaleDateString("pt-BR")}.
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="aspect-square" />;
          const day = byDate.get(c.dateISO);
          const beforeStart = c.dateISO < startDate.toISOString().slice(0, 10);
          const isPast = c.dateISO < todayISO;
          const isToday = c.dateISO === todayISO;
          const isSelected = selected === c.dateISO;
          const hasLessons = (day?.lessons.length ?? 0) > 0;
          const missed = day?.missedLessons?.length ?? 0;
          const isOverdueDay = isPast && missed > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                hasLessons && setSelected(isSelected ? null : c.dateISO)
              }
              disabled={!hasLessons}
              className={[
                "flex aspect-square flex-col rounded-md border p-1 text-left transition-all duration-[240ms] ease-out sm:rounded-lg sm:p-1.5",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)] ring-2 ring-primary/30"
                  : isOverdueDay
                    ? "border-destructive/50 bg-destructive/10 hover:border-destructive"
                    : hasLessons
                      ? "border-border bg-background hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm"
                      : "cursor-default border-transparent bg-muted/20",
                beforeStart && !hasLessons ? "opacity-40" : "",
                isPast && !isOverdueDay && !hasLessons ? "opacity-50" : "",
                isPast && hasLessons && !isOverdueDay ? "opacity-70" : "",
              ].join(" ")}
            >
              <div
                className={`text-xs font-semibold ${isToday ? "text-primary-foreground" : "text-foreground"}`}
              >
                {isToday ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold">
                    {c.day}
                  </span>
                ) : (
                  c.day
                )}
              </div>
              {hasLessons && day && (
                <div className="mt-auto space-y-0.5">
                  <div
                    className={`text-[10px] font-bold ${
                      isOverdueDay
                        ? "text-destructive"
                        : "text-primary-emphasis"
                    }`}
                  >
                    {day.lessons.length}
                    <span className="hidden sm:inline">
                      {" "}
                      aula{day.lessons.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Duração some no mobile — célula pequena demais */}
                  <div className="hidden text-[9px] text-muted-foreground sm:block">
                    {formatSeconds(day.totalSeconds)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <Legend swatch="bg-primary" label="Programado" />
        <Legend swatch="bg-destructive" label="Atrasado" />
      </div>

      {selectedDay && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6 rounded-xl border border-border bg-muted/30 p-4 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold tracking-wider text-primary-emphasis uppercase">
                {new Date(selectedDay.dateISO + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  },
                )}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {selectedDay.lessons.length} aula
                {selectedDay.lessons.length > 1 ? "s" : ""} ·{" "}
                {formatSeconds(selectedDay.totalSeconds)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedDay.missedLessons &&
            selectedDay.missedLessons.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>
                  {selectedDay.missedLessons.length} aula
                  {selectedDay.missedLessons.length > 1 ? "s" : ""} não{" "}
                  {selectedDay.missedLessons.length > 1
                    ? "foram concluídas"
                    : "foi concluída"}{" "}
                  — já foram remarcadas para os próximos dias.
                </span>
              </div>
            )}

          <ul className="mt-3 space-y-2">
            {selectedDay.lessons.map((l) => {
              const status = progress[l.id] ?? "nao-iniciado";
              const isPastDay = selectedDay.dateISO < todayISO;
              const wasMissed = isPastDay && status !== "feito";
              return (
                <li
                  key={l.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-150 sm:gap-3 ${
                    wasMissed
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug font-medium text-foreground">
                      {l.number} · {l.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {moduleTitleById.get(l.moduleId)} · {l.duration}
                      {wasMissed && (
                        <span className="ml-2 font-semibold text-destructive">
                          · Atrasada
                        </span>
                      )}
                    </div>
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
        </div>
      )}
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}
