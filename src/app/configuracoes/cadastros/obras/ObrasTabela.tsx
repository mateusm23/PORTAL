"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { atualizarStatusObra } from "./actions";

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

const STATUS_OPCOES = [
  { valor: "ativa", label: "Ativa", dot: "bg-emerald-500", text: "text-emerald-700" },
  { valor: "pausada", label: "Pausada", dot: "bg-amber-500", text: "text-amber-700" },
  { valor: "concluida", label: "Concluída", dot: "bg-slate-400", text: "text-slate-600" },
];

function statusInfo(valor: string) {
  return STATUS_OPCOES.find((s) => s.valor === valor) ?? STATUS_OPCOES[0];
}

type Coluna = "nome" | "cidade" | "status";

export default function ObrasTabela({ obras }: { obras: Obra[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEscopo, setFiltroEscopo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<Coluna>("nome");
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

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

  function alternarOrdenacao(coluna: Coluna) {
    if (ordenarPor === coluna) {
      setOrdemAsc((atual) => !atual);
    } else {
      setOrdenarPor(coluna);
      setOrdemAsc(true);
    }
  }

  const obrasFiltradas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase();
    let lista = obras.filter((obra) => {
      if (
        buscaLower &&
        !obra.nome.toLowerCase().includes(buscaLower) &&
        !(obra.cidade ?? "").toLowerCase().includes(buscaLower)
      ) {
        return false;
      }
      if (filtroTipo && obra.tipo !== filtroTipo) return false;
      if (filtroEscopo && obra.escopo !== filtroEscopo) return false;
      if (filtroStatus && obra.status !== filtroStatus) return false;
      return true;
    });

    lista = [...lista].sort((a, b) => {
      let valorA = "";
      let valorB = "";
      if (ordenarPor === "nome") {
        valorA = a.nome;
        valorB = b.nome;
      } else if (ordenarPor === "cidade") {
        valorA = a.cidade ?? "";
        valorB = b.cidade ?? "";
      } else {
        valorA = a.status;
        valorB = b.status;
      }
      const comparacao = valorA.localeCompare(valorB, "pt-BR");
      return ordemAsc ? comparacao : -comparacao;
    });

    return lista;
  }, [obras, busca, filtroTipo, filtroEscopo, filtroStatus, ordenarPor, ordemAsc]);

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filtroEscopo}
          onChange={(e) => setFiltroEscopo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700"
        >
          <option value="">Todos os escopos</option>
          {Object.entries(ESCOPO_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700"
        >
          <option value="">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s.valor} value={s.valor}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-slate-400">
          {obrasFiltradas.length} de {obras.length} obras
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#c7d2e0] bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#0b2e3d] text-left text-xs font-medium text-slate-200">
            <tr>
              <ThOrdenavel
                label="Nome"
                coluna="nome"
                ativa={ordenarPor === "nome"}
                asc={ordemAsc}
                onClick={() => alternarOrdenacao("nome")}
              />
              <ThOrdenavel
                label="Cidade/UF"
                coluna="cidade"
                ativa={ordenarPor === "cidade"}
                asc={ordemAsc}
                onClick={() => alternarOrdenacao("cidade")}
              />
              <th className="border border-[#123c4d] px-4 py-2.5">Tipo</th>
              <th className="border border-[#123c4d] px-4 py-2.5">Escopo</th>
              <ThOrdenavel
                label="Status"
                coluna="status"
                ativa={ordenarPor === "status"}
                asc={ordemAsc}
                onClick={() => alternarOrdenacao("status")}
              />
              <th className="border border-[#123c4d] px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {obrasFiltradas.map((obra, indice) => (
              <LinhaObra key={obra.id} obra={obra} indice={indice} />
            ))}
            {obrasFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-[#c7d2e0] px-4 py-8 text-center text-slate-400"
                >
                  Nenhuma obra encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThOrdenavel({
  label,
  ativa,
  asc,
  onClick,
}: {
  label: string;
  coluna: Coluna;
  ativa: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <th className="border border-[#123c4d] px-4 py-2.5">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 hover:text-white"
      >
        {label}
        <span className={ativa ? "text-sky-300" : "text-slate-400"}>
          {ativa && !asc ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}

function LinhaObra({ obra, indice }: { obra: Obra; indice: number }) {
  const [pending, startTransition] = useTransition();
  const status = statusInfo(obra.status);
  const zebra = indice % 2 === 0 ? "bg-white" : "bg-slate-50";

  function trocarStatus(novoStatus: string) {
    startTransition(async () => {
      await atualizarStatusObra(obra.id, novoStatus);
    });
  }

  const celula = "border border-[#c7d2e0] px-4 py-2.5";

  return (
    <tr className={`${zebra} hover:bg-blue-50/40`}>
      <td className={`${celula} font-medium text-slate-900`}>{obra.nome}</td>
      <td className={`${celula} text-slate-500`}>
        {[obra.cidade, obra.estado].filter(Boolean).join(", ")}
      </td>
      <td className={`${celula} text-slate-500`}>{TIPO_LABEL[obra.tipo]}</td>
      <td className={`${celula} text-slate-500`}>{ESCOPO_LABEL[obra.escopo]}</td>
      <td className={celula}>
        <select
          value={obra.status}
          disabled={pending}
          onChange={(e) => trocarStatus(e.target.value)}
          className={`rounded-md border-none bg-transparent py-0.5 pr-6 text-xs font-medium ${status.text} cursor-pointer disabled:opacity-50`}
        >
          {STATUS_OPCOES.map((s) => (
            <option key={s.valor} value={s.valor}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className={`${celula} text-right`}>
        <Link
          href={`/configuracoes/cadastros/obras/${obra.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          Editar
        </Link>
      </td>
    </tr>
  );
}
