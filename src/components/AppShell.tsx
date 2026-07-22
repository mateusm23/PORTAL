import Link from "next/link";
import { sair } from "@/app/painel/actions";
import { LogoMark } from "./Logo";
import { VERSAO, ULTIMO_DEPLOY } from "@/lib/versao";

function IconObras({ className }: { className?: string }) {
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
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M4 21h16" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IconConfig({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

const NAV = [
  { href: "/painel", chave: "obras", label: "Obras", Icone: IconObras },
  {
    href: "/configuracoes",
    chave: "configuracoes",
    label: "Configurações",
    Icone: IconConfig,
  },
] as const;

export default function AppShell({
  children,
  titulo,
  email,
  secaoAtiva,
}: {
  children: React.ReactNode;
  titulo: string;
  email?: string;
  secaoAtiva: (typeof NAV)[number]["chave"];
}) {
  return (
    <div
      className="flex overflow-hidden bg-slate-50"
      style={{ position: "fixed", inset: 0 }}
    >
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-5">
          <LogoMark className="h-7 w-7" />
          <span className="text-sm font-semibold text-slate-900">Portal</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const ativo = item.chave === secaoAtiva;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                  ativo
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.Icone className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500">Mateus Monteiro</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Deploy: {ULTIMO_DEPLOY}
          </p>
          <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            v{VERSAO}
          </span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <h1 className="text-sm font-semibold text-slate-900">{titulo}</h1>

          {email && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">{email}</span>
              <form action={sair}>
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Sair
                </button>
              </form>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
