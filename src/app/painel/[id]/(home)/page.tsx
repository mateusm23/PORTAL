import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ObraHome from "./ObraHome";

export default async function ObraHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: obra }, { data: infoFixa }, { data: camposAtivos }, { data: relatorioExistente }] = await Promise.all([
    supabase.from("obra").select("id, nome, tipo, escopo, status, cidade, estado").eq("id", id).single(),
    supabase.from("obra_info_fixa").select("foto_url, endereco").eq("obra_id", id).maybeSingle(),
    supabase.from("obra_campo_ativo").select("campo_chave, valor").eq("obra_id", id),
    // só pra saber se o card "Dashboard" (apresentação) já tem o que mostrar
    // -- sem relatório nenhum lançado, não há o que apresentar ainda.
    supabase.from("relatorio_mensal").select("id").eq("obra_id", id).limit(1).maybeSingle(),
  ]);

  if (!obra) {
    notFound();
  }

  return (
    <ObraHome
      obra={obra}
      infoFixa={infoFixa ?? { foto_url: null, endereco: null }}
      camposAtivos={camposAtivos ?? []}
      temRelatorio={!!relatorioExistente}
    />
  );
}
