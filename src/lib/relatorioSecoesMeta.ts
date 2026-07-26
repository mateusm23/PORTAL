// Versão "server-safe" do catálogo de seções — sem nenhum import de
// @fluentui/react-icons. Server Components (page.tsx/layout.tsx) importam
// daqui; a versão com ícones (relatorioSecoesCatalogo.ts, "use client" only
// por transitividade) importa este arquivo por baixo pra não duplicar
// label/temReplicar/emConstrucao. Descoberto na prática: importar um ícone
// de @fluentui/react-icons dentro de um Server Component quebra o build
// ("Attempted to call __styles() from the server") — por isso a separação.
//
// Nomenclatura "seção" aqui = "frente de atuação" (termo fechado com o Mateus
// em 2026-07-26, mapeando os 13 .pbix/.xlsx reais em `dados-obras/`): cada
// entrada é preenchida uma vez por competência pelo engenheiro. Quantas
// páginas isso vira no PDF final é outra coisa (ver `paginas` abaixo) — uma
// frente pode virar mais de uma página só por espaço, sem mudar o dado.

// mesmos 3 valores de obra.escopo (fonte de rótulo: webapp/src/lib/obraCatalogo.ts,
// ESCOPO_LABEL) — repetido aqui como union literal só pra poder tipar
// "aplicaAoEscopo" abaixo.
export type Escopo = "construcao" | "gerenciamento" | "administracao";

export type SecaoChave =
  | "informacoesCapa"
  | "prazo"
  | "financeiro"
  | "legalizacaoProjetos"
  | "deliberacoes"
  | "fornecedores"
  | "seguranca"
  | "qualidade"
  | "auditoriaEmpreiteiros"
  | "fotos"
  | "resumoExecutivo";

export type PaginaRelatorio = { chave: string; label: string };

export type SecaoMeta = {
  label: string;
  temReplicar: boolean;
  emConstrucao: boolean;
  /** undefined = vale pra obra de qualquer escopo. Só marcar quando tiver evidência real
   * (ver dados-obras/catalogo-outras-abas.json) — por enquanto só Auditoria de
   * Empreiteiros tem essa evidência (apareceu em 6 das 13 obras reais). */
  aplicaAoEscopo?: Escopo[];
  /** como essa frente se divide em páginas no PDF final — só layout/espaço,
   * não é dado novo. Toda frente tem pelo menos 1. */
  paginas: PaginaRelatorio[];
};

export const SECOES_RELATORIO_META: Record<SecaoChave, SecaoMeta> = {
  informacoesCapa: {
    label: "Informações da Capa", temReplicar: true, emConstrucao: false,
    paginas: [{ chave: "capa", label: "Capa" }],
  },
  prazo: {
    label: "Prazo", temReplicar: false, emConstrucao: true,
    paginas: [
      { chave: "marcos", label: "Marcos" },
      { chave: "evolucao", label: "Evolução" },
    ],
  },
  financeiro: {
    label: "Financeiro", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "financeiro", label: "Financeiro" }],
  },
  legalizacaoProjetos: {
    label: "Legalização e Projetos", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "legalizacaoProjetos", label: "Legalização e Projetos" }],
  },
  deliberacoes: {
    label: "Deliberações e Follow-up", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "deliberacoes", label: "Deliberações e Follow-up" }],
  },
  fornecedores: {
    label: "Fornecedores", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "fornecedores", label: "Fornecedores" }],
  },
  seguranca: {
    label: "Segurança", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "seguranca", label: "Segurança" }],
  },
  qualidade: {
    label: "Qualidade", temReplicar: false, emConstrucao: true,
    paginas: [
      { chave: "qualidade", label: "Qualidade" },
      { chave: "csat", label: "CSAT" },
    ],
  },
  auditoriaEmpreiteiros: {
    label: "Auditoria de Empreiteiros", temReplicar: false, emConstrucao: true,
    aplicaAoEscopo: ["construcao"],
    paginas: [{ chave: "auditoriaEmpreiteiros", label: "Auditoria de Empreiteiros" }],
  },
  fotos: {
    label: "Fotos", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "fotos", label: "Fotos" }],
  },
  resumoExecutivo: {
    label: "Resumo Executivo", temReplicar: false, emConstrucao: true,
    paginas: [{ chave: "resumoExecutivo", label: "Resumo Executivo" }],
  },
};
