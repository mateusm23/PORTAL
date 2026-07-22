"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { redefinirSenha } from "./actions";

type Estado = "carregando" | "pronto" | "erro";

export default function RedefinirSenhaPage() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data, error }) => {
      setEstado(error || !data.session ? "erro" : "pronto");
    });
  }, []);

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

  if (estado === "carregando") {
    return (
      <AuthShell>
        <p className="text-sm text-slate-500">Confirmando o link...</p>
      </AuthShell>
    );
  }

  if (estado === "erro") {
    return (
      <AuthShell>
        <h1 className="text-lg font-semibold text-slate-900">
          Link inválido ou expirado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Peça um novo link em &ldquo;Esqueci minha senha&rdquo; e tente
          de novo.
        </p>
        <Link
          href="/esqueci-senha"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Pedir novo link
        </Link>
      </AuthShell>
    );
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
