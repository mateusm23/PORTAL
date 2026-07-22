"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { cadastrar } from "./actions";

export default function CadastroForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [contato, setContato] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    startTransition(async () => {
      const resultado = await cadastrar(nome, email, contato, senha);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Preencha seus dados para acessar o portal.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="text"
          required
          autoFocus
          placeholder="Nome completo"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />

        <input
          type="email"
          required
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />

        <input
          type="tel"
          required
          placeholder="Telefone / contato"
          value={contato}
          onChange={(event) => setContato(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />

        <input
          type="password"
          required
          placeholder="Senha (mínimo 6 caracteres)"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
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
          {pending ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
