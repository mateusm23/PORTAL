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

export const CATALOGO_CAMPOS_GERAIS = {
  construtora: { label: "Construtora", icone: Building20Regular },
  incorporadora: { label: "Incorporadora", icone: Building20Regular },
  fundoImobiliario: { label: "Fundo Imobiliário", icone: Building20Regular },
  tipologia: { label: "Tipologia", icone: Home20Regular },
  padrao: { label: "Padrão", icone: Star20Regular },
  fase: { label: "Fase", icone: Flag20Regular },
  unidades: { label: "Unidades", icone: PeopleTeam20Regular },
  lotes: { label: "Lotes", icone: PeopleTeam20Regular },
  areaConstruida: { label: "Área construída", icone: ResizeLarge20Regular },
  areaTerreno: { label: "Área do terreno", icone: ResizeLarge20Regular },
  areaPreservacao: { label: "Área de preservação", icone: ResizeLarge20Regular },
} satisfies Record<string, { label: string; icone: FluentIcon }>;
