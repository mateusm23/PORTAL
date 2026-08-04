// dado puro (sem ícone) do catálogo de "Informações Gerais" -- separado de
// obraCampoCatalogo.ts de propósito: ícones do @fluentui/react-icons não
// podem ser importados em código server-only (Server Action) sem quebrar o
// build ("Attempted to call __styles() from the server"). Esse arquivo é a
// fonte única de label/grupo; obraCampoCatalogo.ts só empresta ícone por
// cima, pros consumidores client (ObraHome.tsx, SecaoRelatorioForm.tsx).
export const CAMPOS_GERAIS_INFO = {
  construtora: { label: "Construtora", grupo: "detalhes" },
  incorporadora: { label: "Incorporadora", grupo: "detalhes" },
  fundoImobiliario: { label: "Fundo Imobiliário", grupo: "detalhes" },
  tipologia: { label: "Tipologia", grupo: "detalhes" },
  padrao: { label: "Padrão", grupo: "detalhes" },
  fase: { label: "Fase", grupo: "detalhes" },
  uso: { label: "Uso", grupo: "detalhes" },
  unidades: { label: "Unidades", grupo: "area" },
  lotes: { label: "Lotes", grupo: "area" },
  areaConstruida: { label: "Área construída", grupo: "area" },
  areaTerreno: { label: "Área do terreno", grupo: "area" },
  areaPreservacao: { label: "Área de preservação", grupo: "area" },
  // confirmados no mapeamento real das 13 obras (dados-obras/), 2026-07-27:
  areaPrivativa: { label: "Área privativa", grupo: "area" },
  areaEquivalente: { label: "Área equivalente", grupo: "area" },
  coeficienteProjeto: { label: "Coeficiente de projeto (AP/AC)", grupo: "area" },
  // especificos de obra de loteamento/urbanismo (Santa Inês, Vila Mercedes)
  sistemaViario: { label: "Sistema Viário", grupo: "area" },
  areaResidencialMista: { label: "Área residencial/mista", grupo: "area" },
  areaVerdePublica: { label: "Área Verde Pública", grupo: "area" },
} satisfies Record<string, { label: string; grupo: "detalhes" | "area" }>;

export type CampoChave = keyof typeof CAMPOS_GERAIS_INFO;
