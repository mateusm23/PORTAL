"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ObraInput = {
  nome: string;
  tipo: string;
  escopo: string;
  status: string;
  estado: string;
  cidade: string;
};

export async function criarObra(dados: ObraInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("obra").insert({
    nome: dados.nome,
    tipo: dados.tipo,
    escopo: dados.escopo,
    status: dados.status,
    estado: dados.estado || null,
    cidade: dados.cidade || null,
  });

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/painel");
  redirect("/configuracoes/cadastros/obras?sucesso=criada");
}

export async function atualizarObra(id: string, dados: ObraInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("obra")
    .update({
      nome: dados.nome,
      tipo: dados.tipo,
      escopo: dados.escopo,
      status: dados.status,
      estado: dados.estado || null,
      cidade: dados.cidade || null,
    })
    .eq("id", id);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/painel");
  redirect("/configuracoes/cadastros/obras?sucesso=atualizada");
}

export async function atualizarStatusObra(id: string, status: string) {
  return atualizarCampoObra(id, "status", status);
}

export async function atualizarCampoObra(
  id: string,
  campo: "tipo" | "escopo" | "status",
  valor: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("obra")
    .update({ [campo]: valor })
    .eq("id", id);

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/painel");
  revalidatePath("/configuracoes/cadastros/obras");
  return { erro: null };
}
