import type { FluentIcon } from "@fluentui/react-icons";
import {
  Image20Regular,
  Flag20Regular,
  Money20Regular,
  Home20Regular,
  BuildingMultiple20Regular,
  ContactCard20Regular,
  Person20Regular,
  Certificate20Regular,
} from "@fluentui/react-icons";
import { SECOES_RELATORIO_META, type SecaoChave } from "./relatorioSecoesMeta";

// catálogo das seções do RELATÓRIO MENSAL, com ícones — só pra uso em
// Client Components (a versão sem ícones, server-safe, é relatorioSecoesMeta.ts).
// Cresce aos poucos: só "Informações da Capa" tem campos de verdade até
// agora; Prazo e Financeiro entram como "emConstrucao".
export type { SecaoChave };

const ICONES_SECAO: Record<SecaoChave, FluentIcon> = {
  informacoesCapa: Image20Regular,
  prazo: Flag20Regular,
  financeiro: Money20Regular,
};

// nomeObra/fotoCapa/tipologia são "somenteLeitura": o admin ainda liga/desliga
// se entram na capa (controla a tela de Configurações · Seções e Campos da
// Obra), mas o engenheiro nunca digita o valor deles aqui — o valor vem de
// outro lugar (cadastro da obra, Foto e Localização, Informações Gerais).
const CAMPOS_INFORMACOES_CAPA = {
  nomeObra: { label: "Nome da obra", icone: BuildingMultiple20Regular, somenteLeitura: true },
  fotoCapa: { label: "Foto de capa", icone: Image20Regular, somenteLeitura: true },
  tipologia: { label: "Tipologia", icone: Home20Regular, somenteLeitura: true },
  clienteContratante: { label: "Cliente / Contratante", icone: ContactCard20Regular },
  responsavelTecnico: { label: "Responsável Técnico", icone: Person20Regular },
  registroProfissional: { label: "Registro (CREA/CAU)", icone: Certificate20Regular },
  logotipoCliente: { label: "Logotipo do Cliente", icone: Image20Regular },
} satisfies Record<string, { label: string; icone: FluentIcon; somenteLeitura?: boolean }>;

export const SECOES_RELATORIO: Record<
  SecaoChave,
  { label: string; icone: FluentIcon; temReplicar: boolean; emConstrucao: boolean; campos?: Record<string, { label: string; icone: FluentIcon; somenteLeitura?: boolean }> }
> = {
  informacoesCapa: { ...SECOES_RELATORIO_META.informacoesCapa, icone: ICONES_SECAO.informacoesCapa, campos: CAMPOS_INFORMACOES_CAPA },
  prazo: { ...SECOES_RELATORIO_META.prazo, icone: ICONES_SECAO.prazo },
  financeiro: { ...SECOES_RELATORIO_META.financeiro, icone: ICONES_SECAO.financeiro },
};
