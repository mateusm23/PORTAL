"use server";

import { createClient } from "@/lib/supabase/server";

// registra uma ação apontada durante a apresentação (texto livre + print
// colado opcional, já enviado pro Storage pelo client antes de chamar isso --
// aqui só grava o caminho, não o arquivo). Sem revalidatePath de propósito:
// nenhuma outra tela lê acao_apresentacao ainda.
export async function registrarAcao(
  obraId: string,
  relatorioId: string,
  telaChave: string,
  texto: string,
  imagemCaminho: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("acao_apresentacao").insert({
    obra_id: obraId,
    relatorio_id: relatorioId,
    tela_chave: telaChave,
    texto,
    imagem_caminho: imagemCaminho,
    criado_por: user?.id,
  });

  if (error) {
    return { erro: error.message };
  }

  return { erro: null };
}
