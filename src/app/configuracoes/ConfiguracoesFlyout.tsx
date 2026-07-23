"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from "@fluentui/react-components";

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
  const gruposAbertosPorPadrao = GRUPOS.filter((grupo) =>
    grupo.itens.some((item) => pathname.startsWith(item.href)),
  ).map((grupo) => grupo.chave);

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

      <Accordion multiple collapsible defaultOpenItems={gruposAbertosPorPadrao}>
        {GRUPOS.map((grupo) => (
          <AccordionItem key={grupo.chave} value={grupo.chave}>
            <AccordionHeader>{grupo.titulo}</AccordionHeader>
            <AccordionPanel>
              <div className="ml-[10px] flex flex-col border-l border-slate-200 pl-3">
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
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
