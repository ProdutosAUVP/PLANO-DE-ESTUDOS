import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import logoHorizontalDark from "@/assets/logos/auvp-escola-horizontal-preto.svg";
import logoHorizontalLight from "@/assets/logos/auvp-escola-horizontal-branco.svg";

/**
 * Cabeçalho do ecossistema AUVP: barra branca (preta no escuro) de largura
 * total com borda inferior, logo à esquerda e ações à direita — mesmo padrão
 * do dashboard AUVP Capital.
 */
export function SiteHeader({
  onEditProfile,
  onReset,
}: {
  onEditProfile: () => void;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logoHorizontalDark}
            alt="AUVP Escola"
            className="h-7 w-auto dark:hidden"
          />
          <img
            src={logoHorizontalLight}
            alt="AUVP Escola"
            className="hidden h-7 w-auto dark:block"
          />
          <span className="hidden border-l border-border pl-3 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase sm:inline">
            Plano de Estudos
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
            title="Resetar todo o progresso"
            aria-label="Resetar todo o progresso"
            className="btn-cta flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-muted-foreground transition-all duration-[240ms] ease-out hover:border-destructive hover:text-destructive active:scale-95 sm:px-4"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Resetar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
