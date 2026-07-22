"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { traduzErroAuth } from "@/lib/supabase/erros";

export async function cadastrar(
  nome: string,
  email: string,
  contato: string,
  senha: string,
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, contato },
    },
  });

  if (error) {
    return { erro: traduzErroAuth(error.message) };
  }

  redirect("/painel");
}
