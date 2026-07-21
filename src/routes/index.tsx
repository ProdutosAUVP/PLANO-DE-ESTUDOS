import { createFileRoute } from "@tanstack/react-router";
import { modules } from "@/data/curriculum";
import { useProgress, useMeta } from "@/lib/progress-store";
import { ModuleCard } from "@/components/ModuleCard";
import { PlanHeader } from "@/components/PlanHeader";
import { StudyCalendar } from "@/components/StudyCalendar";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { progress, cycleStatus, reset, hydrated } = useProgress();
  const { meta, setMeta } = useMeta();

  if (!hydrated) return <div className="min-h-screen bg-background" />;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <PlanHeader progress={progress} meta={meta} setMeta={setMeta} onReset={reset} />
        <div className="mt-6">
          <StudyCalendar meta={meta} progress={progress} onCycle={cycleStatus} />
        </div>
        <div className="mt-8 space-y-4">
          {modules.map((m, i) => (
            <ModuleCard
              key={m.id}
              module={m}
              progress={progress}
              onCycle={cycleStatus}
              defaultOpen={i === 0}
            />
          ))}
        </div>
        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Conteúdo baseado na grade pública da AUVP Escola. Seu progresso é salvo no seu navegador.
        </footer>
      </div>
    </main>
  );
}