import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import AtualizarInformacoesFlyout from "./AtualizarInformacoesFlyout";
import type { SecaoChave } from "@/lib/relatorioSecoesMeta";

export default async function AtualizarInformacoesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: obra } = await supabase.from("obra").select("nome").eq("id", id).single();
  if (!obra) {
    notFound();
  }

  // relatório mais recente da obra — é o único editável (os outros já são
  // histórico). Usado só pra alimentar os indicadores de status na sidebar.
  const { data: relatorioAtual } = await supabase
    .from("relatorio_mensal")
    .select("id")
    .eq("obra_id", id)
    .order("competencia", { ascending: false })
    .limit(1)
    .maybeSingle();

  const statusPorSecao: Partial<Record<SecaoChave, { finalizado: boolean; editado: boolean }>> = {};
  if (relatorioAtual) {
    const { data: status } = await supabase
      .from("relatorio_secao_status")
      .select("secao_chave, finalizado, primeira_edicao_em")
      .eq("relatorio_id", relatorioAtual.id);

    for (const s of status ?? []) {
      statusPorSecao[s.secao_chave as SecaoChave] = { finalizado: s.finalizado, editado: s.primeira_edicao_em !== null };
    }
  }

  return (
    <AppShell titulo={obra.nome} secaoAtiva="obras" flyout={<AtualizarInformacoesFlyout obraId={id} statusPorSecao={statusPorSecao} />}>
      {children}
    </AppShell>
  );
}
