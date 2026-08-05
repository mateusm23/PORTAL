import { SECOES_RELATORIO_META } from "./relatorioSecoesMeta";

export type Tela = { chave: string; frente: string; label: string; real: boolean };

// achata `paginas` de cada frente do catálogo real numa lista só -- uma tela
// por página do relatório final, sempre em sincronia com relatorioSecoesMeta.ts
// (se uma frente ganhar/perder página, quem usa isso acompanha sozinho).
// Compartilhado entre a Apresentação (Dashboard) e a triagem de Ações --
// ambas precisam resolver `tela_chave` (guardado em acao_apresentacao) pra
// um rótulo legível.
export const TELAS: Tela[] = Object.entries(SECOES_RELATORIO_META).flatMap(([secaoChave, meta]) =>
  meta.paginas.map((p) => ({
    chave: p.chave,
    frente: meta.label,
    label: p.label,
    real: secaoChave === "informacoesCapa",
  })),
);

export function buscarTela(chave: string): Tela | undefined {
  return TELAS.find((t) => t.chave === chave);
}
