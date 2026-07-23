"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function alternarAcesso(usuarioId: string, obraId: string, concedido: boolean) {
  const supabase = await createClient();

  const { error } = concedido
    ? await supabase.from("obra_usuario").insert({ usuario_id: usuarioId, obra_id: obraId })
    : await supabase.from("obra_usuario").delete().eq("usuario_id", usuarioId).eq("obra_id", obraId);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/acessos/obras");
  revalidatePath("/painel");
  return { erro: null };
}

export async function definirAcessosDoUsuario(usuarioId: string, obraIds: string[], conceder: boolean) {
  const supabase = await createClient();

  const { error } = conceder
    ? await supabase.from("obra_usuario").insert(obraIds.map((obraId) => ({ usuario_id: usuarioId, obra_id: obraId })))
    : await supabase.from("obra_usuario").delete().eq("usuario_id", usuarioId).in("obra_id", obraIds);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/acessos/obras");
  revalidatePath("/painel");
  return { erro: null };
}

export async function definirAcessosDaObra(obraId: string, usuarioIds: string[], conceder: boolean) {
  const supabase = await createClient();

  const { error } = conceder
    ? await supabase.from("obra_usuario").insert(usuarioIds.map((usuarioId) => ({ usuario_id: usuarioId, obra_id: obraId })))
    : await supabase.from("obra_usuario").delete().eq("obra_id", obraId).in("usuario_id", usuarioIds);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/acessos/obras");
  revalidatePath("/painel");
  return { erro: null };
}

export async function definirAdmin(usuarioId: string, isAdmin: boolean) {
  const supabase = await createClient();

  const { error } = await supabase.from("usuario").update({ is_admin: isAdmin }).eq("id", usuarioId);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/configuracoes/acessos/obras");
  revalidatePath("/configuracoes");
  return { erro: null };
}
