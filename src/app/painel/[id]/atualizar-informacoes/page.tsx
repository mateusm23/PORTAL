import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SECOES_RELATORIO_META } from "@/lib/relatorioSecoesMeta";
import InicioRelatorioMensal from "./InicioRelatorioMensal";

export default async function AtualizarInformacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: obra } = await supabase.from("obra").select("nome").eq("id", id).single();
  if (!obra) {
    notFound();
  }

  const { data: relatorioAtual } = await supabase
    .from("relatorio_mensal")
    .select("id, competencia")
    .eq("obra_id", id)
    .order("competencia", { ascending: false })
    .limit(1)
    .maybeSingle();

  let finalizadasCount = 0;
  if (relatorioAtual) {
    const { count } = await supabase
      .from("relatorio_secao_status")
      .select("secao_chave", { count: "exact", head: true })
      .eq("relatorio_id", relatorioAtual.id)
      .eq("finalizado", true);
    finalizadasCount = count ?? 0;
  }

  // só conta seções que já existem de verdade — Prazo/Financeiro ainda são
  // "em construção" e não têm como finalizar, então não travam o "Gerar PDF"
  // indefinidamente por uma seção que nem foi desenhada ainda.
  const totalSecoes = Object.values(SECOES_RELATORIO_META).filter((s) => !s.emConstrucao).length;

  return (
    <InicioRelatorioMensal
      obraId={id}
      obraNome={obra.nome}
      relatorioAtual={relatorioAtual}
      finalizadasCount={finalizadasCount}
      totalSecoes={totalSecoes}
    />
  );
}
