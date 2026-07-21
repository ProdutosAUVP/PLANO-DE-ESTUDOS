import {
  modules,
  allLessons,
  totalSeconds,
  formatSeconds,
  durationToSeconds,
} from "@/data/curriculum";
import { ProgressBar } from "./ProgressBar";
import type { Status } from "@/lib/progress-store";

const PLAN_WEEKS: Record<string, number> = {
  "1m": 4,
  "2m": 8,
  "3m": 13,
  "6m": 26,
  livre: 0,
};

type Plan = "1m" | "2m" | "3m" | "6m" | "livre";
type Meta = {
  startDate: string;
  plan: Plan;
  targetDate?: string;
  studyDays?: number[];
};

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function PlanHeader({
  progress,
  meta,
  setMeta,
  onReset,
}: {
  progress: Record<string, Status>;
  meta: Meta;
  setMeta: (m: Meta) => void;
  onReset: () => void;
}) {
  const doneLessons = allLessons.filter((l) => progress[l.id] === "feito");
  const doneSec = doneLessons.reduce(
    (a, l) => a + durationToSeconds(l.duration),
    0,
  );
  const pct = (doneLessons.length / allLessons.length) * 100;

  const start = new Date(meta.startDate);
  let endDate: Date | null = null;
  if (meta.plan === "livre") {
    if (meta.targetDate) endDate = new Date(meta.targetDate);
  } else {
    const w = PLAN_WEEKS[meta.plan];
    endDate = new Date(start.getTime() + w * 7 * 86400000);
  }

  const weeks = endDate
    ? Math.max(
        1,
        Math.ceil((endDate.getTime() - start.getTime()) / (7 * 86400000)),
      )
    : 0;
  const studyDays =
    meta.studyDays && meta.studyDays.length > 0
      ? meta.studyDays
      : [0, 1, 2, 3, 4, 5, 6];
  const daysPerWeek = studyDays.length;
  const weeklyMinutes =
    weeks > 0 ? Math.round((totalSeconds - doneSec) / 60 / weeks) : 0;
  const dailyMinutes =
    weeks > 0 && daysPerWeek > 0
      ? Math.round((totalSeconds - doneSec) / 60 / (weeks * daysPerWeek))
      : 0;
  const end = endDate ? endDate.toLocaleDateString("pt-BR") : "—";

  const toggleDay = (d: number) => {
    const cur = new Set(studyDays);
    if (cur.has(d)) cur.delete(d);
    else cur.add(d);
    setMeta({ ...meta, studyDays: Array.from(cur).sort() });
  };

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            AUVP Escola · Plano de Estudos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Acompanhe sua jornada de investidor
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Inspirado no plano da Tera, com toda a grade da AUVP Escola: 7
            módulos + bônus, mais de 100 aulas. Marque seu progresso e organize
            seu ritmo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Resetar todo o progresso?")) onReset();
          }}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          Resetar progresso
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          Plano
          <select
            value={meta.plan}
            onChange={(e) => setMeta({ ...meta, plan: e.target.value as Plan })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="1m">1 mês — intensivo</option>
            <option value="2m">8 semanas — recomendado AUVP</option>
            <option value="3m">3 meses — equilibrado</option>
            <option value="6m">6 meses — leve</option>
            <option value="livre">Livre</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          Data de início
          <input
            type="date"
            value={meta.startDate}
            onChange={(e) => setMeta({ ...meta, startDate: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        {meta.plan === "livre" ? (
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Data alvo de término
            <input
              type="date"
              min={meta.startDate || todayISO}
              value={meta.targetDate ?? ""}
              onChange={(e) => setMeta({ ...meta, targetDate: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        ) : (
          <div className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Conclusão prevista
            <div className="rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-foreground">
              {end}
            </div>
          </div>
        )}
      </div>

      {meta.plan === "livre" && (
        <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-foreground">
          {meta.targetDate ? (
            <>
              Conclusão prevista: <strong>{end}</strong> · {weeks} semana
              {weeks > 1 ? "s" : ""} de estudo.
            </>
          ) : (
            "Defina uma data alvo para calcular o ritmo sugerido."
          )}
        </div>
      )}

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Dias de estudo
          </span>
          <span className="text-[11px] text-muted-foreground">
            {daysPerWeek} dia{daysPerWeek !== 1 ? "s" : ""} por semana
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WEEKDAY_LABELS.map((l, i) => {
            const active = studyDays.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                aria-pressed={active}
                title={WEEKDAY_NAMES[i]}
                className={[
                  "h-9 w-9 rounded-full border text-xs font-semibold transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
                ].join(" ")}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={pct} label="Progresso geral" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat
          label="Aulas concluídas"
          value={`${doneLessons.length}/${allLessons.length}`}
        />
        <Stat label="Tempo assistido" value={formatSeconds(doneSec)} />
        <Stat
          label="Por semana"
          value={weeklyMinutes ? `${weeklyMinutes} min` : "—"}
        />
        <Stat
          label="Por dia de estudo"
          value={dailyMinutes ? `${dailyMinutes} min` : "—"}
        />
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Carga total:{" "}
        <strong className="text-foreground">
          {formatSeconds(totalSeconds)}
        </strong>{" "}
        em {modules.length} módulos.
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
