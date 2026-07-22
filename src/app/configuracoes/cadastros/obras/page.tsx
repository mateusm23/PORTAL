import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TIPO_LABEL: Record<string, string> = {
  incorporacao_vertical: "Incorporação vertical",
  urbanismo: "Urbanismo",
  multipropriedade: "Multipropriedade",
};

const ESCOPO_LABEL: Record<string, string> = {
  construcao: "Construção",
  gerenciamento: "Gerenciamento",
  administracao: "Administração",
};

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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Nome</th>
              <th className="px-4 py-2.5">Cidade/UF</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Escopo</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(obras ?? []).map((obra) => (
              <tr key={obra.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {obra.nome}
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {[obra.cidade, obra.estado].filter(Boolean).join(", ")}
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {TIPO_LABEL[obra.tipo]}
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {ESCOPO_LABEL[obra.escopo]}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{obra.status}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/configuracoes/cadastros/obras/${obra.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
