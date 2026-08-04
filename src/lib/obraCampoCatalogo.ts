import type { FluentIcon } from "@fluentui/react-icons";
import {
  Building20Regular,
  Home20Regular,
  Star20Regular,
  Flag20Regular,
  PeopleTeam20Regular,
  ResizeLarge20Regular,
} from "@fluentui/react-icons";
import { CAMPOS_GERAIS_INFO, type CampoChave } from "./obraCampoCatalogoInfo";

export type { CampoChave };

// "grupo" separa os campos em 2 blocos só na prévia do dashboard da capa
// (DashboardCapaDialog) — "Detalhes do Projeto" vs "Dados de Área do
// Projeto", mesma divisão usada na capa da Versão Atual (Power BI).
//
// Ícone empresta em cima do dado puro (obraCampoCatalogoInfo.ts) -- esse
// arquivo é o único lugar que pode importar @fluentui/react-icons; qualquer
// código server-only (Server Actions) que só precisa de label/grupo importa
// direto de obraCampoCatalogoInfo.ts, sem passar por aqui.
export const CATALOGO_CAMPOS_GERAIS = {
  construtora: { ...CAMPOS_GERAIS_INFO.construtora, icone: Building20Regular },
  incorporadora: { ...CAMPOS_GERAIS_INFO.incorporadora, icone: Building20Regular },
  fundoImobiliario: { ...CAMPOS_GERAIS_INFO.fundoImobiliario, icone: Building20Regular },
  tipologia: { ...CAMPOS_GERAIS_INFO.tipologia, icone: Home20Regular },
  padrao: { ...CAMPOS_GERAIS_INFO.padrao, icone: Star20Regular },
  fase: { ...CAMPOS_GERAIS_INFO.fase, icone: Flag20Regular },
  uso: { ...CAMPOS_GERAIS_INFO.uso, icone: Home20Regular },
  unidades: { ...CAMPOS_GERAIS_INFO.unidades, icone: PeopleTeam20Regular },
  lotes: { ...CAMPOS_GERAIS_INFO.lotes, icone: PeopleTeam20Regular },
  areaConstruida: { ...CAMPOS_GERAIS_INFO.areaConstruida, icone: ResizeLarge20Regular },
  areaTerreno: { ...CAMPOS_GERAIS_INFO.areaTerreno, icone: ResizeLarge20Regular },
  areaPreservacao: { ...CAMPOS_GERAIS_INFO.areaPreservacao, icone: ResizeLarge20Regular },
  areaPrivativa: { ...CAMPOS_GERAIS_INFO.areaPrivativa, icone: ResizeLarge20Regular },
  areaEquivalente: { ...CAMPOS_GERAIS_INFO.areaEquivalente, icone: ResizeLarge20Regular },
  coeficienteProjeto: { ...CAMPOS_GERAIS_INFO.coeficienteProjeto, icone: ResizeLarge20Regular },
  sistemaViario: { ...CAMPOS_GERAIS_INFO.sistemaViario, icone: ResizeLarge20Regular },
  areaResidencialMista: { ...CAMPOS_GERAIS_INFO.areaResidencialMista, icone: ResizeLarge20Regular },
  areaVerdePublica: { ...CAMPOS_GERAIS_INFO.areaVerdePublica, icone: ResizeLarge20Regular },
} satisfies Record<CampoChave, { label: string; icone: FluentIcon; grupo: "detalhes" | "area" }>;
