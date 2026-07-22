"use client";

import { useState, useTransition, type FormEvent } from "react";
import { enviarLinkMagico } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    startTransition(async () => {
      const resultado = await enviarLinkMagico(email);
      if (resultado.erro) {
        setErro("Não foi possível enviar o link. Confira o email e tente de novo.");
      } else {
        setEnviado(true);
      }
    });
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
          {enviado ? (
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Verifique seu email
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Mandamos um link de acesso para <strong>{email}</strong>.
                Abre o email e clica no link para entrar — pode fechar
                esta aba.
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Usar outro email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Entrar
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Digite seu email para receber um link de acesso — sem senha.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
                />

                {erro && (
                  <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {pending ? "Enviando..." : "Enviar link de acesso"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
