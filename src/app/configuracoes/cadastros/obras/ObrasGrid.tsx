"use client";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import FiltroHeader from "./FiltroHeader";
import { atualizarCampoObra } from "./actions";

ModuleRegistry.registerModules([AllCommunityModule]);

type Obra = {
  id: string;
  nome: string;
  tipo: string;
  escopo: string;
  status: string;
  cidade: string | null;
  estado: string | null;
};

const TIPO_LABEL: Record<string, string> = {
  incorporacao_vertical: "Incorporação vertical",
  urbanismo: "Urbanismo",
  multipropriedade: "Multipropriedade",
};

const ESCOPO_LABEL: Record<string, string> = {
  construcao: "Construção",
  gerenciamento: "Gerenciamento",
  administracao: "Administração",
};

const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  concluida: "Concluída",
};

const TIPO_COR: Record<string, { texto: string; fundo: string }> = {
  incorporacao_vertical: { texto: "#3730a3", fundo: "#e0e7ff" },
  urbanismo: { texto: "#065f46", fundo: "#d1fae5" },
  multipropriedade: { texto: "#6d28d9", fundo: "#ede9fe" },
};

const ESCOPO_COR: Record<string, { texto: string; fundo: string }> = {
  construcao: { texto: "#9a3412", fundo: "#ffedd5" },
  gerenciamento: { texto: "#1d4ed8", fundo: "#dbeafe" },
  administracao: { texto: "#be185d", fundo: "#fce7f3" },
};

const STATUS_COR: Record<string, { texto: string; fundo: string }> = {
  ativa: { texto: "#047857", fundo: "#d1fae5" },
  pausada: { texto: "#b45309", fundo: "#fef3c7" },
  concluida: { texto: "#475569", fundo: "#e2e8f0" },
};

