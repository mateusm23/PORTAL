"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tokens } from "@fluentui/react-components";
import { CheckmarkCircle20Filled, Circle20Regular, Home20Regular } from "@fluentui/react-icons";
import { SECOES_RELATORIO, type SecaoChave } from "@/lib/relatorioSecoesCatalogo";

type StatusSecao = { finalizado: boolean; editado: boolean };

// "Informações Gerais" e as seções do relatório são contextos separados --
// nunca aparecem juntos aqui: dentro de uma seção do relatório, some o
// acesso a Informações Gerais (e vice-versa). Ver CONTEXTO_PROJETO.md.
export default function AtualizarInformacoesFlyout({
  obraId,
  statusPorRelatorio,
}: {
  obraId: string;
  /** status de seções de cada relatório em andamento, indexado por relatorioId -- pode haver mais de um aberto ao mesmo tempo */
  statusPorRelatorio: Record<string, Partial<Record<SecaoChave, StatusSecao>>>;
}) {
  const pathname = usePathname();
  const emSecao = pathname.includes("/atualizar-informacoes/relatorio/");
  // URL é .../relatorio/{relatorioId}/{secao} -- o relatorioId ativo vem do
  // próprio pathname, não precisa vir como prop (evita layout aninhado só
  // pra saber "qual dos relatórios abertos é esse").
  const partesAposRelatorio = emSecao ? pathname.split("/relatorio/")[1]?.split("/") : undefined;
  const relatorioIdAtivo = partesAposRelatorio?.[0] ?? null;
  const secaoAtivaChave = partesAposRelatorio?.[1] ?? null;
  const statusPorSecao = relatorioIdAtivo ? statusPorRelatorio[relatorioIdAtivo] ?? {} : {};
  const emGerais = pathname.endsWith("/atualizar-informacoes/gerais");

  return (
    <div className="p-2">
      <Link
        href={`/painel/${obraId}/atualizar-informacoes`}
        className="block rounded-md px-2.5 py-2.5 text-[13.5px] font-semibold text-slate-900 hover:bg-slate-50"
      >
        Atualizar Informações
      </Link>

      {!emSecao && (
        <Link
          href={`/painel/${obraId}/atualizar-informacoes/gerais`}
          className={`mt-1 mb-2.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] ${
            emGerais ? "bg-slate-100 text-slate-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <Home20Regular fontSize={13} />
          </span>
          Informações Gerais
        </Link>
      )}

      {emSecao && (
        <>
          <div className="mt-3 mb-1.5 px-2.5 text-[11px] font-bold tracking-wide text-slate-500">SEÇÕES DO RELATÓRIO</div>
          {(Object.entries(SECOES_RELATORIO) as [SecaoChave, (typeof SECOES_RELATORIO)[SecaoChave]][]).map(([chave, secao]) => {
            const Icone = secao.icone;
            const status = statusPorSecao[chave] ?? { finalizado: false, editado: false };
            const ativo = chave === secaoAtivaChave;
            return (
              <Link
                key={chave}
                href={`/painel/${obraId}/atualizar-informacoes/relatorio/${relatorioIdAtivo}/${chave}`}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] ${
                  ativo ? "bg-blue-50 font-medium text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Icone fontSize={13} />
                </span>
                <span className="flex-1">{secao.label}</span>
                {status.finalizado ? (
                  <CheckmarkCircle20Filled fontSize={15} style={{ color: tokens.colorPaletteGreenForeground1 }} />
                ) : (
                  <Circle20Regular
                    fontSize={15}
                    style={{ color: status.editado ? tokens.colorPaletteMarigoldForeground1 : tokens.colorNeutralStrokeDisabled }}
                  />
                )}
              </Link>
            );
          })}
          <div className="mt-2 px-2.5 text-[11px] leading-snug text-slate-400">
            Seções marcadas &quot;em construção&quot; aparecem na navegação mas ainda não têm formulário.
          </div>
        </>
      )}
    </div>
  );
}
