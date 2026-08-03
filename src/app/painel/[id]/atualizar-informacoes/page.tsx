import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SECOES_RELATORIO_META } from "@/lib/relatorioSecoesMeta";
import { ehAdmin } from "@/lib/auth";
import InicioRelatorioMensal from "./InicioRelatorioMensal";

export default async function AtualizarInformacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: obra }, { data: relatorios, error: erroRelatorios }] = await Promise.all([
    supabase.from("obra").select("nome").eq("id", id).single(),
    supabase
      .from("relatorio_mensal")
      .select("id, competencia, travado_em")
      .eq("obra_id", id)
      .order("competencia", { ascending: true }),
  ]);

  if (!obra) {
    notFound();
  }
  // não engole o erro silenciosamente -- se a migration 009 (coluna
  // travado_em) ainda não rodou no banco, essa query falha, e sem esse log
  // a tela simplesmente mostra "nenhum relatório" como se a obra estivesse
  // vazia, escondendo o problema real.
  if (erroRelatorios) {
    console.error("Falha ao buscar relatorio_mensal -- rodou a migration 009_relatorio_trava.sql?", erroRelatorios);
  }

  const totalSecoes = Object.values(SECOES_RELATORIO_META).filter((s) => !s.emConstrucao).length;

  const abertos = (relatorios ?? []).filter((r) => r.travado_em === null);
  const historico = (relatorios ?? []).filter((r) => r.travado_em !== null);

  const emAndamento = await Promise.all(
    abertos.map(async (r) => {
      const { count } = await supabase
        .from("relatorio_secao_status")
        .select("secao_chave", { count: "exact", head: true })
        .eq("relatorio_id", r.id)
        .eq("finalizado", true);
      return { id: r.id as string, competencia: r.competencia as string, finalizadasCount: count ?? 0 };
    }),
  );

  const souAdmin = await ehAdmin(supabase, user?.id);

  return (
    <InicioRelatorioMensal
      obraId={id}
      obraNome={obra.nome}
      emAndamento={emAndamento}
      historico={historico.map((r) => ({ id: r.id as string, competencia: r.competencia as string }))}
      competenciasExistentes={(relatorios ?? []).map((r) => r.competencia as string)}
      totalSecoes={totalSecoes}
      souAdmin={souAdmin}
    />
  );
}
