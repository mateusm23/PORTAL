"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function salvarFotoObra(obraId: string, fotoUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("obra_info_fixa")
    .upsert({ obra_id: obraId, foto_url: fotoUrl, atualizado_em: new Date().toISOString() });

  if (error) {
    return { erro: error.message };
  }

  revalidatePath(`/painel/${obraId}`);
  return { erro: null };
}

export async function salvarInformacoesGerais(obraId: string, endereco: string, valores: Record<string, string>) {
  const supabase = await createClient();

  const { error: erroInfoFixa } = await supabase
    .from("obra_info_fixa")
    .upsert({ obra_id: obraId, endereco, atualizado_em: new Date().toISOString() });

  if (erroInfoFixa) {
    return { erro: erroInfoFixa.message };
  }

  // update, não upsert: o engenheiro só pode alterar o valor de campos que o
  // admin já habilitou (inseriu) antes -- nunca cria linha nova aqui.
  const resultados = await Promise.all(
    Object.entries(valores).map(([campoChave, valor]) =>
      supabase
        .from("obra_campo_ativo")
        .update({ valor, atualizado_em: new Date().toISOString() })
        .eq("obra_id", obraId)
        .eq("campo_chave", campoChave),
    ),
  );
  const comErro = resultados.find((r) => r.error);
  if (comErro?.error) {
    return { erro: comErro.error.message };
  }

  revalidatePath(`/painel/${obraId}`);
  revalidatePath(`/painel/${obraId}/atualizar-informacoes/gerais`);
  return { erro: null };
}

// ---------- Relatório Mensal ----------
// diferente de Informações Gerais acima: aqui é por competência (mês/ano),
// e cada seção finaliza por conta própria (relatorio_secao_status).

type SupabaseServidor = Awaited<ReturnType<typeof createClient>>;

// registra que uma seção foi tocada neste relatório: cria a linha de status
// na primeira vez (carimbando primeira_edicao_em) ou só atualiza
// ultima_edicao_em nas vezes seguintes -- sem isso, editar duas vezes
// resetaria a "primeira edição" e quebraria a análise de gargalo futura.
async function marcarSecaoEditada(supabase: SupabaseServidor, relatorioId: string, secaoChave: string, usuarioId: string | undefined) {
  const agora = new Date().toISOString();
  const { data: existente } = await supabase
    .from("relatorio_secao_status")
    .select("relatorio_id")
    .eq("relatorio_id", relatorioId)
    .eq("secao_chave", secaoChave)
    .maybeSingle();

  if (existente) {
    await supabase
      .from("relatorio_secao_status")
      .update({ ultima_edicao_em: agora, atualizado_por: usuarioId })
      .eq("relatorio_id", relatorioId)
      .eq("secao_chave", secaoChave);
  } else {
    await supabase
      .from("relatorio_secao_status")
      .insert({ relatorio_id: relatorioId, secao_chave: secaoChave, primeira_edicao_em: agora, ultima_edicao_em: agora, atualizado_por: usuarioId });
  }
}

// competenciaIso escolhida pelo usuário (seletor de mês/ano na tela de
// início) -- antes era calculada sozinha (mês atual, ou último+1), o que
// impedia lançar o primeiro relatório num mês diferente do corrente ou
// voltar depois pra preencher um mês que ficou pra trás (obra parada).
export async function criarNovoRelatorio(obraId: string, competenciaIso: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: relatorio, error } = await supabase
    .from("relatorio_mensal")
    .insert({ obra_id: obraId, competencia: competenciaIso, criado_por: user?.id })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique_violation -- já existe relatorio_mensal(obra_id, competencia)
    const erro = error.code === "23505" ? "Já existe um relatório pra esse mês nessa obra." : error.message;
    return { erro, relatorioId: null };
  }

  await supabase
    .from("relatorio_secao_status")
    .insert({ relatorio_id: relatorio.id, secao_chave: "informacoesCapa" });

  revalidatePath(`/painel/${obraId}/atualizar-informacoes`, "layout");
  return { erro: null, relatorioId: relatorio.id as string };
}

// fecha o mês: qualquer usuário vinculado à obra pode travar um relatório
// aberto como histórico (RLS "usuario fecha relatorio que acompanha" em
// 009_relatorio_trava.sql garante que só destravado -> travado é permitido).
export async function fecharRelatorio(obraId: string, relatorioId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("relatorio_mensal")
    .update({ travado_em: new Date().toISOString(), travado_por: user?.id })
    .eq("id", relatorioId);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath(`/painel/${obraId}/atualizar-informacoes`, "layout");
  return { erro: null };
}

