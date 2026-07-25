// Versão "server-safe" do catálogo de seções — sem nenhum import de
// @fluentui/react-icons. Server Components (page.tsx/layout.tsx) importam
// daqui; a versão com ícones (relatorioSecoesCatalogo.ts, "use client" only
// por transitividade) importa este arquivo por baixo pra não duplicar
// label/temReplicar/emConstrucao. Descoberto na prática: importar um ícone
// de @fluentui/react-icons dentro de um Server Component quebra o build
// ("Attempted to call __styles() from the server") — por isso a separação.
export type SecaoChave = "informacoesCapa" | "prazo" | "financeiro";

export const SECOES_RELATORIO_META: Record<SecaoChave, { label: string; temReplicar: boolean; emConstrucao: boolean }> = {
  informacoesCapa: { label: "Informações da Capa", temReplicar: true, emConstrucao: false },
  prazo: { label: "Prazo", temReplicar: false, emConstrucao: true },
  financeiro: { label: "Financeiro", temReplicar: false, emConstrucao: true },
};
