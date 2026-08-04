"use client";

import { useState } from "react";
import {
  makeStyles,
  tokens,
  Badge,
  Text,
  Input,
  Switch,
  TabList,
  Tab,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { Search20Regular, BuildingMultiple20Regular, ShieldLock20Regular } from "@fluentui/react-icons";
import { CATALOGO_CAMPOS_GERAIS } from "@/lib/obraCampoCatalogo";
import { SECOES_RELATORIO } from "@/lib/relatorioSecoesCatalogo";
import { TIPO_LABEL } from "@/lib/obraCatalogo";
import { habilitarCampo, desabilitarCampo, habilitarCampoSecao, desabilitarCampoSecao } from "./actions";

type Obra = { id: string; nome: string; tipo: string; escopo: string; cidade: string | null; estado: string | null };
type CampoAtivo = { obra_id: string; campo_chave: string };
type CampoSecaoAtivo = { obra_id: string; secao_chave: string; campo_chave: string };

// catálogo combinado: "Informações Gerais" (estático, sem mês -- obraCampoCatalogo.ts)
// + as seções do relatório mensal que já têm campos de verdade (só
// "Informações da Capa" até agora; Prazo/Financeiro entram aqui quando
// forem desenhados). Pro admin é tudo igual -- só liga/desliga.
const CATALOGO_SECOES = {
  informacoesGerais: { label: "Informações Gerais", campos: CATALOGO_CAMPOS_GERAIS as Record<string, { label: string; icone: (typeof CATALOGO_CAMPOS_GERAIS)[keyof typeof CATALOGO_CAMPOS_GERAIS]["icone"] }> },
  // "Informações da Capa" é a única seção do relatório com campos de verdade
  // até agora -- sempre presente (por isso sem spread condicional, que deixaria
  // o tipo de CATALOGO_SECOES["informacoesCapa"] como "possivelmente undefined").
  informacoesCapa: {
    label: SECOES_RELATORIO.informacoesCapa.label,
    campos: (SECOES_RELATORIO.informacoesCapa.campos ?? {}) as Record<string, { label: string; icone: (typeof CATALOGO_CAMPOS_GERAIS)[keyof typeof CATALOGO_CAMPOS_GERAIS]["icone"] }>,
  },
};

type SecaoId = keyof typeof CATALOGO_SECOES;

function chaveCampo(obraId: string, secaoId: string, campoChave: string) {
  return `${obraId}::${secaoId}::${campoChave}`;
}

const useStyles = makeStyles({
  tituloWrap: { marginBottom: "16px" },
  titulo: { fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1, margin: 0 },
  subtitulo: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, marginTop: "4px" },
  aviso: { marginBottom: "20px" },
  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" },
  cartao: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  painelEsquerdoTopo: { padding: "14px" },
  listaRolavel: { maxHeight: "600px", overflowY: "auto", padding: "0 8px 10px 8px" },
  itemLista: {
    display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px",
    borderRadius: tokens.borderRadiusMedium, cursor: "pointer", borderLeft: "3px solid transparent",
    ":hover": { backgroundColor: tokens.colorNeutralBackground3 },
  },
  itemListaAtivo: {
    backgroundColor: tokens.colorBrandBackground2,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
    ":hover": { backgroundColor: tokens.colorBrandBackground2 },
  },
  itemIconeWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "32px", height: "32px", borderRadius: tokens.borderRadiusCircular, flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3,
  },
  itemTextos: { flex: 1, minWidth: 0 },
  itemTitulo: { fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightMedium, color: tokens.colorNeutralForeground1 },
  itemSubtitulo: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
  itemContagem: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, flexShrink: 0 },
  cabecalhoDireita: { display: "flex", alignItems: "center", gap: "12px", padding: "18px 20px 12px 20px" },
  cabecalhoTextos: { flex: 1, minWidth: 0 },
  abasSecao: { padding: "0 12px", borderBottom: `1px solid ${tokens.colorNeutralStroke3}` },
  linhaCampo: {
    display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px",
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  campoIconeWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "34px", height: "34px", borderRadius: tokens.borderRadiusCircular, flexShrink: 0,
    backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1,
  },
  campoLabel: { flex: 1, fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground1 },
  secaoBloqueadaWrap: {
    padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px",
    color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200,
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
  },
});