// reabre um relatório travado -- só admin (RLS "admin reabre relatorio" é
// quem garante isso de verdade; a tela só mostra o botão pra admin, mas a
// trava real é no banco).
export async function reabrirRelatorio(obraId: string, relatorioId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("relatorio_mensal")
    .update({ travado_em: null, reaberto_em: new Date().toISOString(), reaberto_por: user?.id })
    .eq("id", relatorioId);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath(`/painel/${obraId}/atualizar-informacoes`, "layout");
  return { erro: null };
}

export async function salvarInformacoesCapa(
  obraId: string,
  relatorioId: string,
  valores: { clienteContratante: string; responsavelTecnico: string; registroProfissional: string; logotipoUrl: string | null },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("relatorio_informacoes_capa").upsert({
    relatorio_id: relatorioId,
    cliente_contratante: valores.clienteContratante,
    responsavel_tecnico: valores.responsavelTecnico,
    registro_profissional: valores.registroProfissional,
    logotipo_url: valores.logotipoUrl,
    atualizado_por: user?.id,
    atualizado_em: new Date().toISOString(),
  });

  if (error) {
    return { erro: error.message };
  }

  await marcarSecaoEditada(supabase, relatorioId, "informacoesCapa", user?.id);

  revalidatePath(`/painel/${obraId}/atualizar-informacoes/relatorio/informacoesCapa`);
  revalidatePath(`/painel/${obraId}/atualizar-informacoes`, "layout");
  return { erro: null };
}

export async function replicarUltimoRelatorio(obraId: string, relatorioId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // relatório sendo editado agora pode ser retroativo (backfill de um mês
  // que ficou pra trás) -- "replicar do último" precisa buscar o relatório
  // cronologicamente ANTERIOR a este, não só "qualquer outro mais recente"
  // (senão poderia trazer dado de um mês futuro em relação ao que se está
  // preenchendo).
  const { data: esteRelatorio } = await supabase
    .from("relatorio_mensal")
    .select("competencia")
    .eq("id", relatorioId)
    .single();

  const { data: anterior } = esteRelatorio
    ? await supabase
        .from("relatorio_mensal")
        .select("id")
        .eq("obra_id", obraId)
        .lt("competencia", esteRelatorio.competencia)
        .order("competencia", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  if (!anterior) {
    return { erro: "Não existe relatório anterior pra replicar." };
  }

  const { data: dadosAnteriores } = await supabase
    .from("relatorio_informacoes_capa")
    .select("cliente_contratante, responsavel_tecnico, registro_profissional, logotipo_url")
    .eq("relatorio_id", anterior.id)
    .maybeSingle();

  if (!dadosAnteriores) {
    return { erro: "O relatório anterior ainda não tinha essa seção preenchida." };
  }

  const { error } = await supabase.from("relatorio_informacoes_capa").upsert({
    relatorio_id: relatorioId,
    cliente_contratante: dadosAnteriores.cliente_contratante,
    responsavel_tecnico: dadosAnteriores.responsavel_tecnico,
    registro_profissional: dadosAnteriores.registro_profissional,
    logotipo_url: dadosAnteriores.logotipo_url,
    atualizado_por: user?.id,
    atualizado_em: new Date().toISOString(),
  });

  if (error) {
    return { erro: error.message };
  }

  await marcarSecaoEditada(supabase, relatorioId, "informacoesCapa", user?.id);

  revalidatePath(`/painel/${obraId}/atualizar-informacoes/relatorio/informacoesCapa`);
  return {
    erro: null,
    valores: {
      clienteContratante: dadosAnteriores.cliente_contratante ?? "",
      responsavelTecnico: dadosAnteriores.responsavel_tecnico ?? "",
      registroProfissional: dadosAnteriores.registro_profissional ?? "",
      logotipoUrl: dadosAnteriores.logotipo_url,
    },
  };
}

export async function alternarFinalizarSecao(obraId: string, relatorioId: string, secaoChave: string, finalizar: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await marcarSecaoEditada(supabase, relatorioId, secaoChave, user?.id);

  const { error } = await supabase
    .from("relatorio_secao_status")
    .update({
      finalizado: finalizar,
      finalizado_em: finalizar ? new Date().toISOString() : null,
      atualizado_por: user?.id,
    })
    .eq("relatorio_id", relatorioId)
    .eq("secao_chave", secaoChave);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath(`/painel/${obraId}/atualizar-informacoes/relatorio/${secaoChave}`);
  revalidatePath(`/painel/${obraId}/atualizar-informacoes`, "layout");
  return { erro: null };
}
