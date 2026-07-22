import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

const SUBNAV = [
  { href: "/configuracoes", label: "Início" },
  { href: "/configuracoes/cadastros/obras", label: "Cadastros" },
  { href: "/configuracoes/acessos/obras", label: "Acessos" },
];

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell titulo="Configurações" email={user?.email} secaoAtiva="configuracoes">
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {SUBNAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 pb-3 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </AppShell>
  );
}
