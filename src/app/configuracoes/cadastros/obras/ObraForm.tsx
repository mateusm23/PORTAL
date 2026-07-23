"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { criarObra, atualizarObra, type ObraInput } from "./actions";

const campo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const rotulo = "mb-1 block text-xs font-medium text-slate-600";

export default function ObraForm({
  obraId,
  valoresIniciais,
  cidadesExistentes,
}: {
  obraId?: string;
  valoresIniciais?: Partial<ObraInput>;
  cidadesExistentes?: string[];
}) {
  const valoresBase: ObraInput = {
    nome: valoresIniciais?.nome ?? "",
    tipo: valoresIniciais?.tipo ?? "incorporacao_vertical",
    escopo: valoresIniciais?.escopo ?? "gerenciamento",
    status: valoresIniciais?.status ?? "ativa",
    estado: valoresIniciais?.estado ?? "",
    cidade: valoresIniciais?.cidade ?? "",
  };

  const [dados, setDados] = useState<ObraInput>(valoresBase);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const alterado = JSON.stringify(dados) !== JSON.stringify(valoresBase);

  useEffect(() => {
    function avisar(event: BeforeUnloadEvent) {
      if (!alterado) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  function campoMudou<K extends keyof ObraInput>(chave: K, valor: ObraInput[K]) {
    setDados((atual) => ({ ...atual, [chave]: valor }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    startTransition(async () => {
      const resultado = obraId
        ? await atualizarObra(obraId, dados)
        : await criarObra(dados);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label className={rotulo}>Nome</label>
        <input
          required
          className={campo}
          value={dados.nome}
          onChange={(e) => campoMudou("nome", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={rotulo}>Tipo</label>
          <select
            className={campo}
            value={dados.tipo}
            onChange={(e) => campoMudou("tipo", e.target.value)}
          >
            <option value="incorporacao_vertical">Incorporação vertical</option>
            <option value="urbanismo">Urbanismo</option>
            <option value="multipropriedade">Multipropriedade</option>
          </select>
        </div>
        <div>
          <label className={rotulo}>Escopo</label>
          <select
            className={campo}
            value={dados.escopo}
            onChange={(e) => campoMudou("escopo", e.target.value)}
          >
            <option value="construcao">Construção</option>
            <option value="gerenciamento">Gerenciamento</option>
            <option value="administracao">Administração</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={rotulo}>Cidade</label>
          <input
            className={campo}
            list="cidades-existentes"
            value={dados.cidade}
            onChange={(e) => campoMudou("cidade", e.target.value)}
          />
          <datalist id="cidades-existentes">
            {(cidadesExistentes ?? []).map((cidade) => (
              <option key={cidade} value={cidade} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={rotulo}>Estado</label>
          <input
            className={campo}
            maxLength={2}
            placeholder="UF"
            value={dados.estado}
            onChange={(e) => campoMudou("estado", e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div>
        <label className={rotulo}>Status</label>
        <select
          className={campo}
          value={dados.status}
          onChange={(e) => campoMudou("status", e.target.value)}
        >
          <option value="ativa">Ativa</option>
          <option value="pausada">Pausada</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : obraId ? "Salvar alterações" : "Criar obra"}
      </button>
    </form>
  );
}
