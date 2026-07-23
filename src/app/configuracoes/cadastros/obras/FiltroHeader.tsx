"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { CustomHeaderProps } from "ag-grid-react";

type FiltroHeaderParams = {
  chave: string;
  valoresUnicos: string[];
  selecionados: Set<string>;
  onChange: (chave: string, novosSelecionados: Set<string>) => void;
};

export default function FiltroHeader(props: CustomHeaderProps & FiltroHeaderParams) {
  const { displayName, chave, valoresUnicos, selecionados, onChange } = props;
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const [marcadosLocal, setMarcadosLocal] = useState<Set<string>>(new Set(selecionados));
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMarcadosLocal(new Set(selecionados));
  }, [selecionados]);

  function abrir() {
    const retangulo = botaoRef.current?.getBoundingClientRect();
    if (retangulo) {
      setPosicao({ top: retangulo.bottom + 6, left: Math.max(12, retangulo.right - 224) });
    }
    setAberto(true);
  }

  function alternarValor(valor: string) {
    setMarcadosLocal((atual) => {
      const novo = new Set(atual);
      if (novo.has(valor)) novo.delete(valor);
      else novo.add(valor);
      return novo;
    });
  }

  function aplicar() {
    onChange(chave, marcadosLocal);
    setAberto(false);
  }

  function limpar() {
    const vazio = new Set<string>();
    setMarcadosLocal(vazio);
    onChange(chave, vazio);
    setAberto(false);
  }

  const temSelecao = selecionados.size > 0;

  return (
    <div className="flex w-full items-center justify-between gap-1.5">
      <span>{displayName}</span>
      <button
        ref={botaoRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (aberto) setAberto(false);
          else abrir();
        }}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
          aberto || temSelecao
            ? "bg-blue-600 text-white"
            : "bg-white/10 text-sky-200 hover:bg-white/20 hover:text-white"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
          <path d="M3 5h18l-7 8v6l-4-2v-4z" />
        </svg>
      </button>

      {aberto &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[999]" onClick={() => setAberto(false)} />
            <div
              className="fixed z-[1000] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              style={{ top: posicao.top, left: posicao.left }}
            >
              <div className="max-h-56 overflow-y-auto p-2">
                {valoresUnicos.map((valor) => (
                  <label
                    key={valor}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={marcadosLocal.has(valor)}
                      onChange={() => alternarValor(valor)}
                      className="h-3.5 w-3.5 accent-blue-600"
                    />
                    {valor}
                  </label>
                ))}
              </div>
              <div className="flex gap-1.5 border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={limpar}
                  className="flex-1 rounded-lg bg-slate-100 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={aplicar}
                  className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
