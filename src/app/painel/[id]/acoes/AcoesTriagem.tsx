"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  makeStyles,
  tokens,
  Button,
  Field,
  Input,
  Textarea,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
} from "@fluentui/react-components";
import {
  CheckmarkCircle20Regular,
  CheckmarkCircle20Filled,
  Warning20Regular,
  Circle20Regular,
  Person20Regular,
  CalendarLtr20Regular,
  TaskListAdd20Regular,
  ArrowLeft20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Dismiss20Regular,
  ArrowExpand20Regular,
  Edit20Regular,
  Image20Regular,
  type FluentIcon,
} from "@fluentui/react-icons";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import { buscarTela } from "@/lib/telasRelatorio";
import { formatarCompetencia } from "@/lib/competencia";
import { createClient } from "@/lib/supabase/client";
import { atualizarAcao } from "./actions";

export type Acao = {
  id: string;
  relatorioId: string;
  telaChave: string;
  texto: string;
  imagemUrl: string | null;
  imagemCaminho: string | null;
  responsavel: string;
  prazo: string | null;
  concluidoEm: string | null;
  criadoPor: string;
  criadoEm: string;
  competenciaChave: string;
};

type Status = "aberta" | "atrasada" | "concluida";

type ValoresAcao = {
  texto: string;
  responsavel: string;
  prazo: string | null;
  concluidoEm: string | null;
  imagemCaminho: string | null;
};

const CINZA_ABERTO = "#64748b";
const CINZA_ABERTO_BG = "#f1f5f9";
const CINZA_ESCURO_TEXTO = "#334155";
const VERMELHO_ATRASADO = "#dc2626";
const VERMELHO_ATRASADO_BG = "#fee2e2";
const VERDE_CONCLUIDO = "#15803d";
const VERDE_CONCLUIDO_BG = "#dcfce7";
const AZUL_ACAO = "#2563eb";

// "hoje" como string local AAAA-MM-DD -- comparar strings ISO (não objetos
// Date) evita o bug clássico de fuso: new Date() puro cruzado com um
// new Date("AAAA-MM-DD") (que o spec sempre trata como UTC meia-noite) pode
// marcar uma ação "atrasada" ~3h antes da hora certa no Brasil (UTC-3).
function hojeIso(): string {
  return new Date().toLocaleDateString("sv-SE");
}

