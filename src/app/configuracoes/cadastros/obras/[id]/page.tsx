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
  const { data: obra } = await supabase
    .from("obra")
    .select("nome, tipo, escopo, status, estado, cidade")
    .eq("id", id)
    .single();

  if (!obra) notFound();

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500">Editar obra</h2>
      <ObraForm
        obraId={id}
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
