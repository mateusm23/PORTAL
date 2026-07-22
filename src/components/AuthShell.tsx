type StatusFarol = "ok" | "atencao" | "critico";

const FAROL: Array<{ label: string; status: StatusFarol }> = [
  { label: "Prazo", status: "ok" },
  { label: "Financeiro", status: "atencao" },
  { label: "Segurança", status: "ok" },
  { label: "Qualidade", status: "ok" },
];

const CORES: Record<StatusFarol, { dot: string; text: string; label: string }> = {
  ok: { dot: "bg-emerald-500", text: "text-emerald-700", label: "Em dia" },
  atencao: { dot: "bg-amber-500", text: "text-amber-700", label: "Atenção" },
  critico: { dot: "bg-red-500", text: "text-red-700", label: "Crítico" },
};

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 bg-white">
      <div className="hidden flex-1 flex-col justify-center px-16 lg:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            PR
          </div>
          <span className="font-semibold text-slate-900">
            Portal de Relatórios Mensais
          </span>
        </div>

        <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-balance text-slate-900">
          O relatório mensal das suas obras, sempre em dia.
        </h1>
        <p className="mt-4 max-w-sm text-base text-slate-600">
          Preenchimento, fotos e farol de controle de cada obra, em um
          só lugar — sem depender de planilha.
        </p>

        <div className="mt-10 w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="mb-4 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Farol de controle · Julho
          </p>
          <ul className="flex flex-col gap-3">
            {FAROL.map((item) => {
              const cor = CORES[item.status];
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700">{item.label}</span>
                  <span
                    className={`flex items-center gap-1.5 font-medium ${cor.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cor.dot}`} />
                    {cor.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center border-l border-slate-100 bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              PR
            </div>
            <span className="font-semibold text-slate-900">
              Portal de Relatórios Mensais
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
