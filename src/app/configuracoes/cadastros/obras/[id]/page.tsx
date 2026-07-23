import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ObraForm from "../ObraForm";

export default async function EditarObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: obra }, { data: cidadesData }] = await Promise.all([
    supabase
      .from("obra")
      .select("nome, tipo, escopo, status, estado, cidade")
      .eq("id", id)
      .single(),
    supabase.from("obra").select("cidade").not("cidade", "is", null),
  ]);

  if (!obra) notFound();

  const cidadesExistentes = Array.from(
    new Set((cidadesData ?? []).map((o) => o.cidade).filter(Boolean) as string[]),
  ).sort();

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500">Editar obra</h2>
      <ObraForm
        obraId={id}
        cidadesExistentes={cidadesExistentes}
        valoresIniciais={{
          nome: obra.nome,
          tipo: obra.tipo,
          escopo: obra.escopo,
          status: obra.status,
          estado: obra.estado ?? "",
          cidade: obra.cidade ?? "",
        }}
      />
    </div>
  );
}
