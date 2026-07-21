import { allLessons, durationToSeconds } from "@/data/curriculum";
import type { Status } from "./progress-store";

export type ScheduledLesson = (typeof allLessons)[number] & { seconds: number };
export type DaySchedule = {
  dateISO: string;
  lessons: ScheduledLesson[];
  totalSeconds: number;
  /** se a aula era originalmente desse dia mas não foi marcada como feito */
  missedLessons?: ScheduledLesson[];
};

const PLAN_WEEKS: Record<string, number> = {
  "1m": 4,
  "2m": 8,
  "3m": 13,
  "6m": 26,
  livre: 0,
};

function isoDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function distributeAcross(
  start: Date,
  end: Date,
  studyDays: Set<number>,
  lessons: ScheduledLesson[],
): Map<string, DaySchedule> {
  const map = new Map<string, DaySchedule>();
  const studyDates: string[] = [];
  let walker = new Date(start);
  while (walker <= end) {
    if (studyDays.has(walker.getDay())) studyDates.push(isoDay(walker));
    walker = addDays(walker, 1);
  }
  const effectiveDays = Math.max(1, studyDates.length);
  const totalSec = lessons.reduce((a, l) => a + l.seconds, 0);
  const perDay = totalSec / effectiveDays;

  let cursor = 0;
  let acc = 0;
  let studyIdx = 0;
  walker = new Date(start);
  while (walker <= end) {
    const dateISO = isoDay(walker);
    const dayLessons: ScheduledLesson[] = [];
    let daySec = 0;
    if (studyDays.has(walker.getDay())) {
      studyIdx++;
      const target = studyIdx * perDay;
      while (
        cursor < lessons.length &&
        acc + lessons[cursor].seconds / 2 <= target
      ) {
        dayLessons.push(lessons[cursor]);
        daySec += lessons[cursor].seconds;
        acc += lessons[cursor].seconds;
        cursor++;
      }
    }
    map.set(dateISO, { dateISO, lessons: dayLessons, totalSeconds: daySec });
    walker = addDays(walker, 1);
  }
  // sobra: joga no último dia de estudo
  if (cursor < lessons.length && studyDates.length) {
    const last = studyDates[studyDates.length - 1];
    const d = map.get(last)!;
    while (cursor < lessons.length) {
      d.lessons.push(lessons[cursor]);
      d.totalSeconds += lessons[cursor].seconds;
      cursor++;
    }
  }
  return map;
}

export type ScheduleResult = {
  days: DaySchedule[];
  byDate: Map<string, DaySchedule>;
  endDateISO: string | null;
  overdueLessons: ScheduledLesson[];
  overdueSeconds: number;
  isLate: boolean;
  recalculated: boolean;
  todayISO: string;
};

export function buildSchedule(
  meta: {
    startDate: string;
    plan: string;
    targetDate?: string;
    studyDays?: number[];
  },
  progress: Record<string, Status>,
): ScheduleResult {
  const todayISO = isoDay(new Date());
  const start = new Date(meta.startDate + "T00:00:00");
  let end: Date | null = null;
  if (meta.plan === "livre") {
    if (meta.targetDate) end = new Date(meta.targetDate + "T00:00:00");
  } else {
    const w = PLAN_WEEKS[meta.plan] ?? 8;
    end = addDays(start, w * 7 - 1);
  }

  if (!end) {
    return {
      days: [],
      byDate: new Map(),
      endDateISO: null,
      overdueLessons: [],
      overdueSeconds: 0,
      isLate: false,
      recalculated: false,
      todayISO,
    };
  }

  const studyDays =
    meta.studyDays && meta.studyDays.length > 0
      ? new Set(meta.studyDays)
      : new Set([0, 1, 2, 3, 4, 5, 6]);

  const lessonsWithSec: ScheduledLesson[] = allLessons.map((l) => ({
    ...l,
    seconds: durationToSeconds(l.duration),
  }));

  // 1. Cronograma original (todas as aulas)
  const originalMap = distributeAcross(start, end, studyDays, lessonsWithSec);

  // 2. Atraso: aulas em dias passados não marcadas como feito
  const overdue: ScheduledLesson[] = [];
  const missedByDate = new Map<string, ScheduledLesson[]>();
  for (const [dateISO, d] of originalMap) {
    if (dateISO >= todayISO) continue;
    const missed = d.lessons.filter((l) => progress[l.id] !== "feito");
    if (missed.length) {
      missedByDate.set(dateISO, missed);
      overdue.push(...missed);
    }
  }

  // 3. Fila futura: atrasadas (primeiro) + futuras ainda não feitas
  const inQueue = new Set<string>();
  const forward: ScheduledLesson[] = [];
  for (const l of overdue) {
    if (!inQueue.has(l.id)) {
      inQueue.add(l.id);
      forward.push(l);
    }
  }
  const sorted = [...originalMap.entries()].sort((a, b) =>
    a[0] < b[0] ? -1 : 1,
  );
  for (const [dateISO, d] of sorted) {
    if (dateISO < todayISO) continue;
    for (const l of d.lessons) {
      if (progress[l.id] !== "feito" && !inQueue.has(l.id)) {
        inQueue.add(l.id);
        forward.push(l);
      }
    }
  }

  // 4. Redistribuir do hoje (ou início, o que for maior) até o fim
  const effectiveStart =
    todayISO > meta.startDate ? new Date(todayISO + "T00:00:00") : start;

  const futureMap =
    effectiveStart <= end
      ? distributeAcross(effectiveStart, end, studyDays, forward)
      : new Map<string, DaySchedule>();

  // 5. Montar dias finais (passado = original, futuro = recalculado)
  const days: DaySchedule[] = [];
  const byDate = new Map<string, DaySchedule>();
  let walker = new Date(start);
  while (walker <= end) {
    const dateISO = isoDay(walker);
    let entry: DaySchedule;
    if (dateISO < todayISO) {
      const orig = originalMap.get(dateISO);
      entry = {
        dateISO,
        lessons: orig?.lessons ?? [],
        totalSeconds: orig?.totalSeconds ?? 0,
        missedLessons: missedByDate.get(dateISO),
      };
    } else {
      entry = futureMap.get(dateISO) ?? {
        dateISO,
        lessons: [],
        totalSeconds: 0,
      };
    }
    days.push(entry);
    byDate.set(dateISO, entry);
    walker = addDays(walker, 1);
  }

  return {
    days,
    byDate,
    endDateISO: isoDay(end),
    overdueLessons: overdue,
    overdueSeconds: overdue.reduce((a, l) => a + l.seconds, 0),
    isLate: overdue.length > 0,
    recalculated: overdue.length > 0,
    todayISO,
  };
}
