"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Field, Input, Dropdown, Option, Button, MessageBar, MessageBarBody, MessageBarTitle } from "@fluentui/react-components";
import { TIPO_LABEL, ESCOPO_LABEL, STATUS_LABEL } from "@/lib/obraCatalogo";
import { criarObra, atualizarObra, type ObraInput } from "./actions";

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
      const resultado = obraId ? await atualizarObra(obraId, dados) : await criarObra(dados);
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
      <Field label="Nome" required>
        <Input
          required
          value={dados.nome}
          onChange={(_e, data) => campoMudou("nome", data.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo">
          <Dropdown
            value={TIPO_LABEL[dados.tipo] ?? dados.tipo}
            selectedOptions={[dados.tipo]}
            onOptionSelect={(_e, data) => campoMudou("tipo", data.optionValue ?? dados.tipo)}
          >
            {Object.entries(TIPO_LABEL).map(([valor, label]) => (
              <Option key={valor} value={valor}>
                {label}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Escopo">
          <Dropdown
            value={ESCOPO_LABEL[dados.escopo] ?? dados.escopo}
            selectedOptions={[dados.escopo]}
            onOptionSelect={(_e, data) => campoMudou("escopo", data.optionValue ?? dados.escopo)}
          >
            {Object.entries(ESCOPO_LABEL).map(([valor, label]) => (
              <Option key={valor} value={valor}>
                {label}
              </Option>
            ))}
          </Dropdown>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cidade">
          <Input
            input={{ list: "cidades-existentes" }}
            value={dados.cidade}
            onChange={(_e, data) => campoMudou("cidade", data.value)}
          />
          <datalist id="cidades-existentes">
            {(cidadesExistentes ?? []).map((cidade) => (
              <option key={cidade} value={cidade} />
            ))}
          </datalist>
        </Field>
        <Field label="Estado">
          <Input
            maxLength={2}
            placeholder="UF"
            value={dados.estado}
            onChange={(_e, data) => campoMudou("estado", data.value.toUpperCase())}
          />
        </Field>
      </div>

      <Field label="Status">
        <Dropdown
          value={STATUS_LABEL[dados.status] ?? dados.status}
          selectedOptions={[dados.status]}
          onOptionSelect={(_e, data) => campoMudou("status", data.optionValue ?? dados.status)}
        >
          {Object.entries(STATUS_LABEL).map(([valor, label]) => (
            <Option key={valor} value={valor}>
              {label}
            </Option>
          ))}
        </Dropdown>
      </Field>

      {erro && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Não foi possível salvar</MessageBarTitle>
            {erro}
          </MessageBarBody>
        </MessageBar>
      )}

      <Button appearance="primary" type="submit" disabled={pending}>
        {pending ? "Salvando..." : obraId ? "Salvar alterações" : "Criar obra"}
      </Button>
    </form>
  );
}
