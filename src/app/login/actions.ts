"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { traduzErroAuth } from "@/lib/supabase/erros";

export async function entrar(email: string, senha: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { erro: traduzErroAuth(error.message) };
  }

  redirect("/painel");
}
