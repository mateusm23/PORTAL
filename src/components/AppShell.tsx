import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "./Logo";
import RailAccount from "./RailAccount";
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

export default async function AppShell({
  children,
  titulo,
  subtitulo,
  secaoAtiva,
  flyout,
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  secaoAtiva: (typeof NAV)[number]["chave"];
  flyout?: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nome = user?.email ?? "";
  if (user) {
    const { data: usuario } = await supabase
      .from("usuario")
      .select("nome")
      .eq("id", user.id)
      .single();
    if (usuario?.nome) nome = usuario.nome;
  }

  return (
    <div
      className="flex overflow-hidden bg-slate-50"
      style={{ position: "fixed", inset: 0 }}
    >
      <aside className="flex w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-3.5">
        <LogoMark className="mb-5 h-8 w-8 shrink-0 rounded-lg" />

        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV.map((item) => {
            const ativo = item.chave === secaoAtiva;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                  ativo
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <item.Icone className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {user && (
          <RailAccount
            nome={nome}
            email={user.email ?? ""}
            versao={VERSAO}
            ultimoDeploy={ULTIMO_DEPLOY}
          />
        )}
      </aside>

      {flyout && (
        <div className="flex w-[252px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
          {flyout}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-7">
        <h1 className="text-lg font-semibold text-slate-900">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
