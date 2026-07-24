"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CampoChave } from "@/lib/obraCampoCatalogo";

export async function habilitarCampo(obraId: string, campoChave: CampoChave) {
  const supabase = await createClient();

  const { error } = await supabase.from("obra_campo_ativo").insert({ obra_id: obraId, campo_chave: campoChave });

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/cadastros/campos-obra");
  return { erro: null };
}

export async function desabilitarCampo(obraId: string, campoChave: CampoChave) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("obra_campo_ativo")
    .delete()
    .eq("obra_id", obraId)
    .eq("campo_chave", campoChave);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/cadastros/campos-obra");
  revalidatePath("/painel");
  return { erro: null };
}
