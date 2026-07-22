"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        {erro ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Não foi possível confirmar o login. O link pode ter
              expirado ou já ter sido usado.
            </p>
            <a
              href="/login"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Voltar para o login
            </a>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Confirmando login...
          </p>
        )}
      </div>
    </div>
  );
}
