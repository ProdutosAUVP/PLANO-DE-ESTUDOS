import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Focus,
  Lightbulb,
  Moon,
  NotebookPen,
  RotateCcw,
  Scale,
  Shuffle,
  Sun,
  Sunrise,
  Timer,
  Users,
  X,
} from "lucide-react";
import { modules, totalSeconds, formatSeconds } from "@/data/curriculum";
import {
  recommendPlan,
  DEFAULT_PROFILE,
  STYLE_LABELS,
  PERIOD_LABELS,
  HABIT_LABELS,
} from "@/lib/profile-store";
import type {
  Profile,
  StudyHabit,
  StudyPeriod,
  StudyStyle,
} from "@/lib/profile-store";
import type { Meta } from "@/lib/progress-store";
import logoVertical from "@/assets/logos/auvp-escola-vertical-amarelo.svg";

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

const MINUTE_OPTIONS = [15, 30, 45, 60, 90, 120];

const STYLE_OPTIONS: Array<{
  value: StudyStyle;
  Icon: typeof Timer;
  title: string;
  description: string;
}> = [
  {
    value: "curtas",
    Icon: Timer,
    title: "Sessões curtas",
    description: "Blocos rápidos e frequentes, encaixados na rotina.",
  },
  {
    value: "equilibrado",
    Icon: Scale,
    title: "Ritmo equilibrado",
    description: "Um pouco por dia, sem pressa e sem acumular.",
  },
  {
    value: "imersivo",
    Icon: Focus,
    title: "Imersões longas",
    description: "Menos dias, sessões profundas de uma vez só.",
  },
];

const PERIOD_OPTIONS: Array<{
  value: StudyPeriod;
  Icon: typeof Sun;
  label: string;
}> = [
  { value: "manha", Icon: Sunrise, label: "Manhã" },
  { value: "tarde", Icon: Sun, label: "Tarde" },
  { value: "noite", Icon: Moon, label: "Noite" },
  { value: "variado", Icon: Shuffle, label: "Varia" },
];

const HABIT_OPTIONS: Array<{
  value: StudyHabit;
  Icon: typeof NotebookPen;
  label: string;
}> = [
  { value: "anotacoes", Icon: NotebookPen, label: "Fazer anotações" },
  { value: "revisao", Icon: RotateCcw, label: "Revisar aulas" },
  { value: "pratica", Icon: Lightbulb, label: "Aplicar na prática" },
  { value: "comunidade", Icon: Users, label: "Trocar com a comunidade" },
];

const TOTAL_STEPS = 4;

