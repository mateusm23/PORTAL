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

  // pode haver mais de um relatório aberto ao mesmo tempo (mês atual +
  // algum retroativo) -- a sidebar entra num deles conforme o relatorioId
  // que já está na própria URL (ver AtualizarInformacoesFlyout), então aqui
  // só monta um mapa com o status de seções de CADA relatório em andamento.
  const { data: relatoriosEmAndamento } = await supabase
    .from("relatorio_mensal")
    .select("id")
    .eq("obra_id", id)
    .is("travado_em", null);

  const statusPorRelatorio: Record<string, Partial<Record<SecaoChave, { finalizado: boolean; editado: boolean }>>> = {};
  for (const relatorio of relatoriosEmAndamento ?? []) {
    const { data: status } = await supabase
      .from("relatorio_secao_status")
      .select("secao_chave, finalizado, primeira_edicao_em")
      .eq("relatorio_id", relatorio.id);

    const statusPorSecao: Partial<Record<SecaoChave, { finalizado: boolean; editado: boolean }>> = {};
    for (const s of status ?? []) {
      statusPorSecao[s.secao_chave as SecaoChave] = { finalizado: s.finalizado, editado: s.primeira_edicao_em !== null };
    }
    statusPorRelatorio[relatorio.id] = statusPorSecao;
  }

  return (
    <AppShell titulo={obra.nome} secaoAtiva="obras" flyout={<AtualizarInformacoesFlyout obraId={id} statusPorRelatorio={statusPorRelatorio} />}>
      {children}
    </AppShell>
  );
}
