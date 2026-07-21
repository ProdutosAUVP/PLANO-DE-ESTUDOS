import { useEffect, useState, useCallback, useRef } from "react";

export type Status = "nao-iniciado" | "em-andamento" | "feito";

const STORAGE_KEY = "auvp-progress-v1";
const META_KEY = "auvp-meta-v1";
const ACTIVITY_KEY = "auvp-activity-v1";

type ProgressMap = Record<string, Status>;
/** dateISO -> nº de aulas concluídas naquele dia */
export type ActivityMap = Record<string, number>;
export type Meta = {
  startDate: string;
  plan: "1m" | "2m" | "3m" | "6m" | "livre";
  targetDate?: string;
  /** dias da semana de estudo (0=Dom ... 6=Sáb) */
  studyDays?: number[];
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function todayISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [activity, setActivity] = useState<ActivityMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(read<ProgressMap>(STORAGE_KEY, {}));
    setActivity(read<ActivityMap>(ACTIVITY_KEY, {}));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }, [activity, hydrated]);

  /**
   * Atividade do dia derivada das mudanças de progresso (alimenta streak e
   * gráfico semanal). Feito como efeito — e não dentro dos updaters — para
   * ser idempotente sob o StrictMode.
   */
  const prevProgressRef = useRef<ProgressMap | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevProgressRef.current;
    prevProgressRef.current = progress;
    if (prev === null) return; // primeira leitura pós-hidratação
    let delta = 0;
    const ids = new Set([...Object.keys(prev), ...Object.keys(progress)]);
    for (const id of ids) {
      const was = prev[id] === "feito";
      const is = progress[id] === "feito";
      if (!was && is) delta++;
      else if (was && !is) delta--;
    }
    if (delta === 0) return;
    const day = todayISO();
    setActivity((a) => {
      const next = Math.max(0, (a[day] ?? 0) + delta);
      const copy = { ...a };
      if (next === 0) delete copy[day];
      else copy[day] = next;
      return copy;
    });
  }, [progress, hydrated]);

  const setStatus = useCallback((id: string, status: Status) => {
    setProgress((p) => ({ ...p, [id]: status }));
  }, []);

  const cycleStatus = useCallback((id: string) => {
    setProgress((p) => {
      const cur = p[id] ?? "nao-iniciado";
      const next: Status =
        cur === "nao-iniciado"
          ? "em-andamento"
          : cur === "em-andamento"
            ? "feito"
            : "nao-iniciado";
      return { ...p, [id]: next };
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    setActivity({});
  }, []);

  return { progress, activity, setStatus, cycleStatus, reset, hydrated };
}

/**
 * Sequência de dias de estudo com pelo menos uma aula concluída.
 * Dias fora dos `studyDays` configurados não quebram a sequência;
 * o dia de hoje sem atividade também não quebra (ainda dá tempo).
 */
export function computeStreak(
  activity: ActivityMap,
  studyDays?: number[],
): number {
  const days = studyDays && studyDays.length > 0 ? new Set(studyDays) : null;
  const today = todayISO();
  let streak = 0;
  const cursor = new Date(today + "T00:00:00");
  for (let i = 0; i < 366; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const active = (activity[iso] ?? 0) > 0;
    if (active) {
      streak++;
    } else if (iso === today || (days && !days.has(cursor.getDay()))) {
      // hoje ainda em aberto / dia de descanso: não quebra
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Últimos 7 dias (terminando hoje) com contagem de aulas concluídas. */
export function lastSevenDays(
  activity: ActivityMap,
): Array<{ dateISO: string; count: number }> {
  const out: Array<{ dateISO: string; count: number }> = [];
  const cursor = new Date(todayISO() + "T00:00:00");
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    out.push({ dateISO: iso, count: activity[iso] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function useMeta() {
  const [meta, setMetaState] = useState<Meta>({
    startDate: new Date().toISOString().slice(0, 10),
    plan: "2m",
    studyDays: [1, 2, 3, 4, 5],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMetaState(
      read<Meta>(META_KEY, {
        startDate: new Date().toISOString().slice(0, 10),
        plan: "2m",
        studyDays: [1, 2, 3, 4, 5],
      }),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }, [meta, hydrated]);

  return { meta, setMeta: setMetaState };
}
