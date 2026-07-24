import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import AtualizarInformacoesForm from "./AtualizarInformacoesForm";

export default async function AtualizarInformacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: obra }, { data: infoFixa }, { data: camposAtivos }] = await Promise.all([
    supabase.from("obra").select("id, nome, tipo, escopo, cidade, estado").eq("id", id).single(),
    supabase.from("obra_info_fixa").select("foto_url, endereco").eq("obra_id", id).maybeSingle(),
    supabase.from("obra_campo_ativo").select("campo_chave, valor").eq("obra_id", id),
  ]);

  if (!obra) {
    notFound();
  }

  return (
    <AppShell titulo="Atualizar Informações" subtitulo={obra.nome} secaoAtiva="obras">
      <AtualizarInformacoesForm
        obra={obra}
        infoFixaInicial={infoFixa ?? { foto_url: null, endereco: null }}
        camposAtivosIniciais={camposAtivos ?? []}
      />
    </AppShell>
  );
}
