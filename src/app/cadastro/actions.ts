"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cadastrar(email: string, senha: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (error) {
    return { erro: error.message };
  }

  redirect("/painel");
}
