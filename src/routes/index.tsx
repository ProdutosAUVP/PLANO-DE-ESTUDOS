import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { modules } from "@/data/curriculum";
import { useProgress, useMeta } from "@/lib/progress-store";
import { useProfile } from "@/lib/profile-store";
import { ModuleCard } from "@/components/ModuleCard";
import { PlanHeader } from "@/components/PlanHeader";
import { StudyCalendar } from "@/components/StudyCalendar";
import { Onboarding } from "@/components/Onboarding";
import logoHorizontalDark from "@/assets/logos/auvp-escola-horizontal-preto.svg";
import logoHorizontalLight from "@/assets/logos/auvp-escola-horizontal-branco.svg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { progress, activity, cycleStatus, reset, hydrated } = useProgress();
  const { meta, setMeta } = useMeta();
  const { profile, setProfile, hydrated: profileHydrated } = useProfile();
  const [editingProfile, setEditingProfile] = useState(false);

  if (!hydrated || !profileHydrated)
    return <div className="min-h-screen bg-background" />;

  if (!profile.onboarded || editingProfile) {
    return (
      <Onboarding
        initialProfile={profile}
        initialStudyDays={meta.studyDays ?? []}
        editing={editingProfile}
        onComplete={(p, metaPatch) => {
          setProfile(p);
          setMeta({ ...meta, ...metaPatch });
          setEditingProfile(false);
        }}
        onSkip={
          !profile.onboarded
            ? () => setProfile({ ...profile, onboarded: true })
            : undefined
        }
        onClose={editingProfile ? () => setEditingProfile(false) : undefined}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <PlanHeader
          progress={progress}
          activity={activity}
          meta={meta}
          setMeta={setMeta}
          onReset={reset}
          profile={profile}
          onEditProfile={() => setEditingProfile(true)}
        />
        <div className="mt-4">
          <StudyCalendar
            meta={meta}
            progress={progress}
            onCycle={cycleStatus}
          />
        </div>
        <div className="mt-8">
          <h2 className="font-display px-1 text-2xl font-bold text-foreground">
            Grade curricular
          </h2>
          <p className="mt-1 px-1 text-sm text-muted-foreground">
            Clique em uma aula para alternar entre não iniciado, em andamento e
            feito.
          </p>
          <div className="mt-4 space-y-4">
            {modules
              .filter((m) => m.index !== null)
              .map((m, i) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  progress={progress}
                  onCycle={cycleStatus}
                  defaultOpen={i === 0}
                />
              ))}
          </div>
          {/* Separador dos módulos bônus */}
          <div className="mt-8 mb-4 flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Bônus
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-4">
            {modules
              .filter((m) => m.index === null)
              .map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  progress={progress}
                  onCycle={cycleStatus}
                />
              ))}
          </div>
        </div>
        <footer className="mt-10 flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
          <img
            src={logoHorizontalDark}
            alt="AUVP Escola"
            className="h-6 w-auto opacity-80 dark:hidden"
          />
          <img
            src={logoHorizontalLight}
            alt="AUVP Escola"
            className="hidden h-6 w-auto opacity-80 dark:block"
          />
          <span>
            Conteúdo baseado na grade pública da AUVP Escola. Seu progresso é
            salvo no seu navegador.
          </span>
        </footer>
      </div>
    </main>
  );
}
