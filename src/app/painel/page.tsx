import { createClient } from "@/lib/supabase/server";
import { sair } from "./actions";

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            PR
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            Portal de Relatórios Mensais
          </span>
        </div>
        <form action={sair}>
          <button
            type="submit"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Sair
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Login funcionando
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Você entrou como <strong>{user?.email}</strong>. Esta é a
            área protegida — só aparece pra quem já fez login.
          </p>
        </div>
      </main>
    </div>
  );
}
