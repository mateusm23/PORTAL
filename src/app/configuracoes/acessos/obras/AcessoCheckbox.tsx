"use client";

import { useTransition } from "react";
import { alternarAcesso } from "./actions";

export default function AcessoCheckbox({
  usuarioId,
  obraId,
  concedidoInicialmente,
}: {
  usuarioId: string;
  obraId: string;
  concedidoInicialmente: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        defaultChecked={concedidoInicialmente}
        disabled={pending}
        onChange={(e) => {
          const concedido = e.target.checked;
          startTransition(() => {
            alternarAcesso(usuarioId, obraId, concedido);
          });
        }}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  );
}
