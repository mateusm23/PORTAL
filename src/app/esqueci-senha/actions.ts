"use server";

import { createClient } from "@/lib/supabase/server";
import { traduzErroAuth } from "@/lib/supabase/erros";

export async function pedirRedefinicaoSenha(email: string) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Aponta direto pro /redefinir-senha (não /auth/confirm) porque
  // voltamos a usar o serviço de email padrão do Supabase (sem SMTP
  // customizado), cujo template gera um link no formato antigo
  // (sessão na URL, não token_hash) -- o mesmo motivo do /auth/callback
  // que já existia pro login.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/redefinir-senha`,
  });

  if (error) {
    return { erro: traduzErroAuth(error.message) };
  }

  return { erro: null };
}
