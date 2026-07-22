"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setErro(true);
        return;
      }
      router.replace("/painel");
    });
  }, [router]);

  return (
    <AuthShell>
      {erro ? (
        <>
          <h1 className="text-lg font-semibold text-slate-900">
            Não foi possível confirmar
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            O link pode ter expirado ou já ter sido usado.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Voltar para o login
          </a>
        </>
      ) : (
        <p className="text-sm text-slate-500">Confirmando...</p>
      )}
    </AuthShell>
  );
}
