import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

type Obra = {
  id: string;
  nome: string;
  tipo: "incorporacao_vertical" | "urbanismo";
  escopo: "construcao" | "gerenciamento";
  status: "ativa" | "concluida" | "pausada";
};

const TIPO_LABEL: Record<Obra["tipo"], string> = {
  incorporacao_vertical: "Incorporação vertical",
  urbanismo: "Urbanismo",
};

const ESCOPO_LABEL: Record<Obra["escopo"], string> = {
  construcao: "Construção",
  gerenciamento: "Gerenciamento",
};

const STATUS: Record<Obra["status"], { label: string; dot: string; text: string }> = {
  ativa: { label: "Ativa", dot: "bg-emerald-500", text: "text-emerald-700" },
  pausada: { label: "Pausada", dot: "bg-amber-500", text: "text-amber-700" },
  concluida: { label: "Concluída", dot: "bg-slate-400", text: "text-slate-600" },
};

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: obras } = await supabase
    .from("obra")
    .select("id, nome, tipo, escopo, status")
    .order("nome");

  return (
    <AppShell titulo="Obras" email={user?.email}>
      {!obras || obras.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma obra vinculada ao seu usuário ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(obras as Obra[]).map((obra) => {
            const status = STATUS[obra.status];
            return (
              <div
                key={obra.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="font-medium text-slate-900">{obra.nome}</h2>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${status.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {TIPO_LABEL[obra.tipo]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {ESCOPO_LABEL[obra.escopo]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
