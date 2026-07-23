"use client";

import { useTransition } from "react";
import { Switch } from "@fluentui/react-components";
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
    <Switch
      defaultChecked={concedidoInicialmente}
      disabled={pending}
      onChange={(_e, data) => {
        startTransition(() => {
          alternarAcesso(usuarioId, obraId, data.checked);
        });
      }}
    />
  );
}
