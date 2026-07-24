import { createClient } from "@/lib/supabase/server";
import CamposObraPainel from "./CamposObraPainel";

export default async function CamposObraPage() {
  const supabase = await createClient();

  const [{ data: obras }, { data: camposAtivos }] = await Promise.all([
    supabase.from("obra").select("id, nome, tipo, escopo, cidade, estado").order("nome"),
    supabase.from("obra_campo_ativo").select("obra_id, campo_chave"),
  ]);

  return <CamposObraPainel obras={obras ?? []} camposAtivosIniciais={camposAtivos ?? []} />;
}
