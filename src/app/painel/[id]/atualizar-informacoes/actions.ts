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
  // admin já habilitou (inseriu) antes — nunca cria linha nova aqui.
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
  revalidatePath(`/painel/${obraId}/atualizar-informacoes`);
  return { erro: null };
}
