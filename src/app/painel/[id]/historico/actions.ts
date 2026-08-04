"use server";

import { createClient } from "@/lib/supabase/server";
import { CAMPOS_GERAIS_INFO, type CampoChave } from "@/lib/obraCampoCatalogoInfo";
import { formatarCompetencia } from "@/lib/competencia";

// pra "Visualizar" nesta página: ela não tem formulário/estado local
// (diferente de SecaoRelatorioForm.tsx, que monta camposGerais a partir de
// valores já carregados no form) -- então busca e monta tudo aqui, server-
// side, pra um relatorioId qualquer.
//
// criarNovoRelatorio/fecharRelatorio/reabrirRelatorio (v3.16) não precisam
// de wrapper aqui -- HistoricoRelatorios.tsx importa direto de
// atualizar-informacoes/actions.ts.
export async function buscarDadosVisualizacao(obraId: string, relatorioId: string) {
  const supabase = await createClient();

  const [{ data: obra }, { data: relatorio }, { data: infoCapa }, { data: infoFixa }, { data: camposAtivos }] =
    await Promise.all([
      supabase.from("obra").select("nome, cidade, estado").eq("id", obraId).single(),
      supabase.from("relatorio_mensal").select("competencia").eq("id", relatorioId).eq("obra_id", obraId).maybeSingle(),
      supabase
        .from("relatorio_informacoes_capa")
        .select("cliente_contratante, responsavel_tecnico, registro_profissional, logotipo_url")
        .eq("relatorio_id", relatorioId)
        .maybeSingle(),
      supabase.from("obra_info_fixa").select("foto_url").eq("obra_id", obraId).maybeSingle(),
      supabase.from("obra_campo_ativo").select("campo_chave, valor").eq("obra_id", obraId),
    ]);

  if (!obra || !relatorio) {
    return { erro: "Relatório não encontrado.", dados: null };
  }

  const camposGerais = (camposAtivos ?? []).map((c) => {
    const meta = CAMPOS_GERAIS_INFO[c.campo_chave as CampoChave];
    return { chave: c.campo_chave, label: meta?.label ?? c.campo_chave, valor: c.valor ?? "", grupo: meta?.grupo ?? ("detalhes" as const) };
  });

  return {
    erro: null,
    dados: {
      obraNome: obra.nome as string,
      cidade: obra.cidade as string | null,
      estado: obra.estado as string | null,
      competencia: formatarCompetencia(relatorio.competencia as string),
      fotoUrl: (infoFixa?.foto_url as string | null) ?? null,
      camposGerais,
      clienteContratante: infoCapa?.cliente_contratante ?? null,
      responsavelTecnico: infoCapa?.responsavel_tecnico ?? null,
      registroProfissional: infoCapa?.registro_profissional ?? null,
      logotipoUrl: infoCapa?.logotipo_url ?? null,
    },
  };
}
