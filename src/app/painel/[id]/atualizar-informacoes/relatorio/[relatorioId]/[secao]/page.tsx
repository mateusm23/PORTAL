import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SECOES_RELATORIO_META, type SecaoChave } from "@/lib/relatorioSecoesMeta";
import SecaoRelatorioForm from "./SecaoRelatorioForm";

export default async function SecaoRelatorioPage({ params }: { params: Promise<{ id: string; relatorioId: string; secao: string }> }) {
  const { id, relatorioId, secao } = await params;

  if (!(secao in SECOES_RELATORIO_META)) {
    notFound();
  }
  const secaoChave = secao as SecaoChave;
  const secaoMeta = SECOES_RELATORIO_META[secaoChave];

  const supabase = await createClient();

  const [{ data: obra }, { data: relatorio }] = await Promise.all([
    supabase.from("obra").select("nome, cidade, estado").eq("id", id).single(),
    supabase
      .from("relatorio_mensal")
      .select("id, competencia, travado_em")
      .eq("id", relatorioId)
      .eq("obra_id", id)
      .maybeSingle(),
  ]);

  // sem obra ou sem relatório com esse id (deletado, id errado, obra errada):
  // volta pra tela de decisão, que trata os casos válidos
  if (!obra || !relatorio) {
    notFound();
  }

  const [{ data: status }, { data: infoCapa }, { data: infoFixa }, { data: camposAtivos }, { data: camposSecaoAtivos }] = await Promise.all([
    supabase
      .from("relatorio_secao_status")
      .select("finalizado")
      .eq("relatorio_id", relatorio.id)
      .eq("secao_chave", secaoChave)
      .maybeSingle(),
    secaoChave === "informacoesCapa"
      ? supabase
          .from("relatorio_informacoes_capa")
          .select("cliente_contratante, responsavel_tecnico, registro_profissional, logotipo_url")
          .eq("relatorio_id", relatorio.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("obra_info_fixa").select("foto_url").eq("obra_id", id).maybeSingle(),
    supabase.from("obra_campo_ativo").select("campo_chave, valor").eq("obra_id", id),
    supabase.from("obra_secao_campo_ativo").select("campo_chave").eq("obra_id", id).eq("secao_chave", secaoChave),
  ]);

  return (
    <SecaoRelatorioForm
      obraId={id}
      obraNome={obra.nome}
      cidade={obra.cidade}
      estado={obra.estado}
      secaoChave={secaoChave}
      secaoLabel={secaoMeta.label}
      temReplicar={secaoMeta.temReplicar}
      emConstrucao={secaoMeta.emConstrucao}
      relatorioId={relatorio.id}
      competencia={relatorio.competencia}
      travado={relatorio.travado_em !== null}
      finalizado={status?.finalizado ?? false}
      infoCapaInicial={infoCapa ?? { cliente_contratante: null, responsavel_tecnico: null, registro_profissional: null, logotipo_url: null }}
      fotoUrl={infoFixa?.foto_url ?? null}
      camposAtivos={camposAtivos ?? []}
      camposSecaoAtivos={(camposSecaoAtivos ?? []).map((c) => c.campo_chave)}
    />
  );
}
