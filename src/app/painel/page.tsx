import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

type Obra = {
  id: string;
  nome: string;
  tipo: "incorporacao_vertical" | "urbanismo" | "multipropriedade";
  escopo: "construcao" | "gerenciamento" | "administracao";
  status: "ativa" | "concluida" | "pausada";
  estado: string | null;
  cidade: string | null;
};

const TIPO_LABEL: Record<Obra["tipo"], string> = {
  incorporacao_vertical: "Incorporação vertical",
  urbanismo: "Urbanismo",
  multipropriedade: "Multipropriedade",
};

const ESCOPO_SECOES: Array<{ chave: Obra["escopo"]; titulo: string }> = [
  { chave: "administracao", titulo: "Administração" },
  { chave: "construcao", titulo: "Construção" },
  { chave: "gerenciamento", titulo: "Gerenciamento" },
];

const STATUS: Record<Obra["status"], { label: string; dot: string; text: string }> = {
  ativa: { label: "Ativa", dot: "bg-emerald-500", text: "text-emerald-700" },
  pausada: { label: "Pausada", dot: "bg-amber-500", text: "text-amber-700" },
  concluida: { label: "Concluída", dot: "bg-slate-400", text: "text-slate-600" },
};

function IconObra({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M4 21h16" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function CardContador({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-slate-900">{valor}</p>
    </div>
  );
}

function CardObra({ obra }: { obra: Obra }) {
  const status = STATUS[obra.status];
  const local = [obra.cidade, obra.estado].filter(Boolean).join(", ");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <IconObra className="h-9 w-9 text-blue-300" />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-slate-900">{obra.nome}</h3>
          <span
            className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        {local && <p className="mb-2 text-xs text-slate-400">{local}</p>}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {TIPO_LABEL[obra.tipo]}
        </span>
      </div>
    </div>
  );
}

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("obra")
    .select("id, nome, tipo, escopo, status, estado, cidade")
    .order("nome");

  const obras = (data ?? []) as Obra[];

  return (
    <AppShell titulo="Obras" email={user?.email} secaoAtiva="obras">
      {obras.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma obra vinculada ao seu usuário ainda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap gap-3">
            <CardContador label="Total de obras" valor={obras.length} />
            {ESCOPO_SECOES.map((secao) => (
              <CardContador
                key={secao.chave}
                label={secao.titulo}
                valor={obras.filter((o) => o.escopo === secao.chave).length}
              />
            ))}
          </div>

          {ESCOPO_SECOES.map((secao) => {
            const obrasDaSecao = obras.filter((o) => o.escopo === secao.chave);
            if (obrasDaSecao.length === 0) return null;

            return (
              <section key={secao.chave}>
                <div className="mb-4 flex items-baseline gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {secao.titulo}
                  </h2>
                  <span className="text-sm text-slate-400">
                    {obrasDaSecao.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {obrasDaSecao.map((obra) => (
                    <CardObra key={obra.id} obra={obra} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
