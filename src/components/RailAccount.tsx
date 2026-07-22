"use client";

import { useEffect, useRef, useState } from "react";
import { sair } from "@/app/painel/actions";

export default function RailAccount({
  nome,
  email,
  versao,
  ultimoDeploy,
}: {
  nome: string;
  email: string;
  versao: string;
  ultimoDeploy: string;
}) {
  const [aberto, setAberto] = useState<"conta" | "versao" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inicial = (nome || email || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    function aoClicarFora(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setAberto(null);
      }
    }
    document.addEventListener("click", aoClicarFora);
    return () => document.removeEventListener("click", aoClicarFora);
  }, []);

  return (
    <div ref={wrapRef} className="flex flex-col items-center">
      <div className="relative mb-3.5">
        <button
          type="button"
          onClick={() => setAberto((atual) => (atual === "conta" ? null : "conta"))}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white hover:brightness-105"
        >
          {inicial}
        </button>

        {aberto === "conta" && (
          <div className="absolute bottom-0 left-[46px] z-10 w-[220px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white">
                {inicial}
              </div>
              <p className="text-[13.5px] font-semibold text-slate-900">{nome}</p>
            </div>
            <p className="mb-2.5 border-b border-slate-100 pb-2.5 text-xs break-all text-slate-500">
              {email}
            </p>
            <form action={sair}>
              <button
                type="submit"
                className="block w-full rounded-md py-1.5 text-left text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
              >
                Sair
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setAberto((atual) => (atual === "versao" ? null : "versao"))}
          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          v{versao}
        </button>

        {aberto === "versao" && (
          <div className="absolute bottom-0 left-[46px] z-10 w-[250px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
            <p className="mb-2.5 text-[12.5px] font-semibold text-slate-900">
              Desenvolvido por Mateus Monteiro
            </p>
            <div className="flex items-center justify-between py-1 text-xs text-slate-500">
              <span>Versão</span>
              <strong className="font-medium text-slate-900">{versao}</strong>
            </div>
            <div className="flex items-center justify-between py-1 text-xs text-slate-500">
              <span>Deploy</span>
              <strong className="font-medium text-slate-900">{ultimoDeploy}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