function CampoSelectCell({
  data,
  campo,
  opcoes,
  cores,
}: ICellRendererParams<Obra> & {
  campo: "tipo" | "escopo" | "status";
  opcoes: Record<string, string>;
  cores: Record<string, { texto: string; fundo: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  if (!data) return null;
  const valorAtual = data[campo];
  const corAtual = cores[valorAtual] ?? { texto: "#475569", fundo: "#e2e8f0" };

  function trocar(novoValor: string) {
    startTransition(async () => {
      await atualizarCampoObra(data!.id, campo, novoValor);
      router.refresh();
    });
  }

  return (
    <select
      value={valorAtual}
      disabled={pending}
      onChange={(e) => trocar(e.target.value)}
      className="cursor-pointer rounded-full border-none py-0.5 pr-6 pl-2.5 text-xs font-medium outline-none disabled:opacity-50"
      style={{ color: corAtual.texto, background: corAtual.fundo }}
    >
      {Object.entries(opcoes).map(([valor, label]) => (
        <option key={valor} value={valor}>
          {label}
        </option>
      ))}
    </select>
  );
}

function AcoesCell({ data }: ICellRendererParams<Obra>) {
  if (!data) return null;
  return (
    <Link
      href={`/configuracoes/cadastros/obras/${data.id}`}
      title="Editar obra"
      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    </Link>
  );
}

export default function ObrasGrid({ obras }: { obras: Obra[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busca, setBusca] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<Record<string, Set<string>>>({
    nome: new Set(),
    cidade: new Set(),
    tipo: new Set(),
    escopo: new Set(),
    status: new Set(),
  });

  useEffect(() => {
    const sucesso = searchParams.get("sucesso");
    if (sucesso === "criada") setToast("Obra criada com sucesso.");
    if (sucesso === "atualizada") setToast("Alterações salvas.");
    if (sucesso) {
      router.replace(pathname);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [searchParams, pathname, router]);

  const linhas = useMemo(
    () =>
      obras.map((o) => ({
        ...o,
        cidadeEstado: [o.cidade, o.estado].filter(Boolean).join(", "),
      })),
    [obras],
  );

  function valoresUnicos(chave: "nome" | "cidade" | "tipo" | "escopo" | "status") {
    return Array.from(new Set(linhas.map((l) => String(l[chave] ?? "")).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }

  function aoMudarFiltro(chave: string, novo: Set<string>) {
    setSelecionados((atual) => ({ ...atual, [chave]: novo }));
  }

  const linhasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase();
    return linhas.filter((l) => {
      if (buscaLower && !l.nome.toLowerCase().includes(buscaLower) && !l.cidadeEstado.toLowerCase().includes(buscaLower)) {
        return false;
      }
      if (selecionados.nome.size > 0 && !selecionados.nome.has(l.nome)) return false;
      if (selecionados.cidade.size > 0 && !selecionados.cidade.has(l.cidade ?? "")) return false;
      if (selecionados.tipo.size > 0 && !selecionados.tipo.has(l.tipo)) return false;
      if (selecionados.escopo.size > 0 && !selecionados.escopo.has(l.escopo)) return false;
      if (selecionados.status.size > 0 && !selecionados.status.has(l.status)) return false;
      return true;
    });
  }, [linhas, busca, selecionados]);

  // filtro de tipo/escopo/status é feito pelo rótulo em português, mas o
  // valor salvo é o código -- essa função faz a ponte nos dois sentidos
  function filtroPorLabel(chave: string, labelMap: Record<string, string>) {
    const reverso = Object.fromEntries(Object.entries(labelMap).map(([k, v]) => [v, k]));
    return {
      chave,
      valoresUnicos: valoresUnicos(chave as "tipo" | "escopo" | "status").map(
        (v) => labelMap[v] ?? v,
      ),
      selecionados: new Set(Array.from(selecionados[chave]).map((v) => labelMap[v] ?? v)),
      onChange: (c: string, novo: Set<string>) =>
        aoMudarFiltro(c, new Set(Array.from(novo).map((label) => reverso[label] ?? label))),
    };
  }

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "nome",
        headerName: "Nome",
        flex: 1.3,
        sortable: true,
        headerComponent: FiltroHeader,
        headerComponentParams: {
          chave: "nome",
          valoresUnicos: valoresUnicos("nome"),
          selecionados: selecionados.nome,
          onChange: aoMudarFiltro,
        },
      },
      {
        field: "cidadeEstado",
        headerName: "Cidade/UF",
        flex: 1,
        sortable: true,
        headerComponent: FiltroHeader,
        headerComponentParams: {
          chave: "cidade",
          valoresUnicos: valoresUnicos("cidade"),
          selecionados: selecionados.cidade,
          onChange: aoMudarFiltro,
        },
      },
      {
        field: "tipo",
        headerName: "Tipo",
        flex: 1,
        sortable: true,
        headerComponent: FiltroHeader,
        headerComponentParams: filtroPorLabel("tipo", TIPO_LABEL),
        cellRenderer: (p: ICellRendererParams<Obra>) => (
          <CampoSelectCell {...p} campo="tipo" opcoes={TIPO_LABEL} cores={TIPO_COR} />
        ),
      },
      {
        field: "escopo",
        headerName: "Escopo",
        flex: 1,
        sortable: true,
        headerComponent: FiltroHeader,
        headerComponentParams: filtroPorLabel("escopo", ESCOPO_LABEL),
        cellRenderer: (p: ICellRendererParams<Obra>) => (
          <CampoSelectCell {...p} campo="escopo" opcoes={ESCOPO_LABEL} cores={ESCOPO_COR} />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.9,
        sortable: true,
        headerComponent: FiltroHeader,
        headerComponentParams: filtroPorLabel("status", STATUS_LABEL),
        cellRenderer: (p: ICellRendererParams<Obra>) => (
          <CampoSelectCell {...p} campo="status" opcoes={STATUS_LABEL} cores={STATUS_COR} />
        ),
      },
      {
        headerName: "",
        width: 64,
        sortable: false,
        resizable: false,
        cellRenderer: AcoesCell,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linhas, selecionados],
  );

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <span className="ml-auto text-sm text-slate-400">
          {linhasFiltradas.length} de {obras.length} obras
        </span>
      </div>

      <div
        className="ag-theme-quartz overflow-hidden rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_rgba(15,23,42,0.08)]"
        style={
          {
            height: 480,
            width: "100%",
            "--ag-font-family": "inherit",
            "--ag-header-background-color": "#0e3244",
            "--ag-header-foreground-color": "#eef4f7",
            "--ag-border-color": "transparent",
            "--ag-row-border-color": "rgba(15, 23, 42, 0.05)",
            "--ag-odd-row-background-color": "#eef1f5",
            "--ag-row-hover-color": "#eaf2ff",
            "--ag-font-size": "13px",
            "--ag-cell-horizontal-padding": "16px",
            "--ag-wrapper-border-radius": "20px",
          } as React.CSSProperties
        }
      >
        <AgGridReact
          theme="legacy"
          rowData={linhasFiltradas}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true }}
          getRowId={(p) => p.data.id}
          animateRows
          rowHeight={48}
          headerHeight={44}
          suppressCellFocus
        />
      </div>
    </div>
  );
}
