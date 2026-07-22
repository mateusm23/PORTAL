"use server";

import { createClient } from "@/lib/supabase/server";
import { traduzErroAuth } from "@/lib/supabase/erros";

export async function pedirRedefinicaoSenha(email: string) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) {
    return { erro: traduzErroAuth(error.message) };
  }

  return { erro: null };
}