export default function CamposObraPainel({
  obras,
  camposAtivosIniciais,
  camposSecaoAtivosIniciais,
}: {
  obras: Obra[];
  camposAtivosIniciais: CampoAtivo[];
  camposSecaoAtivosIniciais: CampoSecaoAtivo[];
}) {
  const classes = useStyles();
  const toasterId = useId("toaster-campos-obra");
  const { dispatchToast } = useToastController(toasterId);

  const [obraId, setObraId] = useState<string | undefined>(obras[0]?.id);
  const [secaoId, setSecaoId] = useState<SecaoId>("informacoesGerais");
  const [busca, setBusca] = useState("");
  const [ativos, setAtivos] = useState<Set<string>>(
    () =>
      new Set([
        ...camposAtivosIniciais.map((c) => chaveCampo(c.obra_id, "informacoesGerais", c.campo_chave)),
        ...camposSecaoAtivosIniciais.map((c) => chaveCampo(c.obra_id, c.secao_chave, c.campo_chave)),
      ]),
  );
  const [pendentes, setPendentes] = useState<Set<string>>(new Set());

  const obrasFiltradas = obras.filter((o) => {
    const b = busca.trim().toLowerCase();
    return !b || o.nome.toLowerCase().includes(b) || (o.cidade ?? "").toLowerCase().includes(b);
  });

  const obraAtual = obras.find((o) => o.id === obraId);
  const secaoAtual = CATALOGO_SECOES[secaoId];

  function contarAtivos(id: string) {
    return Object.entries(CATALOGO_SECOES).reduce(
      (soma, [secao, cat]) => soma + Object.keys(cat.campos).filter((c) => ativos.has(chaveCampo(id, secao, c))).length,
      0,
    );
  }

  async function alternarCampo(campoChave: string, ativo: boolean) {
    if (!obraId || !obraAtual) return;
    const k = chaveCampo(obraId, secaoId, campoChave);
    setPendentes((atual) => new Set(atual).add(k));

    const resultado =
      secaoId === "informacoesGerais"
        ? ativo
          ? await habilitarCampo(obraId, campoChave as never)
          : await desabilitarCampo(obraId, campoChave as never)
        : ativo
          ? await habilitarCampoSecao(obraId, secaoId, campoChave)
          : await desabilitarCampoSecao(obraId, secaoId, campoChave);

    setPendentes((atual) => {
      const novo = new Set(atual);
      novo.delete(k);
      return novo;
    });

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível atualizar o campo agora. Nada foi alterado. Tente de novo.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setAtivos((atual) => {
      const novo = new Set(atual);
      if (ativo) novo.add(k);
      else novo.delete(k);
      return novo;
    });
    dispatchToast(
      <Toast>
        <ToastTitle>
          {secaoAtual.campos[campoChave].label} {ativo ? "ativado" : "desativado"} para {obraAtual.nome}.
        </ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  if (obras.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma obra cadastrada ainda.</p>;
  }

  return (
    <div>
      <Toaster toasterId={toasterId} />

      <div className={classes.tituloWrap}>
        <h1 className={classes.titulo}>Seções e Campos da Obra</h1>
        <div className={classes.subtitulo}>
          Só admin vê essa tela: decide quais campos cada obra mostra, seção por seção. O engenheiro nunca vê essa configuração, só o resultado dela.
        </div>
      </div>

      <MessageBar intent="warning" className={classes.aviso}>
        <MessageBarBody>
          <MessageBarTitle>
            <ShieldLock20Regular style={{ verticalAlign: "middle", marginRight: 6 }} />
            Área restrita ao administrador
          </MessageBarTitle>
          Isso aqui só define ESTRUTURA (quais campos existem pra essa obra, em cada seção); nenhum valor é digitado nesta tela. Quem preenche
          o valor é o engenheiro, na tela &quot;Atualizar Informações&quot;.
        </MessageBarBody>
      </MessageBar>

      <div className={classes.layout}>
        <div className={classes.cartao}>
          <div className={classes.painelEsquerdoTopo}>
            <Input
              placeholder="Buscar obra..."
              contentBefore={<Search20Regular />}
              value={busca}
              onChange={(_e, data) => setBusca(data.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div className={classes.listaRolavel}>
            {obrasFiltradas.map((o) => (
              <div
                key={o.id}
                className={`${classes.itemLista} ${o.id === obraId ? classes.itemListaAtivo : ""}`}
                onClick={() => setObraId(o.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setObraId(o.id);
                }}
              >
                <div className={classes.itemIconeWrap}>
                  <BuildingMultiple20Regular fontSize={16} />
                </div>
                <div className={classes.itemTextos}>
                  <div className={classes.itemTitulo}>{o.nome}</div>
                  <div className={classes.itemSubtitulo}>
                    {TIPO_LABEL[o.tipo] ?? o.tipo} · {o.cidade}/{o.estado}
                  </div>
                </div>
                <span className={classes.itemContagem}>{contarAtivos(o.id)}</span>
              </div>
            ))}
          </div>
        </div>

        {obraAtual && (
          <div className={classes.cartao}>
            <div className={classes.cabecalhoDireita}>
              <BuildingMultiple20Regular fontSize={28} style={{ color: tokens.colorNeutralForeground3 }} />
              <div className={classes.cabecalhoTextos}>
                <Text weight="semibold" size={400} block>
                  {obraAtual.nome}
                </Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  {TIPO_LABEL[obraAtual.tipo] ?? obraAtual.tipo} · {obraAtual.cidade}/{obraAtual.estado}
                </Text>
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {[...ativos].filter((k) => k.startsWith(`${obraAtual.id}::${secaoId}::`)).length} de {Object.keys(secaoAtual.campos).length} campos ativos
              </Text>
            </div>

            <div className={classes.abasSecao}>
              <TabList selectedValue={secaoId} onTabSelect={(_e, data) => setSecaoId(data.value as SecaoId)}>
                {Object.entries(CATALOGO_SECOES).map(([id, s]) => (
                  <Tab key={id} value={id}>
                    {s.label}
                  </Tab>
                ))}
              </TabList>
            </div>

            {Object.entries(secaoAtual.campos).map(([campoChave, meta]) => {
              const k = chaveCampo(obraAtual.id, secaoId, campoChave);
              const Icone = meta.icone;
              return (
                <div key={campoChave} className={classes.linhaCampo}>
                  <div className={classes.campoIconeWrap}>
                    <Icone fontSize={18} />
                  </div>
                  <span className={classes.campoLabel}>{meta.label}</span>
                  <Switch
                    checked={ativos.has(k)}
                    disabled={pendentes.has(k)}
                    onChange={(_e, data) => alternarCampo(campoChave, data.checked)}
                  />
                </div>
              );
            })}
            <div className={classes.secaoBloqueadaWrap}>
              <ShieldLock20Regular fontSize={16} />
              Prazo, Financeiro e as demais seções do relatório mensal entram aqui como novas abas, conforme forem construídas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
