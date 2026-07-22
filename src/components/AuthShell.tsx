import { LogoMark } from "./Logo";

type IconProps = { className?: string };

function IconLancar({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 18h16" />
    </svg>
  );
}

function IconValidar({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconRevisar({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconExportar({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4v12M12 16l-4-4M12 16l4-4" />
      <path d="M4 20h16" />
    </svg>
  );
}

const ETAPAS = [
  {
    titulo: "Lançar",
    descricao: "O engenheiro registra os dados e as fotos do mês.",
    Icone: IconLancar,
  },
  {
    titulo: "Validar",
    descricao: "O sistema confere se todas as seções foram preenchidas.",
    Icone: IconValidar,
  },
  {
    titulo: "Revisar",
    descricao: "O responsável aprova antes de publicar.",
    Icone: IconRevisar,
  },
  {
    titulo: "Exportar",
    descricao: "Gera o PDF final, pronto para o cliente.",
    Icone: IconExportar,
  },
];

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-12">
      <div className="grid w-full max-w-5xl items-center gap-16 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <LogoMark className="h-9 w-9 rounded-lg" />
            <span className="font-semibold text-slate-900">
              Portal de Relatórios Mensais
            </span>
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance text-slate-900">
            Do lançamento ao relatório final, em um só lugar.
          </h1>
          <p className="mt-4 max-w-sm text-base text-slate-600">
            Acompanhe o ciclo completo do relatório mensal de cada
            obra, sem planilha e sem retrabalho.
          </p>

          <div className="mt-10 flex flex-col">
            {ETAPAS.map((etapa, i) => (
              <div key={etapa.titulo} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-sm">
                    <etapa.Icone className="h-5 w-5" />
                  </span>
                  {i < ETAPAS.length - 1 && (
                    <span className="my-1 w-px flex-1 bg-slate-200" />
                  )}
                </div>
                <div className={i < ETAPAS.length - 1 ? "pb-6" : ""}>
                  <p className="font-medium text-slate-900">{etapa.titulo}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {etapa.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm justify-self-center">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-9 w-9 rounded-lg" />
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