export function Onboarding({
  initialProfile,
  initialStudyDays,
  editing,
  onComplete,
  onSkip,
  onClose,
}: {
  initialProfile: Profile;
  initialStudyDays: number[];
  editing: boolean;
  onComplete: (profile: Profile, metaPatch: Partial<Meta>) => void;
  onSkip?: () => void;
  onClose?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialProfile.name ?? "");
  const [studyDays, setStudyDays] = useState<number[]>(
    initialStudyDays.length > 0 ? initialStudyDays : [1, 2, 3, 4, 5],
  );
  const [minutesPerDay, setMinutesPerDay] = useState(
    initialProfile.minutesPerDay,
  );
  const [style, setStyle] = useState<StudyStyle>(initialProfile.style);
  const [period, setPeriod] = useState<StudyPeriod>(initialProfile.period);
  const [habits, setHabits] = useState<StudyHabit[]>(initialProfile.habits);

  const recommendation = useMemo(
    () => recommendPlan(minutesPerDay, Math.max(1, studyDays.length)),
    [minutesPerDay, studyDays],
  );

  const toggleDay = (d: number) => {
    setStudyDays((cur) =>
      cur.includes(d)
        ? cur.filter((x) => x !== d)
        : [...cur, d].sort((a, b) => a - b),
    );
  };

  const toggleHabit = (h: StudyHabit) => {
    setHabits((cur) =>
      cur.includes(h) ? cur.filter((x) => x !== h) : [...cur, h],
    );
  };

  const finish = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    onComplete(
      {
        ...DEFAULT_PROFILE,
        name: name.trim() || undefined,
        minutesPerDay,
        style,
        period,
        habits,
        onboarded: true,
      },
      {
        startDate: todayISO,
        plan: recommendation.plan,
        targetDate: recommendation.targetDateISO,
        studyDays,
      },
    );
  };

  const canAdvance = step !== 1 || studyDays.length > 0;

  return (
    <main className="bg-spotlight flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Progresso */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-[320ms] ease-out ${
                  i === step
                    ? "w-8 bg-primary"
                    : i < step
                      ? "w-4 bg-primary/50"
                      : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Passo {step + 1} de {TOTAL_STEPS}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar sem salvar"
                className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <section
          key={step}
          className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] duration-300 sm:p-8"
        >
          {step === 0 && (
            <>
              {/* Logo vertical: versão preferencial da marca AUVP Escola */}
              <img
                src={logoVertical}
                alt="AUVP Escola"
                className="h-24 w-auto"
              />
              <p className="mt-4 text-xs font-bold tracking-[0.18em] text-primary-emphasis uppercase">
                Plano de Estudos
              </p>
              <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {editing
                  ? "Ajuste sua experiência"
                  : "Vamos montar o seu plano"}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                São {modules.length} módulos e {formatSeconds(totalSeconds)} de
                conteúdo. Em poucos passos, adaptamos o cronograma ao seu tempo
                e ao seu jeito de estudar.
              </p>
              <label className="mt-6 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Como podemos te chamar?
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu primeiro nome (opcional)"
                  maxLength={30}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal normal-case transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
                />
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                Quanto tempo você tem?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha os dias e o tempo disponível — calculamos o plano ideal
                para caber na sua rotina.
              </p>

              <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Dias de estudo
              </p>
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
                      className={`h-10 w-10 rounded-full border text-xs font-bold transition-all duration-[240ms] ease-out ${
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

              <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Tempo por dia de estudo
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MINUTE_OPTIONS.map((m) => {
                  const active = minutesPerDay === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutesPerDay(m)}
                      aria-pressed={active}
                      className={`btn-cta rounded-full border px-4 py-2.5 transition-all duration-[240ms] ease-out ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-sm"
                      }`}
                    >
                      {m >= 60
                        ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`
                        : `${m} min`}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-emphasis" />
                <p className="text-sm text-foreground">
                  {studyDays.length > 0 ? (
                    <>
                      Nesse ritmo, você conclui a grade em cerca de{" "}
                      <strong>
                        {recommendation.weeksNeeded} semana
                        {recommendation.weeksNeeded > 1 ? "s" : ""}
                      </strong>
                      .
                    </>
                  ) : (
                    "Selecione pelo menos um dia de estudo para continuar."
                  )}
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                Qual é o seu jeito de estudar?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Usamos isso para adaptar dicas e a forma de apresentar seu
                plano.
              </p>

              <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Ritmo preferido
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {STYLE_OPTIONS.map((opt) => {
                  const active = style === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStyle(opt.value)}
                      aria-pressed={active}
                      className={`rounded-xl border p-4 text-left transition-all duration-[240ms] ease-out ${
                        active
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background/60 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <opt.Icon
                        className={`h-5 w-5 ${active ? "text-primary-emphasis" : "text-muted-foreground"}`}
                      />
                      <p className="font-display mt-2 text-sm font-bold text-foreground">
                        {opt.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Melhor período do dia
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PERIOD_OPTIONS.map((opt) => {
                  const active = period === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPeriod(opt.value)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-[240ms] ease-out ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-sm"
                      }`}
                    >
                      <opt.Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                O que te ajuda a aprender? (opcional)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {HABIT_OPTIONS.map((opt) => {
                  const active = habits.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleHabit(opt.value)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-[240ms] ease-out ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <opt.Icon className="h-3.5 w-3.5" />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                {name.trim() ? `Tudo pronto, ${name.trim()}` : "Tudo pronto"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Seu plano recomendado, com base no seu tempo disponível:
              </p>

              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-5">
                <p className="text-xs font-bold tracking-wider text-primary-emphasis uppercase">
                  Plano sugerido
                </p>
                <p className="font-display mt-1 text-2xl font-extrabold text-foreground">
                  {recommendation.planLabel}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Começando hoje, conclusão prevista em{" "}
                  <strong className="text-foreground">
                    {new Date(
                      recommendation.endDateISO + "T00:00:00",
                    ).toLocaleDateString("pt-BR")}
                  </strong>
                  .
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryItem label="Por dia" value={`${minutesPerDay} min`} />
                <SummaryItem
                  label="Dias/semana"
                  value={`${studyDays.length}`}
                />
                <SummaryItem label="Ritmo" value={STYLE_LABELS[style]} />
                <SummaryItem label="Período" value={PERIOD_LABELS[period]} />
              </dl>

              {habits.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Suas maneiras favoritas:{" "}
                  <strong className="text-foreground">
                    {habits.map((h) => HABIT_LABELS[h]).join(" · ")}
                  </strong>
                </p>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Você pode ajustar tudo depois — o plano se recalcula sozinho se
                atrasar.
              </p>
            </>
          )}

          {/* Navegação — mobile first: CTA em largura total no topo, voltar/pular abaixo */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-cta inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-muted-foreground transition-all duration-[240ms] ease-out hover:text-foreground active:scale-95 sm:w-auto"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>
              ) : (
                onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="p-2 text-xs text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                  >
                    Pular por agora
                  </button>
                )
              )}
            </div>
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={() => canAdvance && setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="btn-cta inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-[240ms] ease-out hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
              >
                Continuar
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="btn-cta inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-[240ms] ease-out hover:brightness-105 active:scale-95 sm:py-2.5"
              >
                <Check className="h-3.5 w-3.5" />
                Começar minha jornada
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5">
      <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}