// só pra contar dias com precisão -- as duas pontas viram meia-noite LOCAL
// (não UTC), então a diferença sempre cai num múltiplo exato de 1 dia.
function paraDataLocal(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function calcularStatus(acao: { prazo: string | null; concluidoEm: string | null }): Status {
  if (acao.concluidoEm) return "concluida";
  if (acao.prazo && acao.prazo < hojeIso()) return "atrasada";
  return "aberta";
}

// texto do contador de dias ao lado do prazo -- só faz sentido pra quem
// ainda não foi concluída. Já sai com a primeira letra maiúscula -- é
// sempre usado como um rótulo próprio (badge/linha), nunca no meio de uma
// frase.
function calcularDiasTexto(acao: { prazo: string | null; concluidoEm: string | null }): string | null {
  if (!acao.prazo || acao.concluidoEm) return null;
  const dias = Math.round((paraDataLocal(acao.prazo).getTime() - paraDataLocal(hojeIso()).getTime()) / 86400000);
  if (dias < 0) return `Atrasada há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"}`;
  if (dias === 0) return "Vence hoje";
  return `Faltam ${dias} dia${dias === 1 ? "" : "s"}`;
}

const STATUS_META: Record<Status, { label: string; cor: string; fundo: string; Icone: FluentIcon }> = {
  aberta: { label: "Em aberto", cor: CINZA_ABERTO, fundo: CINZA_ABERTO_BG, Icone: Circle20Regular },
  atrasada: { label: "Atrasada", cor: VERMELHO_ATRASADO, fundo: VERMELHO_ATRASADO_BG, Icone: Warning20Regular },
  concluida: { label: "Concluída", cor: VERDE_CONCLUIDO, fundo: VERDE_CONCLUIDO_BG, Icone: CheckmarkCircle20Filled },
};

// data "date" pura (prazo/concluidoEm) -- split manual de string, sem
// new Date(), mesmo motivo de formatarCompetencia em lib/competencia.ts. Só
// chamado onde o valor já foi confirmado non-null no call site.
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// só pra criado_em (timestamptz) -- idioma já usado no resto do app pra
// instantes de auditoria.
function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const useStyles = makeStyles({
  pagina: { maxWidth: "100%", padding: "0 4px" },
  voltarLink: {
    display: "inline-flex", alignItems: "center", gap: "6px", fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2, cursor: "pointer", marginBottom: "18px", textDecoration: "none",
    ":hover": { color: tokens.colorBrandForeground1 },
  },

  linhaFiltros: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", margin: "20px 0" },
  filtro: {
    display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px",
    borderRadius: tokens.borderRadiusXLarge, border: "1px solid transparent",
    cursor: "pointer", textAlign: "left", transition: "transform 0.1s ease, box-shadow 0.15s ease",
    ":hover": { transform: "translateY(-1px)" },
  },
  filtroAtivo: { border: "1px solid rgba(15,23,42,0.25)", boxShadow: "0 4px 14px rgba(15,23,42,0.12)" },
  filtroIconeWrap: {
    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, color: "#ffffff",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  filtroNumero: { fontSize: "22px", fontWeight: 700, lineHeight: 1 },
  filtroLabel: { fontSize: "13px", marginTop: "2px", opacity: 0.85 },

  grupoMes: { marginTop: "26px" },
  toggleConcluidos: {
    display: "flex", alignItems: "center", gap: "6px", width: "100%", padding: "10px 12px",
    borderRadius: tokens.borderRadiusLarge, border: `1px dashed ${tokens.colorNeutralStroke2}`,
    backgroundColor: "transparent", color: tokens.colorNeutralForeground3, cursor: "pointer",
    fontSize: "13px", fontWeight: 600, textAlign: "left",
    ":hover": { backgroundColor: tokens.colorNeutralBackground2, color: tokens.colorNeutralForeground2 },
  },
  grupoMesTitulo: {
    fontSize: "14px", fontWeight: 700, color: tokens.colorNeutralForeground3, textTransform: "uppercase",
    letterSpacing: "0.04em", marginBottom: "10px", paddingBottom: "6px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
  cartaoVazio: {
    padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3,
    border: `2px dashed ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge,
  },
  cartaoAcao: {
    display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
    borderRadius: tokens.borderRadiusXLarge, border: "1.5px solid transparent",
    backgroundColor: "#ffffff", cursor: "pointer", textAlign: "left", width: "100%",
    ":hover": { backgroundColor: tokens.colorNeutralBackground2 },
  },
  selo: {
    display: "flex", alignItems: "center", gap: "5px", padding: "4px 9px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
  },
  corpoCartao: { flex: 1, minWidth: 0 },
  textoCartao: {
    fontSize: "15px", color: "#0f172a", fontWeight: 500,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  metaCartao: { display: "flex", alignItems: "center", gap: "12px", marginTop: "5px", fontSize: "13px", color: tokens.colorNeutralForeground3, flexWrap: "wrap" },
  metaItem: { display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 },
  metaResponsavel: { color: AZUL_ACAO },
  metaPrazo: { color: CINZA_ESCURO_TEXTO },
  metaPrazoAtrasado: { color: VERMELHO_ATRASADO },
  metaConcluida: { color: VERDE_CONCLUIDO },
  metaPrazoPrevisto: { color: tokens.colorNeutralForeground3 },
  diasTexto: { fontWeight: 400, opacity: 0.85 },
  miniaturaCartao: { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },

  // diálogo de triagem
  tituloDialogo: { display: "flex", alignItems: "center", gap: "8px" },
  corpoHorizontal: { display: "flex", gap: "24px", alignItems: "flex-start" },
  colunaDetalhes: { flex: 1, minWidth: 0 },
  colunaImagem: { width: "240px", flexShrink: 0, position: "relative" },
  imagemLateral: { width: "100%", display: "block", borderRadius: "10px", border: `1px solid ${tokens.colorNeutralStroke2}`, objectFit: "cover" },
  overlayImagem: { position: "absolute", top: "8px", right: "8px", display: "flex", gap: "6px" },
  botaoOverlay: {
    minWidth: "unset", width: "32px", height: "32px", padding: 0, borderRadius: "6px", border: "none",
    backgroundColor: "rgba(15,23,42,0.55)", color: "#ffffff",
    ":hover": { backgroundColor: "rgba(15,23,42,0.75)", color: "#ffffff" },
  },
  dropzonePrint: {
    width: "100%", minHeight: "160px", borderRadius: "10px", boxSizing: "border-box",
    border: `2px dashed ${tokens.colorNeutralStroke2}`, backgroundColor: tokens.colorNeutralBackground2,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
    color: tokens.colorNeutralForeground3, fontSize: "13px", textAlign: "center", padding: "16px", outline: "none",
    ":focus-visible": { border: `2px dashed ${tokens.colorBrandStroke1}` },
  },
  rotuloLeitura: {
    fontSize: "12px", fontWeight: 700, color: tokens.colorNeutralForeground3,
    textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "4px",
  },
  valorLeitura: { fontSize: "15px", color: "#0f172a", fontWeight: 500 },
  descricaoLeitura: { fontSize: "15px", color: "#0f172a", lineHeight: 1.5, whiteSpace: "pre-wrap" },
  contextoAcao: {
    display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px",
    backgroundColor: tokens.colorNeutralBackground2, color: tokens.colorNeutralForeground2,
    fontSize: "13px", marginTop: "16px",
  },
  gradeDialogo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  dicaPrazo: { fontSize: "13px", color: tokens.colorNeutralForeground3, marginTop: "4px" },
  rodapeAcoes: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", width: "100%" },
  rodapeAcoesQuebrado: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" },
});

type Classes = ReturnType<typeof useStyles>;

function CartaoAcao({ classes, acao, onAbrir }: { classes: Classes; acao: Acao; onAbrir: (id: string) => void }) {
  const status = calcularStatus(acao);
  const meta = STATUS_META[status];
  const diasTexto = calcularDiasTexto(acao);
  const tela = buscarTela(acao.telaChave)?.label ?? acao.telaChave;
  return (
    <button type="button" className={classes.cartaoAcao} style={{ borderColor: meta.cor }} onClick={() => onAbrir(acao.id)}>
      <div className={classes.selo} style={{ color: meta.cor, backgroundColor: meta.fundo }}>
        <meta.Icone fontSize={14} />
        {meta.label}
      </div>
      <div className={classes.corpoCartao}>
        <div className={classes.textoCartao}>{acao.texto}</div>
        <div className={classes.metaCartao}>
          <span>{tela}</span>
          {acao.responsavel && (
            <span className={`${classes.metaItem} ${classes.metaResponsavel}`}>
              <Person20Regular fontSize={13} />
              {acao.responsavel}
            </span>
          )}
          {acao.concluidoEm ? (
            <>
              {acao.prazo && (
                <span className={`${classes.metaItem} ${classes.metaPrazoPrevisto}`}>
                  <CalendarLtr20Regular fontSize={13} />
                  {`Previsto para ${formatarData(acao.prazo)}`}
                </span>
              )}
              <span className={`${classes.metaItem} ${classes.metaConcluida}`}>
                <CheckmarkCircle20Regular fontSize={13} />
                {`Finalizada em ${formatarData(acao.concluidoEm)}`}
              </span>
            </>
          ) : (
            acao.prazo && (
              <span className={`${classes.metaItem} ${status === "atrasada" ? classes.metaPrazoAtrasado : classes.metaPrazo}`}>
                <CalendarLtr20Regular fontSize={13} />
                {formatarData(acao.prazo)}
                {diasTexto && <span className={classes.diasTexto}>{` · ${diasTexto}`}</span>}
              </span>
            )
          )}
        </div>
      </div>
      {acao.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={acao.imagemUrl} className={classes.miniaturaCartao} alt="Print anexado" />
      )}
    </button>
  );
}

function CampoLeitura({ classes, label, valor }: { classes: Classes; label: string; valor: string }) {
  return (
    <div>
      <div className={classes.rotuloLeitura}>{label}</div>
      <div className={classes.valorLeitura}>{valor}</div>
    </div>
  );
}

function DialogoTriagem({
  classes,
  obraId,
  acao,
  onFechar,
  onSalvar,
  onErroUpload,
}: {
  classes: Classes;
  obraId: string;
  acao: Acao | null;
  onFechar: () => void;
  onSalvar: (id: string, valores: ValoresAcao, mudouStatus: boolean) => Promise<boolean>;
  onErroUpload: (mensagem: string) => void;
}) {
  const [modo, setModo] = useState<"visualizar" | "editar">("visualizar");
  const [texto, setTexto] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState("");
  const [arquivoNovo, setArquivoNovo] = useState<File | null>(null);
  const [imagemRemovida, setImagemRemovida] = useState(false);
  const [imagemExpandida, setImagemExpandida] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  // preview local do arquivo recém colado/escolhido -- derivada (useMemo),
  // não estado próprio; o efeito só cuida da limpeza (revokeObjectURL), sem
  // chamar setState (mesmo padrão de DialogoGerarAcao em Apresentacao.tsx).
  const previewUrlLocal = useMemo(() => (arquivoNovo ? URL.createObjectURL(arquivoNovo) : null), [arquivoNovo]);
  useEffect(() => {
    return () => {
      if (previewUrlLocal) URL.revokeObjectURL(previewUrlLocal);
    };
  }, [previewUrlLocal]);

  if (!acao) return null;
  const editando = modo === "editar";

  // status considera o prazo em edição (reage em tempo real ao campo); em
  // modo leitura, usa sempre o prazo já salvo da ação.
  const acaoEfetiva = { prazo: editando ? prazo || null : acao.prazo, concluidoEm: acao.concluidoEm };
  const status = calcularStatus(acaoEfetiva);
  const meta = STATUS_META[status];
  const diasTexto = calcularDiasTexto(acaoEfetiva);
  const imagemAtual = editando ? (arquivoNovo ? previewUrlLocal : imagemRemovida ? null : acao.imagemUrl) : acao.imagemUrl;
  const semTexto = !texto.trim();
  const tela = buscarTela(acao.telaChave)?.label ?? acao.telaChave;

  // resume o status numa frase só, sem parênteses explicando de onde vem.
  const textoStatus = acao.concluidoEm
    ? `Concluída em ${formatarData(acao.concluidoEm)}`
    : status === "atrasada" && diasTexto
      ? diasTexto
      : diasTexto
        ? `Em aberto · ${diasTexto}`
        : "Em aberto";

  function iniciarEdicao() {
    if (!acao) return;
    setTexto(acao.texto);
    setResponsavel(acao.responsavel);
    setPrazo(acao.prazo || "");
    setArquivoNovo(null);
    setImagemRemovida(false);
    setModo("editar");
  }

  function removerImagem() {
    setArquivoNovo(null);
    setImagemRemovida(true);
  }

  function extrairImagemDoArquivo(arquivo: File | null | undefined) {
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    setArquivoNovo(arquivo);
    setImagemRemovida(false);
  }

  function aoColarImagem(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData.items).find((it) => it.type.startsWith("image/"));
    if (item) extrairImagemDoArquivo(item.getAsFile());
  }

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    extrairImagemDoArquivo(e.target.files?.[0]);
    e.target.value = "";
  }

  async function alternarConclusao() {
    if (!acao) return;
    setSalvando(true);
    const ok = await onSalvar(
      acao.id,
      {
        texto: acao.texto,
        responsavel: acao.responsavel,
        prazo: acao.prazo,
        concluidoEm: acao.concluidoEm ? null : hojeIso(),
        imagemCaminho: acao.imagemCaminho,
      },
      true,
    );
    if (!ok) setSalvando(false);
  }

  async function aoSalvar() {
    if (!acao) return;
    setSalvando(true);
    let imagemCaminhoFinal = acao.imagemCaminho;

    // envia um arquivo novo (colado ou escolhido) só agora, no Salvar -- é
    // o jeito de anexar um print que não foi capturado ao vivo na
    // apresentação. Caminho usa o relatorioId da PRÓPRIA ação (essa tela
    // cobre várias competências, ao contrário do Dashboard).
    if (arquivoNovo) {
      const supabase = createClient();
      const extensao = arquivoNovo.type.split("/")[1] || "png";
      const caminho = `${obraId}/${acao.relatorioId}/${crypto.randomUUID()}.${extensao}`;
      const { error } = await supabase.storage.from("acoes").upload(caminho, arquivoNovo, { contentType: arquivoNovo.type });
      if (error) {
        setSalvando(false);
        onErroUpload(error.message);
        return;
      }
      imagemCaminhoFinal = caminho;
    } else if (imagemRemovida) {
      imagemCaminhoFinal = null;
    }

    const ok = await onSalvar(
      acao.id,
      { texto: texto.trim(), responsavel, prazo: prazo || null, concluidoEm: acao.concluidoEm, imagemCaminho: imagemCaminhoFinal },
      false,
    );
    if (!ok) setSalvando(false);
  }

  return (
    <>
      <Dialog
        open={!!acao}
        onOpenChange={(_e, data) => {
          if (!data.open) onFechar();
        }}
      >
        <DialogSurface style={{ maxWidth: editando || imagemAtual ? "760px" : "480px" }}>
          <DialogBody>
            <DialogTitle
              className={classes.tituloDialogo}
              action={
                <DialogTrigger action="close">
                  <Button appearance="subtle" aria-label="Fechar" icon={<Dismiss20Regular />} />
                </DialogTrigger>
              }
            >
              <meta.Icone fontSize={22} style={{ color: meta.cor }} />
              Detalhe da Ação
            </DialogTitle>
            <DialogContent>
              <div className={classes.corpoHorizontal}>
                <div className={classes.colunaDetalhes}>
                  <div
                    className={classes.selo}
                    style={{ color: meta.cor, backgroundColor: meta.fundo, fontSize: "14px", marginBottom: "16px" }}
                  >
                    <meta.Icone fontSize={14} />
                    {textoStatus}
                  </div>

                  {/* responsável/prazo primeiro -- é o que o engenheiro veio
                      resolver na revisão. Em modo leitura é só texto
                      (cartão); em modo edição vira formulário de verdade. */}
                  {editando ? (
                    <div className={classes.gradeDialogo}>
                      <div>
                        <Field label="Responsável">
                          <Input size="large" value={responsavel} onChange={(_e, data) => setResponsavel(data.value)} />
                        </Field>
                      </div>
                      <div>
                        <Field label="Prazo">
                          <Input size="large" type="date" value={prazo} onChange={(_e, data) => setPrazo(data.value)} />
                        </Field>
                        {diasTexto && <div className={classes.dicaPrazo}>{diasTexto}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className={classes.gradeDialogo}>
                      <CampoLeitura classes={classes} label="Responsável" valor={acao.responsavel || "Não definido"} />
                      <CampoLeitura classes={classes} label="Prazo" valor={acao.prazo ? formatarData(acao.prazo) : "Sem prazo"} />
                    </div>
                  )}

                  {editando ? (
                    <Field label="Descrição" style={{ marginTop: "14px" }}>
                      <Textarea size="large" value={texto} onChange={(_e, data) => setTexto(data.value)} rows={3} />
                    </Field>
                  ) : (
                    <div style={{ marginTop: "14px" }}>
                      <div className={classes.rotuloLeitura}>Descrição</div>
                      <div className={classes.descricaoLeitura}>{acao.texto}</div>
                    </div>
                  )}

                  <div className={classes.contextoAcao}>
                    <TaskListAdd20Regular />
                    {`${tela} -- registrada por ${acao.criadoPor} em ${formatarDataHora(acao.criadoEm)}`}
                  </div>
                </div>

                {/* coluna da imagem: em leitura só aparece se já tem print;
                    em edição aparece sempre, porque é onde dá pra ANEXAR um
                    print que não veio da apresentação (colar ou escolher um
                    arquivo). */}
                {(editando || imagemAtual) && (
                  <div className={classes.colunaImagem}>
                    {imagemAtual ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagemAtual} className={classes.imagemLateral} alt="Print anexado" />
                        <div className={classes.overlayImagem}>
                          <Button
                            className={classes.botaoOverlay}
                            icon={<ArrowExpand20Regular />}
                            aria-label="Expandir print"
                            onClick={() => setImagemExpandida(true)}
                          />
                          {editando && (
                            <Button
                              className={classes.botaoOverlay}
                              icon={<Dismiss20Regular />}
                              aria-label="Remover print"
                              onClick={removerImagem}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className={classes.dropzonePrint} tabIndex={0} onPaste={aoColarImagem}>
                        <Image20Regular fontSize={24} />
                        <div>Cole um print (Ctrl+V)</div>
                        <Button size="small" appearance="secondary" onClick={() => inputArquivoRef.current?.click()}>
                          ou escolher arquivo
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={inputArquivoRef}
                          style={{ display: "none" }}
                          onChange={aoEscolherArquivo}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              {editando ? (
                <div className={classes.rodapeAcoes}>
                  <Button appearance="secondary" onClick={() => setModo("visualizar")}>
                    Cancelar
                  </Button>
                  <Button appearance="primary" disabled={semTexto || salvando} onClick={aoSalvar}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              ) : (
                <div className={classes.rodapeAcoesQuebrado}>
                  <Button
                    appearance="primary"
                    icon={<CheckmarkCircle20Regular />}
                    disabled={salvando}
                    style={
                      acao.concluidoEm
                        ? { backgroundColor: CINZA_ABERTO, borderColor: CINZA_ABERTO, color: "#ffffff" }
                        : { backgroundColor: VERDE_CONCLUIDO, borderColor: VERDE_CONCLUIDO, color: "#ffffff" }
                    }
                    onClick={alternarConclusao}
                  >
                    {acao.concluidoEm ? "Reabrir" : "Concluir"}
                  </Button>
                  <Button appearance="secondary" icon={<Edit20Regular />} onClick={iniciarEdicao}>
                    Editar
                  </Button>
                </div>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {imagemAtual && (
        <Dialog open={imagemExpandida} onOpenChange={(_e, data) => setImagemExpandida(data.open)}>
          <DialogSurface style={{ maxWidth: "min(90vw, 900px)" }}>
            <DialogBody>
              <DialogContent>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagemAtual}
                  style={{ width: "100%", display: "block", borderRadius: "10px" }}
                  alt="Print anexado (ampliado)"
                />
              </DialogContent>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </>
  );
}

export default function AcoesTriagem({
  obraId,
  obraNome,
  acoesIniciais,
}: {
  obraId: string;
  obraNome: string;
  acoesIniciais: Acao[];
}) {
  const classes = useStyles();
  const router = useRouter();
  const [filtro, setFiltro] = useState<"todas" | Status>("todas");
  const [idAberto, setIdAberto] = useState<string | null>(null);
  // muda a cada abertura (mesmo reabrindo a mesma ação) -- vira parte da
  // `key` do diálogo lá embaixo, forçando um remount com estado fresco (sem
  // depender de useEffect pra resetar).
  const [chaveAbertura, setChaveAbertura] = useState(0);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const toasterId = useId("toaster-acoes");
  const { dispatchToast } = useToastController(toasterId);

  const acoes = acoesIniciais;

  const contagens = useMemo(() => {
    const c: Record<Status, number> = { aberta: 0, atrasada: 0, concluida: 0 };
    acoes.forEach((a) => {
      c[calcularStatus(a)] += 1;
    });
    return c;
  }, [acoes]);

  const acoesFiltradas = filtro === "todas" ? acoes : acoes.filter((a) => calcularStatus(a) === filtro);

  // agrupa por competência (mês do relatório em que a ação foi levantada),
  // meses mais recentes primeiro. Meses inteiramente concluídos somem numa
  // única faixa recolhida no fim da lista, em vez de cada um ocupar uma
  // seção própria -- não empilha histórico antigo já resolvido na frente
  // do que ainda precisa de atenção.
  const { gruposAtivos, gruposConcluidos } = useMemo(() => {
    const porChave = new Map<string, Acao[]>();
    acoesFiltradas.forEach((a) => {
      const lista = porChave.get(a.competenciaChave) ?? [];
      lista.push(a);
      porChave.set(a.competenciaChave, lista);
    });
    const todos = [...porChave.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    return {
      gruposAtivos: todos.filter(([, itens]) => itens.some((a) => calcularStatus(a) !== "concluida")),
      gruposConcluidos: todos.filter(([, itens]) => itens.every((a) => calcularStatus(a) === "concluida")),
    };
  }, [acoesFiltradas]);

  const totalConcluidos = gruposConcluidos.reduce((soma, [, itens]) => soma + itens.length, 0);
  const acaoAberta = acoes.find((a) => a.id === idAberto) || null;

  function abrirAcao(id: string) {
    setIdAberto(id);
    setChaveAbertura((c) => c + 1);
  }

  async function salvar(id: string, valores: ValoresAcao, mudouStatus: boolean): Promise<boolean> {
    const resultado = await atualizarAcao(obraId, id, valores);
    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível salvar a ação.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return false;
    }
    setIdAberto(null);
    dispatchToast(
      <Toast>
        <ToastTitle>{mudouStatus ? "Status atualizado" : "Ação atualizada"}</ToastTitle>
      </Toast>,
      { intent: "success" },
    );
    router.refresh();
    return true;
  }

  function mostrarErroUpload(mensagem: string) {
    dispatchToast(
      <Toast>
        <ToastTitle>Não foi possível enviar o print.</ToastTitle>
        <ToastBody>{mensagem}</ToastBody>
      </Toast>,
      { intent: "error" },
    );
  }

  const filtros: { chave: "todas" | Status; label: string; numero: number; cor: string; fundo: string; Icone: FluentIcon }[] = [
    { chave: "todas", label: "Todas", numero: acoes.length, cor: "#334155", fundo: "#e2e8f0", Icone: TaskListAdd20Regular },
    { chave: "aberta", label: "Em aberto", numero: contagens.aberta, cor: CINZA_ABERTO, fundo: CINZA_ABERTO_BG, Icone: Circle20Regular },
    { chave: "atrasada", label: "Atrasadas", numero: contagens.atrasada, cor: VERMELHO_ATRASADO, fundo: VERMELHO_ATRASADO_BG, Icone: Warning20Regular },
    { chave: "concluida", label: "Concluídas", numero: contagens.concluida, cor: VERDE_CONCLUIDO, fundo: VERDE_CONCLUIDO_BG, Icone: CheckmarkCircle20Filled },
  ];

  return (
    <div className={classes.pagina}>
      <Toaster toasterId={toasterId} />

      <Link href={`/painel/${obraId}`} className={classes.voltarLink}>
        <ArrowLeft20Regular fontSize={18} /> Voltar
      </Link>

      <CabecalhoRelatorio obraNome={obraNome} subtitulo="Ações" />

      <div className={classes.linhaFiltros}>
        {filtros.map((f) => (
          <button
            key={f.chave}
            type="button"
            className={`${classes.filtro} ${filtro === f.chave ? classes.filtroAtivo : ""}`}
            style={{ backgroundColor: f.fundo }}
            onClick={() => setFiltro(f.chave)}
          >
            <div className={classes.filtroIconeWrap} style={{ backgroundColor: f.cor }}>
              <f.Icone fontSize={18} />
            </div>
            <div>
              <div className={classes.filtroNumero} style={{ color: f.cor }}>
                {f.numero}
              </div>
              <div className={classes.filtroLabel} style={{ color: f.cor }}>
                {f.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {gruposAtivos.length === 0 && gruposConcluidos.length === 0 ? (
        <div className={classes.cartaoVazio}>Nenhuma ação nesse filtro.</div>
      ) : (
        <>
          {gruposAtivos.map(([chave, itens]) => (
            <div key={chave} className={classes.grupoMes}>
              <div className={classes.grupoMesTitulo}>
                {`${formatarCompetencia(chave)} · ${itens.length} ${itens.length === 1 ? "ação" : "ações"}`}
              </div>
              <div className={classes.lista}>
                {itens.map((acao) => (
                  <CartaoAcao key={acao.id} classes={classes} acao={acao} onAbrir={abrirAcao} />
                ))}
              </div>
            </div>
          ))}

          {gruposConcluidos.length > 0 && (
            <div className={classes.grupoMes}>
              <button type="button" className={classes.toggleConcluidos} onClick={() => setMostrarConcluidos((v) => !v)}>
                {mostrarConcluidos ? <ChevronDown20Regular fontSize={16} /> : <ChevronRight20Regular fontSize={16} />}
                {`${gruposConcluidos.length} ${gruposConcluidos.length === 1 ? "mês concluído" : "meses concluídos"} (${totalConcluidos} ${totalConcluidos === 1 ? "ação" : "ações"})`}
              </button>
              {mostrarConcluidos &&
                gruposConcluidos.map(([chave, itens]) => (
                  <div key={chave} className={classes.grupoMes}>
                    <div className={classes.grupoMesTitulo}>
                      {`${formatarCompetencia(chave)} · ${itens.length} ${itens.length === 1 ? "ação" : "ações"}`}
                    </div>
                    <div className={classes.lista}>
                      {itens.map((acao) => (
                        <CartaoAcao key={acao.id} classes={classes} acao={acao} onAbrir={abrirAcao} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <DialogoTriagem
        key={`${idAberto}-${chaveAbertura}`}
        classes={classes}
        obraId={obraId}
        acao={acaoAberta}
        onFechar={() => setIdAberto(null)}
        onSalvar={salvar}
        onErroUpload={mostrarErroUpload}
      />
    </div>
  );
}
