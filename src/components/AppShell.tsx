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

const NAV = [{ href: "/painel", label: "Obras", Icone: IconObras }];

export default function AppShell({
  children,
  titulo,
  email,
}: {
  children: React.ReactNode;
  titulo: string;
  email?: string;
}) {
  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-5">
          <LogoMark className="h-7 w-7" />
          <span className="text-sm font-semibold text-slate-900">Portal</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
            >
              <item.Icone className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
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
