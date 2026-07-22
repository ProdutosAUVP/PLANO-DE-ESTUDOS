import {
  CalendarDays,
  Clock,
  Flame,
  Gauge,
  PlayCircle,
  SlidersHorizontal,
  Timer,
} from "lucide-react";
import {
  modules,
  allLessons,
  totalSeconds,
  formatSeconds,
  durationToSeconds,
} from "@/data/curriculum";
import { computeStreak, lastSevenDays } from "@/lib/progress-store";
import type { ActivityMap, Status } from "@/lib/progress-store";
import { PERIOD_LABELS, STYLE_LABELS, STYLE_TIPS } from "@/lib/profile-store";
import type { Profile } from "@/lib/profile-store";
import { getModuleIcon } from "@/lib/module-icons";
import { useCountUp } from "@/hooks/use-count-up";
import { ProgressRing } from "./ProgressRing";
import { ThemeToggle } from "./ThemeToggle";
import logoHorizontal from "@/assets/logos/auvp-escola-horizontal-amarelo.svg";

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

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

const PLAN_OPTIONS: Array<{ value: Plan; label: string; hint: string }> = [
  { value: "1m", label: "1 mês", hint: "Intensivo" },
  { value: "2m", label: "8 semanas", hint: "Recomendado AUVP" },
  { value: "3m", label: "3 meses", hint: "Equilibrado" },
  { value: "6m", label: "6 meses", hint: "Leve" },
  { value: "livre", label: "Livre", hint: "Você define a data" },
];

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
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function PlanHeader({
  progress,
  activity,
  meta,
  setMeta,
  onReset,
  profile,
  onEditProfile,
}: {
  progress: Record<string, Status>;
  activity: ActivityMap;
  meta: Meta;
  setMeta: (m: Meta) => void;
  onReset: () => void;
  profile: Profile;
  onEditProfile: () => void;
}) {
  const doneLessons = allLessons.filter((l) => progress[l.id] === "feito");
  const doneSec = doneLessons.reduce(
    (a, l) => a + durationToSeconds(l.duration),
    0,
  );
  const pct = (doneLessons.length / allLessons.length) * 100;

  const start = new Date(meta.startDate + "T00:00:00");
  let endDate: Date | null = null;
  if (meta.plan === "livre") {
    if (meta.targetDate) endDate = new Date(meta.targetDate + "T00:00:00");
  } else {
    const w = PLAN_WEEKS[meta.plan];
    endDate = new Date(start.getTime() + (w * 7 - 1) * 86400000);
  }

  const studyDays =
    meta.studyDays && meta.studyDays.length > 0
      ? meta.studyDays
      : [0, 1, 2, 3, 4, 5, 6];
  const daysPerWeek = studyDays.length;

  // Ritmo necessário: tempo restante dividido pelos dias de estudo que faltam.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let remainingStudyDays = 0;
  if (endDate) {
    const cursor = new Date(Math.max(today.getTime(), start.getTime()));
    const set = new Set(studyDays);
    while (cursor <= endDate) {
      if (set.has(cursor.getDay())) remainingStudyDays++;
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  const remainingSec = totalSeconds - doneSec;
  const dailyMinutes =
    remainingStudyDays > 0
      ? Math.round(remainingSec / 60 / remainingStudyDays)
      : 0;
  const end = endDate ? endDate.toLocaleDateString("pt-BR") : "—";

  const streak = computeStreak(activity, meta.studyDays);
  const week = lastSevenDays(activity);
  const doneThisWeek = week.reduce((a, d) => a + d.count, 0);
  const maxWeekCount = Math.max(1, ...week.map((d) => d.count));

  const animatedDone = useCountUp(doneLessons.length);

  const toggleDay = (d: number) => {
    const cur = new Set(studyDays);
    if (cur.has(d)) cur.delete(d);
    else cur.add(d);
    setMeta({ ...meta, studyDays: Array.from(cur).sort() });
  };

  const todayISO = today.toISOString().slice(0, 10);

  const scrollToModule = (id: string) => {
    document
      .getElementById(`module-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="bg-spotlight relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoHorizontal}
              alt="AUVP Escola"
              className="h-8 w-auto"
            />
            <span className="border-l border-border pl-3 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Plano de Estudos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onEditProfile}
              title="Personalizar experiência"
              aria-label="Personalizar experiência"
              className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-all duration-[240ms] ease-out hover:border-primary/50 hover:text-foreground hover:shadow-sm active:scale-95"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Resetar todo o progresso?")) onReset();
              }}
              className="btn-cta rounded-full border border-border px-4 py-2 text-muted-foreground transition-all duration-[240ms] ease-out hover:border-destructive hover:text-destructive active:scale-95"
            >
              Resetar
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {profile.name
                ? `${greeting()}, ${profile.name}`
                : "Acompanhe sua jornada de investidor"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.name
                ? `Sua jornada de investidor continua: ${modules.length} módulos da AUVP Escola no seu ritmo, no seu calendário.`
                : `Toda a grade da AUVP Escola — ${modules.length} módulos e mais de 100 aulas — com seu ritmo, seu calendário e seu progresso em um só lugar.`}
            </p>

            {/* Perfil de estudo (definido no onboarding) */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ProfileChip icon={<Clock className="h-3 w-3" />}>
                {profile.minutesPerDay} min/dia
              </ProfileChip>
              <ProfileChip icon={<CalendarDays className="h-3 w-3" />}>
                {daysPerWeek} dia{daysPerWeek !== 1 ? "s" : ""}/semana
              </ProfileChip>
              <ProfileChip icon={<Timer className="h-3 w-3" />}>
                {STYLE_LABELS[profile.style]}
              </ProfileChip>
              <ProfileChip icon={<Flame className="h-3 w-3" />}>
                {PERIOD_LABELS[profile.period]}
              </ProfileChip>
              <button
                type="button"
                onClick={onEditProfile}
                className="text-[11px] font-bold tracking-wider text-primary-emphasis uppercase underline-offset-4 transition-colors duration-150 hover:underline"
              >
                Editar
              </button>
            </div>

            {/* Jornada por módulos (DS: Jornada do Herói) — ícones por módulo,
                bônus separados por uma linha fina e o rótulo "Bônus" */}
            <div className="mt-6 max-w-2xl">
              <div className="flex items-center gap-1 select-none sm:gap-1.5">
                {modules
                  .filter((m) => m.index !== null)
                  .map((m, i) => (
                    <span
                      key={m.id}
                      className="flex min-w-0 items-center gap-1 sm:gap-1.5"
                    >
                      {i > 0 && <JourneyConnector />}
                      <JourneyDot
                        module={m}
                        progress={progress}
                        onClick={() => scrollToModule(m.id)}
                      />
                    </span>
                  ))}
                <span className="mx-1.5 h-6 w-px shrink-0 bg-border sm:mx-2" />
                <span className="shrink-0 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Bônus
                </span>
                <span className="mx-1.5 h-6 w-px shrink-0 bg-border sm:mx-2" />
                {modules
                  .filter((m) => m.index === null)
                  .map((m, i) => (
                    <span
                      key={m.id}
                      className="flex min-w-0 items-center gap-1 sm:gap-1.5"
                    >
                      {i > 0 && <JourneyConnector />}
                      <JourneyDot
                        module={m}
                        progress={progress}
                        onClick={() => scrollToModule(m.id)}
                      />
                    </span>
                  ))}
              </div>
              <p className="mt-2 text-[11px] tracking-wider text-muted-foreground uppercase">
                Clique em um ícone para ir ao módulo
              </p>
            </div>
          </div>

          <ProgressRing pct={pct} />
        </div>
      </section>

      {/* ============ KPIs (DS: Dashboard do Aluno) ============ */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<PlayCircle className="h-5 w-5" />}
          label="Aulas concluídas"
          value={`${Math.round(animatedDone)}/${allLessons.length}`}
          badge={doneThisWeek > 0 ? `+${doneThisWeek} na semana` : null}
          tone="success"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Tempo assistido"
          value={formatSeconds(doneSec)}
          badge={null}
          tone="neutral"
        />
        <StatCard
          icon={<Gauge className="h-5 w-5" />}
          label="Ritmo por dia de estudo"
          value={dailyMinutes ? `${dailyMinutes} min` : "—"}
          badge={endDate ? `até ${end}` : null}
          tone="neutral"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Sequência de estudos"
          value={`${streak} dia${streak !== 1 ? "s" : ""}`}
          badge={streak >= 3 ? "Em chamas" : null}
          tone="warning"
        />
      </div>

      {/* ============ Config + Atividade semanal ============ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">
            Configure seu plano
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((opt) => {
              const active = meta.plan === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMeta({ ...meta, plan: opt.value })}
                  title={opt.hint}
                  aria-pressed={active}
                  className={`btn-cta rounded-full border px-4 py-2.5 transition-all duration-[240ms] ease-out ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-sm"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {PLAN_OPTIONS.find((o) => o.value === meta.plan)?.hint}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Data de início
              <input
                type="date"
                value={meta.startDate}
                onChange={(e) =>
                  setMeta({ ...meta, startDate: e.target.value })
                }
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal normal-case transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
              />
            </label>
            {meta.plan === "livre" ? (
              <label className="flex flex-col gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Data alvo de término
                <input
                  type="date"
                  min={meta.startDate || todayISO}
                  value={meta.targetDate ?? ""}
                  onChange={(e) =>
                    setMeta({ ...meta, targetDate: e.target.value })
                  }
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal normal-case transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
                />
              </label>
            ) : (
              <div className="flex flex-col gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Conclusão prevista
                <div className="rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm font-normal normal-case text-foreground">
                  {end}
                </div>
              </div>
            )}
          </div>

          {meta.plan === "livre" && !meta.targetDate && (
            <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
              Defina uma data alvo para calcular o ritmo sugerido e gerar o
              calendário.
            </div>
          )}

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
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
                    className={`h-9 w-9 rounded-full border text-xs font-bold transition-all duration-[240ms] ease-out ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:scale-110 hover:border-primary/60 hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {dailyMinutes > profile.minutesPerDay && (
            <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
              O plano atual pede <strong>{dailyMinutes} min</strong> por dia de
              estudo, acima dos <strong>{profile.minutesPerDay} min</strong> que
              você informou ter. Considere um plano mais longo, mais dias de
              estudo, ou atualize seu perfil.
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Carga total:{" "}
            <strong className="text-foreground">
              {formatSeconds(totalSeconds)}
            </strong>{" "}
            em {modules.length} módulos.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-foreground">
              Atividade semanal
            </h2>
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {doneThisWeek} aula{doneThisWeek !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-5 flex h-36 items-end gap-2">
            {week.map((d) => {
              const date = new Date(d.dateISO + "T00:00:00");
              const isToday = d.dateISO === todayISO;
              const h =
                d.count > 0 ? Math.max(12, (d.count / maxWeekCount) * 100) : 0;
              return (
                <div
                  key={d.dateISO}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                  title={`${WEEKDAY_SHORT[date.getDay()]}: ${d.count} aula${d.count !== 1 ? "s" : ""} concluída${d.count !== 1 ? "s" : ""}`}
                >
                  <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-md bg-muted/60">
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                        isToday
                          ? "bg-primary"
                          : "bg-primary/60 group-hover:bg-primary/80"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[10px] tracking-wider uppercase ${
                      isToday
                        ? "font-bold text-primary-emphasis"
                        : "text-muted-foreground"
                    }`}
                  >
                    {WEEKDAY_SHORT[date.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {STYLE_TIPS[profile.style]}
          </p>
        </section>
      </div>
    </>
  );
}

function JourneyConnector() {
  return (
    <span className="h-px w-1.5 shrink-0 bg-border sm:w-2.5" aria-hidden />
  );
}

function JourneyDot({
  module: m,
  progress,
  onClick,
}: {
  module: (typeof modules)[number];
  progress: Record<string, Status>;
  onClick: () => void;
}) {
  const Icon = getModuleIcon(m.id);
  const total = m.lessons.length;
  const done = m.lessons.filter((l) => progress[l.id] === "feito").length;
  const isComplete = done === total && total > 0;
  const started = done > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${m.title} — ${done}/${total} aulas`}
      className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-[240ms] ease-out hover:scale-110 sm:size-8 ${
        isComplete
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : started
            ? "border-primary/60 bg-primary/10 text-primary-emphasis"
            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function ProfileChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
      <span className="text-primary-emphasis">{icon}</span>
      {children}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  badge,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge: string | null;
  tone: "success" | "warning" | "neutral";
}) {
  const badgeClasses =
    tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : tone === "warning"
        ? "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning"
        : "bg-muted text-muted-foreground border-border";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all duration-[240ms] ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-primary-emphasis">
          {icon}
        </div>
        {badge && (
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="font-display text-2xl leading-tight font-bold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
