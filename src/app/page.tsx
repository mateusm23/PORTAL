import Link from "next/link";

const ETAPAS = [
  {
    titulo: "Fundação do projeto",
    descricao: "Aplicação criada e publicada em produção.",
    status: "concluido" as const,
  },
  {
    titulo: "Login da equipe",
    descricao: "Cada engenheiro e gerente com seu próprio acesso.",
    status: "em-breve" as const,
  },
  {
    titulo: "Modelo de dados",
    descricao: "As 12 seções do relatório, uma por obra e por mês.",
    status: "em-breve" as const,
  },
  {
    titulo: "Preenchimento",
    descricao: "Formulários e planilhas fluidas, com copiar/colar e importação de arquivo.",
    status: "em-breve" as const,
  },
  {
    titulo: "Fotos das obras",
    descricao: "Upload direto pelo site, organizado por obra e mês.",
    status: "em-breve" as const,
  },
  {
    titulo: "Geração do relatório em PDF",
    descricao: "Exportação do relatório final para envio ao cliente.",
    status: "em-breve" as const,
  },
];

function Selo({ status }: { status: "concluido" | "em-breve" }) {
  if (status === "concluido") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Concluído
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Em breve
    </span>
  );
}

export default function Home() {
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
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Em construção
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-20">
        <section className="pt-10 pb-16">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            O novo lugar para preencher e gerar os relatórios das obras.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
            Esta aplicação vai substituir a planilha, o Power BI e a
            exportação manual por um único sistema: preenchimento,
            fotos, análise e PDF final, tudo em um lugar só.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            Andamento
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ETAPAS.map((etapa) => (
              <div
                key={etapa.titulo}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {etapa.titulo}
                  </h3>
                  <Selo status={etapa.status} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {etapa.descricao}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-slate-400 dark:text-slate-600">
        Projeto pessoal — Mateus Monteiro
      </footer>
    </div>
  );
}
