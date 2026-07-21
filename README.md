# Plano de Estudos — AUVP Escola

Aplicação web para alunos da **AUVP Escola** acompanharem seu progresso na
grade de aulas. Organize os módulos, marque as aulas concluídas e gere um
**cronograma de estudos personalizado** que se adapta ao seu ritmo.

Todo o progresso é salvo **localmente no navegador** (`localStorage`) — não há
back-end, banco de dados nem login.

## ✨ Funcionalidades

- **Grade completa de módulos e aulas** com duração de cada aula e total por
  módulo.
- **Acompanhamento de progresso** com três estados por aula: _Não iniciado →
  Em andamento → Feito_ (basta clicar para avançar).
- **Barra de progresso** geral e por módulo (percentual e tempo assistido).
- **Cronograma personalizado** que distribui as aulas ao longo do período
  escolhido (1, 2, 3 ou 6 meses, ou modo livre com data-alvo).
- **Dias de estudo configuráveis** — escolha quais dias da semana você estuda.
- **Recálculo automático de atrasos** — aulas não concluídas em dias passados
  são reagendadas para os próximos dias de estudo.
- **Painel do aluno** — anel de progresso animado, jornada por módulos,
  sequência de dias de estudo (streak) e gráfico de atividade semanal.
- **Tema claro e escuro** com persistência da preferência.
- **Persistência local** — seu progresso permanece salvo entre visitas, no
  próprio navegador.

## 🎨 Design

A identidade visual segue o
[AUVP Design System](https://produtosauvp.github.io/central/design-system),
tema **Escola (dourado)**: tokens de cor HSL oficiais (claro e escuro),
tipografia Anek Latin / Roboto / Sora (exclusiva para botões) e motion padrão
de 240ms. As convenções completas estão documentadas em
[`CLAUDE.md`](CLAUDE.md).

## 🧱 Stack

| Camada       | Tecnologia                                     |
| ------------ | ---------------------------------------------- |
| Build / dev  | [Vite](https://vitejs.dev/)                    |
| UI           | [React 19](https://react.dev/)                 |
| Roteamento   | [TanStack Router](https://tanstack.com/router) |
| Estado async | [TanStack Query](https://tanstack.com/query)   |
| Estilo       | [Tailwind CSS v4](https://tailwindcss.com/)    |
| Componentes  | [shadcn/ui](https://ui.shadcn.com/) + Radix UI |
| Ícones       | [lucide-react](https://lucide.dev/)            |
| Linguagem    | TypeScript                                     |

> A aplicação é uma **SPA 100% estática** (client-side). Foi originalmente
> exportada do Lovable como um app TanStack Start (SSR/Cloudflare) e convertida
> para SPA estática para permitir o deploy no GitHub Pages.

## 🚀 Começando

Pré-requisitos: [Bun](https://bun.sh/) (recomendado) ou Node.js 20+.

```bash
# Instalar dependências
bun install

# Rodar em modo desenvolvimento (http://localhost:5173)
bun run dev

# Gerar build de produção (saída em dist/)
bun run build

# Pré-visualizar o build de produção localmente
bun run preview
```

Com npm, basta trocar `bun run` por `npm run` (e `bun install` por
`npm install`).

### Scripts disponíveis

| Script            | Descrição                               |
| ----------------- | --------------------------------------- |
| `bun run dev`     | Servidor de desenvolvimento com HMR     |
| `bun run build`   | Build de produção estático em `dist/`   |
| `bun run preview` | Serve o build de produção localmente    |
| `bun run lint`    | Verifica o código com ESLint + Prettier |
| `bun run format`  | Formata o código com Prettier           |

## 📦 Deploy no GitHub Pages

O deploy é **automático** via GitHub Actions. A cada `push` na branch `main`, o
workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila
o projeto e publica o conteúdo de `dist/` no GitHub Pages.

Para ativar (uma única vez):

1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça um push para `main` (ou rode o workflow manualmente em **Actions →
   Deploy to GitHub Pages → Run workflow**).

A aplicação ficará disponível em:

```
https://produtosauvp.github.io/PLANO-DE-ESTUDOS/
```

### Sobre o caminho base (`base`)

Como é um _project site_ do GitHub Pages, a aplicação é servida a partir do
sub-caminho `/PLANO-DE-ESTUDOS/` (mesmo case do nome do repositório — o Pages é case-sensitive). Isso está configurado em
[`vite.config.ts`](vite.config.ts) através da opção `base` e repassado ao
roteador via `import.meta.env.BASE_URL`.

- Para um **domínio customizado** ou _user/organization site_ (servido na raiz
  `/`), rode o build com a variável de ambiente `BASE_PATH=/`:

  ```bash
  BASE_PATH=/ bun run build
  ```

O workflow também copia `index.html` para `404.html` no `dist/`, garantindo que
rotas do cliente funcionem em recarregamentos diretos (fallback de SPA).

## 🗂️ Estrutura do projeto

```
.
├── index.html               # Entry HTML da SPA
├── vite.config.ts           # Config do Vite (plugins + base do GitHub Pages)
├── .github/workflows/       # CI/CD — deploy automático no GitHub Pages
├── public/                  # Assets estáticos (inclui .nojekyll)
└── src/
    ├── main.tsx             # Ponto de entrada do cliente (monta o Router)
    ├── router.tsx           # Criação do TanStack Router
    ├── routeTree.gen.ts     # Árvore de rotas (gerada automaticamente)
    ├── routes/              # Rotas baseadas em arquivos
    │   ├── __root.tsx       #   Layout raiz + páginas de erro/404
    │   └── index.tsx        #   Página principal (/)
    ├── components/          # Componentes da aplicação
    │   ├── ui/              #   Componentes shadcn/ui (Radix)
    │   ├── ModuleCard.tsx   #   Card de um módulo com suas aulas
    │   ├── PlanHeader.tsx   #   Cabeçalho: progresso + config do plano
    │   ├── StudyCalendar.tsx#   Calendário/cronograma de estudos
    │   ├── ProgressBar.tsx
    │   └── StatusBadge.tsx
    ├── data/
    │   └── curriculum.ts    # Grade de módulos e aulas (fonte da verdade)
    ├── lib/
    │   ├── progress-store.ts#   Hooks de progresso + meta (localStorage)
    │   ├── schedule.ts      #   Algoritmo de distribuição do cronograma
    │   └── utils.ts
    └── hooks/
        └── use-mobile.tsx
```

## ✏️ Editando o conteúdo da grade

Toda a grade de aulas vive em [`src/data/curriculum.ts`](src/data/curriculum.ts).
Cada módulo tem título, subtítulo, descrição e uma lista de aulas com
`número`, `título` e `duração` (`mm:ss` ou `hh:mm:ss`). Adicionar ou editar
aulas ali atualiza automaticamente o progresso, os totais e o cronograma.

## 🤖 Desenvolvendo com Claude

Este repositório inclui um [`CLAUDE.md`](CLAUDE.md) com contexto e convenções
para iterações assistidas por IA (Claude Code). Consulte-o antes de mudanças
maiores.

## 📄 Licença

Projeto de uso interno da AUVP. Conteúdo da grade baseado no material público
da AUVP Escola.
