import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ehAdmin } from "@/lib/auth";
import HistoricoRelatorios from "./HistoricoRelatorios";

export default async function HistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: obra }, { data: relatorios }] = await Promise.all([
    supabase.from("obra").select("nome").eq("id", id).single(),
    supabase
      .from("relatorio_mensal")
      .select("id, competencia, travado_em")
      .eq("obra_id", id)
      .order("competencia", { ascending: true }),
  ]);

  if (!obra) {
    notFound();
  }

  const souAdmin = await ehAdmin(supabase, user?.id);

  return (
    <HistoricoRelatorios
      obraId={id}
      obraNome={obra.nome}
      relatorios={(relatorios ?? []).map((r) => ({
        id: r.id as string,
        competencia: r.competencia as string,
        travadoEm: r.travado_em as string | null,
      }))}
      souAdmin={souAdmin}
    />
  );
}
