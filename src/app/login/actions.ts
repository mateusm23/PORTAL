"use server";

import { createClient } from "@/lib/supabase/server";

export async function enviarLinkMagico(email: string) {
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return { erro: error.message };
  }

  return { erro: null };
}
