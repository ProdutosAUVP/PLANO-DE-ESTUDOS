# CLAUDE.md

Guia para Claude Code (e outros agentes) trabalharem neste repositório.

## O que é

SPA estática de acompanhamento de estudos da **AUVP Escola**. O aluno marca
aulas como _não iniciado / em andamento / feito_ e a app gera um cronograma
personalizado. **Sem back-end**: todo estado do usuário vive no `localStorage`.

Origem: exportado do **Lovable** como app TanStack Start (SSR + Cloudflare
Workers) e **convertido para SPA estática** para deploy no **GitHub Pages**.
Não reintroduza SSR, server functions ou dependências de Cloudflare.

## Comandos

```bash
bun install        # instalar dependências
bun run dev        # dev server (http://localhost:5173)
bun run build      # build de produção -> dist/
bun run preview    # servir o build localmente
bun run lint       # ESLint + Prettier (deve passar antes de commitar)
bun run format     # auto-formatar com Prettier
```

Use **Bun** (há `bun.lock`). Se editar `package.json`, rode `bun install` para
manter o lockfile em dia — o CI usa `bun install --frozen-lockfile`.

## Arquitetura

- **Entrada**: `index.html` → `src/main.tsx` monta o `RouterProvider`.
- **Roteamento**: TanStack Router com rotas por arquivo em `src/routes/`.
  `src/routeTree.gen.ts` é **gerado automaticamente** pelo plugin do Vite —
  **nunca edite à mão** (é regenerado no `dev`/`build`).
- **Base path**: a app roda sob `/PLANO-DE-ESTUDOS/` no GitHub Pages (case do nome do repo — o CI deriva via `BASE_PATH`). Definido
  em `vite.config.ts` (`base`) e consumido pelo router via
  `import.meta.env.BASE_URL`. Sobrescreva com `BASE_PATH=/ bun run build` para
  raiz/domínio customizado.
- **Estilo**: Tailwind CSS v4 via `@tailwindcss/vite`. Tokens de design em
  `src/styles.css` — modo claro em `:root`, escuro em `.dark` (toggle via
  `useTheme` + script anti-FOUC em `index.html`). Componentes de UI em
  `src/components/ui/` são shadcn/ui (Radix); prefira reutilizá-los.
- **Estado do usuário**: hooks `useProgress` e `useMeta` em
  `src/lib/progress-store.ts`. Chaves de `localStorage`: `auvp-progress-v1`,
  `auvp-meta-v1`, `auvp-activity-v1` (aulas concluídas por dia — alimenta
  streak e gráfico semanal) e `auvp-theme-v1` (tema claro/escuro). Ao mudar o
  formato persistido, **versione a chave** (ex. `-v2`) para não quebrar dados
  salvos dos usuários. A atividade é derivada das mudanças de progresso em um
  `useEffect` (não dentro de updaters) para ser idempotente sob o StrictMode.
- **Cronograma**: `src/lib/schedule.ts` (`buildSchedule`) distribui as aulas
  pelos dias de estudo e reagenda atrasos. É lógica pura e testável.
- **Conteúdo da grade**: `src/data/curriculum.ts` é a fonte da verdade de
  módulos/aulas. IDs de aula são derivados de `módulo-número-título`; mudar um
  título muda o ID e **reseta o progresso daquela aula** para usuários
  existentes — evite renomear sem necessidade.

## Design System (AUVP — tema Escola)

A identidade visual segue o **AUVP Design System**, tema **Escola (dourado)**:
https://produtosauvp.github.io/central/design-system (fonte dos tokens:
repositório `ProdutosAUVP/central`, `src/index.css`, blocos `.escola` e
`.dark.escola`).

Regras que este app segue — mantenha-as em qualquer mudança visual:

- **Cores em HSL**, copiadas dos tokens oficiais. Claro: dourado
  `hsl(42 84% 63%)` como `--primary` com texto escuro; escuro: fundo preto com
  dourado `hsl(42 90% 65%)`. Status semânticos da Escola usam **âmbar como
  success** (não verde).
- **Contraste**: o dourado puro NÃO passa AA como texto sobre branco. Para
  texto/ícone dourado use `text-primary-emphasis` (`hsl(40 90% 29%)` no claro;
  igual ao primary no escuro). Nunca `text-primary` sobre `--background` claro.
- **Tipografia**: `font-display` (Anek Latin) para títulos; Roboto
  (`--font-sans`) para corpo/labels; **Sora é exclusiva para botões** — use o
  utilitário `.btn-cta` (Sora Bold 13px uppercase tracking-wider).
- **Motion**: padrão `240ms ease/ease-out` (hovers, cards com
  `hover:-translate-y-0.5` + sombra `--shadow-lift`); `320ms` para destaques;
  barras de progresso `700ms`; anel de progresso `1.5s ease-out`. Entradas com
  `animate-in fade-in slide-in-*` (tw-animate-css).
- **Utilitários próprios** em `styles.css`: `bg-brand-gradient` (gradiente
  dourado), `bg-spotlight` (halo do hero), `btn-cta`.
- **Sem emojis na UI** — use ícones `lucide-react`.
- Padrões de componente vêm das seções da plataforma no DS (Dashboard do
  Aluno, Grade Curricular, Jornada do Herói, Progress Geist, Tags & Badges).

## Convenções

- **TypeScript** em tudo. Alias de import `@/*` → `src/*`.
- **Formatação**: Prettier manda. Rode `bun run lint` antes de commitar; não há
  0 erros de lint tolerados (os 6 _warnings_ de `react-refresh` nos componentes
  shadcn são pré-existentes e aceitáveis).
- **Idioma**: a UI é em **português (pt-BR)**. Mantenha textos voltados ao
  usuário em português.
- **Componentes**: um componente por arquivo em `src/components/`; UI base
  (shadcn) fica em `src/components/ui/` — geralmente não precisa alterá-los.
- Não adicione dependências de servidor/Node em runtime — o bundle roda no
  navegador. Nada de `fs`, `process`, chamadas SSR, etc.

## Deploy

Automático via `.github/workflows/deploy.yml` a cada push em `main`:
build → copia `index.html` para `404.html` (fallback SPA) → publica `dist/` no
GitHub Pages. Requer **Settings → Pages → Source = GitHub Actions** habilitado
uma vez. `public/.nojekyll` impede o processamento por Jekyll.

## Ao terminar uma mudança

1. `bun run lint` e `bun run build` devem passar.
2. Commit com mensagem descritiva.
3. Push para a branch de trabalho combinada (não direto na `main` sem
   necessidade — o deploy dispara em `main`).
