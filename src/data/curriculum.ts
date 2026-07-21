export type Lesson = {
  id: string;
  number: string; // "Aula 01", "Bônus", "Extra"
  title: string;
  duration: string; // mm:ss or hh:mm:ss
};

export type Module = {
  id: string;
  index: number | null; // null para módulos bônus
  title: string;
  subtitle: string;
  description: string;
  totalDuration: string;
  lessons: Lesson[];
};

const mk =
  (modId: string) =>
  (n: string, t: string, d: string): Lesson => ({
    id: `${modId}-${n}-${t}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80),
    number: n,
    title: t,
    duration: d,
  });

export const modules: Module[] = [
  {
    id: "m1",
    index: 1,
    title: "Preparando seu cérebro",
    subtitle: "Mindset e fundamentos",
    description:
      "Mude sua perspectiva sobre dinheiro. Aborda crenças, liberdade financeira e a disciplina necessária para metas.",
    totalDuration: "3h 40min",
    lessons: ((m) => [
      m("Aula 01", "Preparando seu cérebro", "04:49"),
      m("Aula 02", "Por que os ricos ficam cada vez mais ricos?", "13:37"),
      m("Aula 03", "Crenças limitantes", "17:09"),
      m("Aula 04", "Juros Compostos", "15:43"),
      m("Aula 05", "O que é Liberdade Financeira?", "20:07"),
      m("Bônus", "AUVP Crédito", "02:42"),
      m("Aula 06", "Como não cair em golpes", "23:28"),
      m("Aula 07", "Metade salada e metade droga", "07:19"),
      m("Aula 08", "Autoajuda é o caralho", "11:09"),
      m("Aula 09", "Pare de procrastinar", "13:19"),
      m("Aula 10", "Aula da família", "1:21:33"),
      m("Bônus", "Onde investir sua reserva de emergência", "11:16"),
    ])(mk("m1")),
  },
  {
    id: "m2",
    index: 2,
    title: "Organize seus gastos",
    subtitle: "Vida financeira no controle",
    description:
      "Montar um orçamento, identificar gargalos e entender financiamentos, consórcios e previdência privada.",
    totalDuration: "1h 24min",
    lessons: ((m) => [
      m("Aula 01", "Finanças pessoais", "20:30"),
      m("Aula 02", "Como usar seu cartão de crédito", "19:00"),
      m("Aula 03", "Como resolver as dívidas", "05:55"),
      m("Aula 04", "Financiamento de imóvel faz sentido?", "19:39"),
      m("Aula 05", "Consórcios SÃO TOPS?", "09:30"),
      m("Aula 06", "Viver de renda e primeiro milhão", "10:17"),
    ])(mk("m2")),
  },
  {
    id: "m3",
    index: 3,
    title: "Renda Fixa",
    subtitle: "Tesouro, CDBs, LCIs e mais",
    description:
      "Tesouro Direto, CDBs, Debêntures, LCIs/LCAs, Marcação a Mercado, Contrafluxo e Juros Semestrais.",
    totalDuration: "5h 00min",
    lessons: ((m) => [
      m("Aula 01", "O que é Renda Fixa?", "11:40"),
      m("Aula 02", "Escolhendo uma corretora", "13:20"),
      m("Aula 03", "Introdução ao Tesouro Direto", "17:55"),
      m("Aula 04", "Tesouro Selic", "15:49"),
      m("Aula 05", "Tesouro pré-fixado", "13:51"),
      m("Aula 06", "Tesouro IPCA+", "07:50"),
      m("Aula 07", "Marcação a mercado", "03:32"),
      m("Aula 07", "Marcação a mercado - Parte 2", "18:00"),
      m("Aula 08", "Tesouro Prefixado e IPCA+ com Juros Semestrais", "05:19"),
      m("Bônus", "Conhecendo nossos ETF's - AUPO11", "20:36"),
      m("Bônus", "Conhecendo nossos ETF's - AREA11", "13:38"),
      m("Aula 09", "Tesouro Educa+ e Renda+", "06:31"),
      m("Aula 10", "CDBs, LCs e RDBs", "27:00"),
      m("Aula 11", "LCI e LCA", "08:15"),
      m("Aula 12", "CRI's e CRA's", "10:53"),
      m("Aula 13", "Debentures", "17:21"),
      m("Aula 14", "Previdência Privada", "11:19"),
      m("Aula 15", "Fundos de Investimento", "24:38"),
      m("Aula 16", "Contrafluxo", "26:07"),
      m("Aula 17", "Montando uma carteira de Renda Fixa", "07:55"),
    ])(mk("m3")),
  },
  {
    id: "m4",
    index: 4,
    title: "Renda Variável",
    subtitle: "Ações, FIIs, ETFs",
    description:
      "Pilares da renda variável: filosofias, dividendos, ETFs, FIIs, ações e construção de carteira.",
    totalDuration: "9h 39min",
    lessons: ((m) => [
      m("Aula 01", "Introdução à Renda Variável", "03:28"),
      m("Aula 02", "Bolsa de Valores", "17:26"),
      m("Aula 03", "Ações: Preço x Valor", "10:24"),
      m("Aula 04", "Abertura de capital (IPO)", "20:43"),
      m("Aula 05", "Nomenclaturas e termos da bolsa", "27:05"),
      m("Aula 06", "As escolas de investimento", "27:41"),
      m("Aula 07", "Analisando ações", "07:23"),
      m("Aula 07", "Análise de ações - Parte 2", "50:50"),
      m("Aula 07", "Análise de ações - Parte 3", "31:27"),
      m("Aula 07", "Análise de ações - Parte 4", "33:05"),
      m("Aula 08", "Comprando ações, na prática", "09:40"),
      m("Aula 09", "Inserindo no diagrama", "33:19"),
      m("Aula 10", "Pra que serve o preço médio?", "16:02"),
      m("Aula 11", "Proventos", "17:56"),
      m("Aula 12", "Dividendos e Data EX", "19:38"),
      m("Aula 13", "Desdobramentos e Grupamentos", "11:30"),
      m("Aula 14", "Aluguel de Ações", "10:30"),
      m("Aula 15", "Índices e ETF's", "13:51"),
      m("Aula 16", "Fundos Imobiliários", "21:38"),
      m("Aula 16", "Como analisar FIIs na prática? Parte 2", "10:21"),
      m("Aula 16", "Analisando um FII na prática - Parte 3", "21:17"),
      m("Aula 16", "Como identificar FIIs de qualidade - Parte 4", "16:41"),
      m("Aula 17", "Fiagro e fundos de papéis", "19:02"),
      m("Aula 18", "Fi-Infra", "09:54"),
      m("Extra", "Small Caps", "32:26"),
      m("Aula 19", "O método burro", "08:23"),
      m("Aula 20", "Como montar uma carteira de investimentos", "21:09"),
      m(
        "Extra",
        "Por que o brasileiro gosta de investir em dividendos?",
        "18:20",
      ),
      m("Extra", "Armadilhas do Mercado Financeiro", "21:40"),
    ])(mk("m4")),
  },
  {
    id: "m5",
    index: 5,
    title: "Reserva de Valor",
    subtitle: "Ouro e Bitcoin",
    description:
      "Conceito e aplicação da reserva de valor, com estratégias em ouro e Bitcoin.",
    totalDuration: "2h 16min",
    lessons: ((m) => [
      m(
        "Aula 01",
        "O que é uma reserva de valor, e qual a sua função?",
        "19:11",
      ),
      m("Aula 02", "Comprando ouro físico", "14:03"),
      m("Aula 03", "Como investir em ouro", "11:49"),
      m("Aula 04", "História do bitcoin", "19:57"),
      m("Aula 05", "Por que ter Bitcoin?", "12:09"),
      m("Aula 06", "Qual o momento certo de comprar Bitcoin?", "07:45"),
      m("Aula 07", "Armazenando e protegendo seus Bitcoins", "28:11"),
      m("Extra", "Os ciclos ESTRANHOS do Bitcoin", "13:51"),
      m("Bônus", "O que são e quais os benefícios dos stablecoins", "10:11"),
    ])(mk("m5")),
  },
  {
    id: "m6",
    index: 6,
    title: "Investindo no Exterior",
    subtitle: "Mercado americano",
    description:
      "Guia para investir nos EUA: corretoras, ETFs, REITs, ações e renda fixa internacional.",
    totalDuration: "3h 13min",
    lessons: ((m) => [
      m("Aula 01", "Por que investir no exterior?", "25:09"),
      m("Aula 02", "Como funciona o mercado americano?", "13:19"),
      m("Aula 03", "Mercado dos EUA x Brasil", "13:29"),
      m("Aula 04", "ETFs Internacionais", "14:36"),
      m("Aula 04", "ETFs Internacionais - Parte 2", "18:02"),
      m("Aula 04", "ETFs Internacionais - Parte 3", "12:26"),
      m("Aula 05", "REITS", "25:33"),
      m("Aula 06", "Stocks (Ações Americanas)", "26:45"),
      m("Aula 07", "Renda fixa nos Estados Unidos", "16:25"),
      m("Aula 08", "Renda Fixa nos EUA na prática", "27:52"),
    ])(mk("m6")),
  },
  {
    id: "m7",
    index: 7,
    title: "O Começo",
    subtitle: "Carteira na prática",
    description:
      "Módulo prático focado em montar e gerenciar sua carteira de investimentos.",
    totalDuration: "1h 21min",
    lessons: ((m) => [
      m("Aula 01", "O começo", "13:06"),
      m("Aula 02", "Onde você está", "09:50"),
      m(
        "Aula 03",
        "PIAR (Plataforma Integrada de Avaliação de Riscos)",
        "13:01",
      ),
      m("Aula 04", "Corrigindo os erros da sua carteira", "10:51"),
      m("Aula 05", "Como e quando vender uma ação?", "11:29"),
      m("Aula 06", "Como lidar com os erros?", "06:36"),
      m("Aula 07", "E quando uma ação se valoriza demais?", "12:40"),
      m(
        "Aula 08",
        "Controle sobre coisas que fogem do nosso controle",
        "03:29",
      ),
    ])(mk("m7")),
  },
  {
    id: "bonus-ir",
    index: null,
    title: "Bônus: Imposto de Renda",
    subtitle: "Declaração para investidores",
    description:
      "Descomplica a declaração de IR para investidores: como declarar e pagar tributos corretamente.",
    totalDuration: "3h 13min",
    lessons: ((m) => [
      m("Aula 01", "O que é Imposto de Renda?", "17:41"),
      m("Aula 02", "Preparando a declaração", "09:05"),
      m("Aula 03", "O que é e como funciona o IR no Brasil", "24:38"),
      m("Aula 04", "Declarando ações", "24:12"),
      m("Aula 05", "Imposto de Renda na Renda Fixa", "17:00"),
      m("Aula 06", "Imposto de Renda nos Fundos de Investimento", "05:32"),
      m("Aula 07", "Imposto de Renda nos FIIs, Fiagros e FI-Infras", "14:03"),
      m(
        "Aula 08",
        "Declarando dividendos, JCP, rendimentos e bonificações",
        "21:24",
      ),
      m("Aula 09", "Investimentos Internacionais", "19:25"),
      m("Aula 10", "Criptomoedas", "24:45"),
      m("Aula 11", "Como gerar um DARF?", "06:41"),
      m("Aula 12", "Declaração de Autônomo com Carnê-Leão", "08:17"),
    ])(mk("bonus-ir")),
  },
  {
    id: "bonus-indicadores",
    index: null,
    title: "Bônus: Indicadores",
    subtitle: "Indicadores essenciais",
    description: "Indicadores fundamentais para análise de ações e fundos.",
    totalDuration: "~52 min",
    lessons: ((m) => [
      m("Bônus", "ROE (Return on Equity)", "02:48"),
      m("Bônus", "Cotação", "12:35"),
      m("Bônus", "Dívida Líquida x Dívida Bruta", "01:36"),
      m("Bônus", "Dividend Yield", "10:55"),
      m("Bônus", "EBIT (Earnings Before Interest and Taxes)", "03:43"),
      m("Bônus", "P/VPA - Preço sobre Valor Patrimonial por Ação", "10:51"),
      m("Bônus", "P/L - Preço sobre Lucro", "05:19"),
      m("Bônus", "Emissão de cotas", "04:42"),
    ])(mk("bonus-indicadores")),
  },
  {
    id: "bonus-masterclasses",
    index: null,
    title: "Bônus: Masterclasses",
    subtitle: "Aulões aprofundados",
    description: "Aulas extensas e aprofundadas sobre temas-chave.",
    totalDuration: "2h 38min",
    lessons: ((m) => [
      m(
        "Aula 01",
        "O que são os ETFs globais e por que eles são fundamentais?",
        "53:27",
      ),
      m("Aula 02", "Marcação a mercado", "14:04"),
      m("Aula 03", "A leitura e interpretação de indicadores", "54:33"),
      m("Aula 04", "A importância de se blindar do consumismo", "37:32"),
    ])(mk("bonus-masterclasses")),
  },
];

export function durationToSeconds(d: string): number {
  const parts = d.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
  return `${m}min`;
}

export const allLessons = modules.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id })),
);

export const totalSeconds = allLessons.reduce(
  (acc, l) => acc + durationToSeconds(l.duration),
  0,
);
