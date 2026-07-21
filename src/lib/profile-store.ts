import { useEffect, useState } from "react";
import { totalSeconds } from "@/data/curriculum";
import type { Meta } from "./progress-store";

const PROFILE_KEY = "auvp-profile-v1";

export type StudyStyle = "curtas" | "equilibrado" | "imersivo";
export type StudyPeriod = "manha" | "tarde" | "noite" | "variado";
export type StudyHabit = "anotacoes" | "revisao" | "pratica" | "comunidade";

export type Profile = {
  /** primeiro nome, opcional */
  name?: string;
  /** minutos disponíveis por dia de estudo */
  minutesPerDay: number;
  /** ritmo preferido de sessão */
  style: StudyStyle;
  /** melhor período do dia */
  period: StudyPeriod;
  /** maneiras favoritas de estudar (multi) */
  habits: StudyHabit[];
  /** onboarding concluído */
  onboarded: boolean;
};

export const DEFAULT_PROFILE: Profile = {
  minutesPerDay: 45,
  style: "equilibrado",
  period: "variado",
  habits: [],
  onboarded: false,
};

function read(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  return { profile, setProfile, hydrated };
}

const PLAN_LADDER: Array<{ plan: Meta["plan"]; weeks: number; label: string }> =
  [
    { plan: "1m", weeks: 4, label: "1 mês" },
    { plan: "2m", weeks: 8, label: "8 semanas" },
    { plan: "3m", weeks: 13, label: "3 meses" },
    { plan: "6m", weeks: 26, label: "6 meses" },
  ];

export type PlanRecommendation = {
  /** semanas necessárias no ritmo informado */
  weeksNeeded: number;
  plan: Meta["plan"];
  planLabel: string;
  /** data alvo (apenas quando plan === "livre") */
  targetDateISO?: string;
  /** conclusão prevista (para exibição) */
  endDateISO: string;
};

/**
 * Recomenda um plano a partir do tempo disponível: calcula as semanas
 * necessárias para a carga total e escolhe o menor plano padrão que caiba;
 * acima de 6 meses, cai no plano livre com data alvo calculada.
 */
export function recommendPlan(
  minutesPerDay: number,
  daysPerWeek: number,
): PlanRecommendation {
  const totalMin = totalSeconds / 60;
  const perWeek = Math.max(1, minutesPerDay * daysPerWeek);
  const weeksNeeded = Math.max(1, Math.ceil(totalMin / perWeek));

  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endFor = (weeks: number) => {
    const d = new Date(start);
    d.setDate(d.getDate() + weeks * 7 - 1);
    return d.toISOString().slice(0, 10);
  };

  const fit = PLAN_LADDER.find((p) => p.weeks >= weeksNeeded);
  if (fit) {
    return {
      weeksNeeded,
      plan: fit.plan,
      planLabel: fit.label,
      endDateISO: endFor(fit.weeks),
    };
  }
  const targetDateISO = endFor(weeksNeeded);
  return {
    weeksNeeded,
    plan: "livre",
    planLabel: `Livre (~${weeksNeeded} semanas)`,
    targetDateISO,
    endDateISO: targetDateISO,
  };
}

export const STYLE_LABELS: Record<StudyStyle, string> = {
  curtas: "Sessões curtas",
  equilibrado: "Ritmo equilibrado",
  imersivo: "Imersões longas",
};

export const PERIOD_LABELS: Record<StudyPeriod, string> = {
  manha: "Melhor de manhã",
  tarde: "Melhor à tarde",
  noite: "Melhor à noite",
  variado: "Horário flexível",
};

export const HABIT_LABELS: Record<StudyHabit, string> = {
  anotacoes: "Fazer anotações",
  revisao: "Revisar aulas",
  pratica: "Aplicar na prática",
  comunidade: "Trocar com a comunidade",
};

export const STYLE_TIPS: Record<StudyStyle, string> = {
  curtas:
    "Blocos de 25 a 30 minutos com pausas curtas mantêm a constância sem cansar.",
  equilibrado:
    "Alterne dias mais leves e mais intensos — o importante é não zerar a semana.",
  imersivo:
    "Reserve janelas de 1h ou mais, silencie notificações e mergulhe em um módulo por vez.",
};
