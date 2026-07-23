import { createClient } from "@/lib/supabase/server";
import AcessosPainel from "./AcessosPainel";

export default async function AcessosObrasPage() {
  const supabase = await createClient();

  const [
    {
      data: { user: usuarioLogado },
    },
    { data: usuarios },
    { data: obras },
    { data: acessos },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("usuario").select("id, nome, email, is_admin").order("email"),
    supabase.from("obra").select("id, nome, cidade, estado, tipo, escopo, status").order("nome"),
    supabase.from("obra_usuario").select("usuario_id, obra_id"),
  ]);

  return (
    <AcessosPainel
      usuarios={usuarios ?? []}
      obras={obras ?? []}
      acessosIniciais={acessos ?? []}
      usuarioLogadoId={usuarioLogado?.id ?? ""}
    />
  );
}
