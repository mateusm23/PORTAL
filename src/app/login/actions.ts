"use server";

import { createClient } from "@/lib/supabase/server";

export async function enviarLinkMagico(email: string) {
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Aponta pro /auth/callback (não /auth/confirm) porque estamos usando
  // o template de email padrão do Supabase (sem SMTP customizado ainda),
  // que gera um link no formato antigo (token na URL, não token_hash).
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { erro: error.message };
  }

  return { erro: null };
}
