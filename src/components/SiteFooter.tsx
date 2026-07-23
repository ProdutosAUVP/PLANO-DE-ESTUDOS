import logoHorizontalLight from "@/assets/logos/auvp-escola-horizontal-branco.svg";

/**
 * Rodapé do ecossistema AUVP: faixa verde profundo de largura total com
 * copyright à esquerda e nota à direita, como no dashboard AUVP Capital.
 * O logo é sempre a versão branca (o fundo é verde nos dois temas).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 bg-footer text-footer-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-center text-xs sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-center gap-3">
          <img
            src={logoHorizontalLight}
            alt="AUVP Escola"
            className="h-5 w-auto"
          />
          <span>© {year} AUVP. Todos os direitos reservados.</span>
        </div>
        <span className="text-footer-foreground/70">
          Conteúdo baseado na grade pública da AUVP Escola. Seu progresso é
          salvo no seu navegador.
        </span>
      </div>
    </footer>
  );
}
