import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CadastroForm from "./CadastroForm";

export default async function CadastroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/painel");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-16 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            PR
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Portal de Relatórios Mensais
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <CadastroForm />
        </div>
      </div>
    </div>
  );
}
