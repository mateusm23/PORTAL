"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// única ação de atualização, usada tanto pelo toggle rápido "Concluir/
// Reabrir" (cliente manda o objeto atual completo, só invertendo
// concluidoEm) quanto pelo Salvar do modo de edição. Lista explícita de
// colunas no update -- obra_id/relatorio_id/tela_chave/criado_por nunca
// ficam alcançáveis por aqui.
export async function atualizarAcao(
  obraId: string,
  id: string,
  valores: {
    texto: string;
    responsavel: string;
    prazo: string | null;
    concluidoEm: string | null;
    imagemCaminho: string | null;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("acao_apresentacao")
    .update({
      texto: valores.texto,
      responsavel: valores.responsavel.trim() || null,
      prazo: valores.prazo || null,
      concluido_em: valores.concluidoEm,
      imagem_caminho: valores.imagemCaminho,
    })
    .eq("id", id);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath(`/painel/${obraId}/acoes`);
  revalidatePath(`/painel/${obraId}/dashboard`);

  return { erro: null };
}
