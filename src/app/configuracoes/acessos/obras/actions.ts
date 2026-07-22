"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function alternarAcesso(
  usuarioId: string,
  obraId: string,
  concedido: boolean,
) {
  const supabase = await createClient();

  if (concedido) {
    await supabase
      .from("obra_usuario")
      .insert({ usuario_id: usuarioId, obra_id: obraId });
  } else {
    await supabase
      .from("obra_usuario")
      .delete()
      .eq("usuario_id", usuarioId)
      .eq("obra_id", obraId);
  }

  revalidatePath("/configuracoes/acessos/obras");
  revalidatePath("/painel");
}
