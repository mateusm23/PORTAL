import Link from "next/link";

function IconCadastros({ className }: { className?: string }) {
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

function IconAcessos({ className }: { className?: string }) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const MODULOS = [
  {
    href: "/configuracoes/cadastros/obras",
    titulo: "Cadastros",
    descricao: "Criar e editar as obras que aparecem no portal.",
    Icone: IconCadastros,
  },
  {
    href: "/configuracoes/acessos/obras",
    titulo: "Acessos",
    descricao: "Definir quais usuários enxergam quais obras.",
    Icone: IconAcessos,
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-slate-500">
        Escolha um módulo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULOS.map((modulo) => (
          <Link
            key={modulo.href}
            href={modulo.href}
            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <modulo.Icone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{modulo.titulo}</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {modulo.descricao}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
