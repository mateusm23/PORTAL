import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ObrasTabela from "./ObrasTabela";

export default async function CadastroObrasPage() {
  const supabase = await createClient();
  const { data: obras } = await supabase
    .from("obra")
    .select("id, nome, tipo, escopo, status, cidade, estado")
    .order("nome");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-500">
          {obras?.length ?? 0} obras cadastradas
        </h2>
        <Link
          href="/configuracoes/cadastros/obras/novo"
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova obra
        </Link>
      </div>

      <Suspense>
        <ObrasTabela obras={obras ?? []} />
      </Suspense>
    </div>
  );
}
