import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function EsqueciSenhaPage() {
  return (
    <AuthShell>
      <h1 className="text-lg font-semibold text-slate-900">
        Esqueceu sua senha?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Entre em contato com o administrador do portal para que ele
        revise seu acesso e defina uma nova senha para você.
      </p>

      <p className="mt-5 text-sm text-slate-500">
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </AuthShell>
  );
}
