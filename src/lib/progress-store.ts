import { useEffect, useState, useCallback } from "react";

export type Status = "nao-iniciado" | "em-andamento" | "feito";

const STORAGE_KEY = "auvp-progress-v1";
const META_KEY = "auvp-meta-v1";

type ProgressMap = Record<string, Status>;
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

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(read<ProgressMap>(STORAGE_KEY, {}));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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

  const reset = useCallback(() => setProgress({}), []);

  return { progress, setStatus, cycleStatus, reset, hydrated };
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
