import type { FluentIcon } from "@fluentui/react-icons";
import {
  Building20Regular,
  Home20Regular,
  Star20Regular,
  Flag20Regular,
  PeopleTeam20Regular,
  ResizeLarge20Regular,
} from "@fluentui/react-icons";

// catálogo pequeno e controlado dos campos possíveis da seção "Informações
// Gerais" — cresce aos poucos, sob demanda (ver feedback do Mateus sobre
// "ir aos poucos" em 2026-07-24). Cada obra liga só os campos que fazem
// sentido pra ela (tela admin em configuracoes/cadastros/campos-obra);
// o valor de cada um é preenchido pelo engenheiro em Atualizar Informações.
export type CampoChave = keyof typeof CATALOGO_CAMPOS_GERAIS;

// "grupo" separa os campos em 2 blocos só na prévia do dashboard da capa
// (DashboardCapaDialog) — "Detalhes do Projeto" vs "Dados de Área do
// Projeto", mesma divisão usada na capa da Versão Atual (Power BI).
export const CATALOGO_CAMPOS_GERAIS = {
  construtora: { label: "Construtora", icone: Building20Regular, grupo: "detalhes" },
  incorporadora: { label: "Incorporadora", icone: Building20Regular, grupo: "detalhes" },
  fundoImobiliario: { label: "Fundo Imobiliário", icone: Building20Regular, grupo: "detalhes" },
  tipologia: { label: "Tipologia", icone: Home20Regular, grupo: "detalhes" },
  padrao: { label: "Padrão", icone: Star20Regular, grupo: "detalhes" },
  fase: { label: "Fase", icone: Flag20Regular, grupo: "detalhes" },
  uso: { label: "Uso", icone: Home20Regular, grupo: "detalhes" },
  unidades: { label: "Unidades", icone: PeopleTeam20Regular, grupo: "area" },
  lotes: { label: "Lotes", icone: PeopleTeam20Regular, grupo: "area" },
  areaConstruida: { label: "Área construída", icone: ResizeLarge20Regular, grupo: "area" },
  areaTerreno: { label: "Área do terreno", icone: ResizeLarge20Regular, grupo: "area" },
  areaPreservacao: { label: "Área de preservação", icone: ResizeLarge20Regular, grupo: "area" },
  // confirmados no mapeamento real das 13 obras (dados-obras/), 2026-07-27:
  areaPrivativa: { label: "Área privativa", icone: ResizeLarge20Regular, grupo: "area" },
  areaEquivalente: { label: "Área equivalente", icone: ResizeLarge20Regular, grupo: "area" },
  coeficienteProjeto: { label: "Coeficiente de projeto (AP/AC)", icone: ResizeLarge20Regular, grupo: "area" },
  // especificos de obra de loteamento/urbanismo (Santa Inês, Vila Mercedes)
  sistemaViario: { label: "Sistema Viário", icone: ResizeLarge20Regular, grupo: "area" },
  areaResidencialMista: { label: "Área residencial/mista", icone: ResizeLarge20Regular, grupo: "area" },
  areaVerdePublica: { label: "Área Verde Pública", icone: ResizeLarge20Regular, grupo: "area" },
} satisfies Record<string, { label: string; icone: FluentIcon; grupo: "detalhes" | "area" }>;
