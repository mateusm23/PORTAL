"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function redefinirSenha(novaSenha: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    return { erro: "Não foi possível trocar a senha. Peça um novo link e tente de novo." };
  }

  redirect("/painel");
}
