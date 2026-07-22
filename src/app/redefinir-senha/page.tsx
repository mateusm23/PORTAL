"use client";

import { useState, useTransition, type FormEvent } from "react";
import { redefinirSenha } from "./actions";

export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }

    startTransition(async () => {
      const resultado = await redefinirSenha(senha);
      if (resultado?.erro) {
        setErro(resultado.erro);
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
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Escolher nova senha
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Digite a nova senha para sua conta.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              type="password"
              required
              autoFocus
              placeholder="Senha nova (mínimo 6 caracteres)"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
            />

            <input
              type="password"
              required
              placeholder="Confirmar senha nova"
              value={confirmacao}
              onChange={(event) => setConfirmacao(event.target.value)}
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
              {pending ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
