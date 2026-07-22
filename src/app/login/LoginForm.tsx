"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { entrar } from "./actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    startTransition(async () => {
      const resultado = await entrar(email, senha);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-slate-900">Entrar</h1>
      <p className="mt-1 text-sm text-slate-600">
        Digite seu email e senha para acessar o portal.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="email"
          required
          autoFocus
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <input
          type="password"
          required
          placeholder="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          href="/cadastro"
          className="font-medium text-blue-600 hover:underline"
        >
          Criar conta
        </Link>
        <Link href="/esqueci-senha" className="text-slate-500 hover:underline">
          Esqueci minha senha
        </Link>
      </div>
    </>
  );
}
