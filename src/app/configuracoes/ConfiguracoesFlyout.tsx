"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GRUPOS = [
  {
    chave: "cadastros",
    titulo: "Cadastros",
    itens: [{ href: "/configuracoes/cadastros/obras", label: "Obras" }],
  },
  {
    chave: "acessos",
    titulo: "Acessos",
    itens: [{ href: "/configuracoes/acessos/obras", label: "Usuários × Obras" }],
  },
];

export default function ConfiguracoesFlyout() {
  const pathname = usePathname();
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  return (
    <div className="p-2">
      <Link
        href="/configuracoes"
        className={`mb-1 block rounded-md px-2 py-2.5 text-[13.5px] font-medium ${
          pathname === "/configuracoes"
            ? "bg-blue-50 text-blue-700"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        Configurações
      </Link>

      {GRUPOS.map((grupo) => {
        const temItemAtivo = grupo.itens.some((item) =>
          pathname.startsWith(item.href),
        );
        const aberto = abertos[grupo.chave] ?? temItemAtivo;

        return (
          <div key={grupo.chave} className="mb-0.5">
            <button
              type="button"
              onClick={() =>
                setAbertos((atual) => ({
                  ...atual,
                  [grupo.chave]: !aberto,
                }))
              }
              className="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-[13.5px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-3.5 w-3.5 shrink-0 text-blue-600 transition-transform ${
                  aberto ? "" : "-rotate-90"
                }`}
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
              {grupo.titulo}
            </button>

            {aberto && (
              <div className="ml-[21px] flex flex-col border-l border-slate-200 pl-3">
                {grupo.itens.map((item) => {
                  const ativo = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`my-0.5 rounded-md px-2.5 py-2 text-[13.5px] ${
                        ativo
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
