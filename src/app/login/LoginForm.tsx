"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { Input, Button, MessageBar, MessageBarBody } from "@fluentui/react-components";
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
        <Input
          type="email"
          required
          autoFocus
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(_e, data) => setEmail(data.value)}
        />

        <Input
          type="password"
          required
          placeholder="Senha"
          value={senha}
          onChange={(_e, data) => setSenha(data.value)}
        />

        {erro && (
          <MessageBar intent="error">
            <MessageBarBody>{erro}</MessageBarBody>
          </MessageBar>
        )}

        <Button appearance="primary" type="submit" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/cadastro" className="font-medium text-blue-600 hover:underline">
          Criar conta
        </Link>
        <Link href="/esqueci-senha" className="text-slate-500 hover:underline">
          Esqueci minha senha
        </Link>
      </div>
    </>
  );
}
