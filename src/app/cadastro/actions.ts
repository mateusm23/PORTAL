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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, contato },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { erro: traduzErroAuth(error.message) };
  }

  // Com "Confirm email" ligado, o signUp não retorna sessão até a
  // pessoa clicar no link do email -- mostra a tela de "verifique seu
  // email" em vez de já entrar.
  if (!data.session) {
    return { erro: null, aguardandoConfirmacao: true };
  }

  redirect("/painel");
}
