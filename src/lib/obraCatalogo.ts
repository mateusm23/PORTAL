// fonte única de rótulos e cores de tipo/escopo/status de obra,
// usada tanto na tabela de cadastro quanto na vitrine do painel
export type CorBadge =
  | "brand"
  | "danger"
  | "important"
  | "informative"
  | "severe"
  | "subtle"
  | "success"
  | "warning";

export const TIPO_LABEL: Record<string, string> = {
  incorporacao_vertical: "Incorporação vertical",
  urbanismo: "Urbanismo",
  multipropriedade: "Multipropriedade",
};

export const ESCOPO_LABEL: Record<string, string> = {
  construcao: "Construção",
  gerenciamento: "Gerenciamento",
  administracao: "Administração",
};

export const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  concluida: "Concluída",
};

// paleta semântica do próprio Fluent UI (nada de roxo/rosa arbitrário)
export const TIPO_COR: Record<string, CorBadge> = {
  incorporacao_vertical: "brand",
  urbanismo: "success",
  multipropriedade: "informative",
};

export const ESCOPO_COR: Record<string, CorBadge> = {
  construcao: "severe",
  gerenciamento: "brand",
  administracao: "important",
};

export const STATUS_COR: Record<string, CorBadge> = {
  ativa: "success",
  pausada: "warning",
  concluida: "subtle",
};
