"use client";

import { useState, useTransition, type FormEvent } from "react";
import AuthShell from "@/components/AuthShell";
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
    <AuthShell>
      <h1 className="text-lg font-semibold text-slate-900">
        Escolher nova senha
      </h1>
      <p className="mt-1 text-sm text-slate-600">
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
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <input
          type="password"
          required
          placeholder="Confirmar senha nova"
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </AuthShell>
  );
}
