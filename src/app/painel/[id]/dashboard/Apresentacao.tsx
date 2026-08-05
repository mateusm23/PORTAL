"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  makeStyles,
  tokens,
  PortalMountNodeProvider,
  Button,
  Badge,
  Tooltip,
  Textarea,
  Field,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
} from "@fluentui/react-components";
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronDown20Regular,
  Dismiss20Regular,
  FullScreenMaximize20Regular,
  FullScreenMinimize20Regular,
  ZoomFit20Regular,
  ZoomIn20Regular,
  ZoomOut20Regular,
  Flashlight20Regular,
  TaskListAdd20Regular,
  MoreVertical20Regular,
  ImageAdd20Regular,
} from "@fluentui/react-icons";
import CapaRelatorioPdf from "@/components/CapaRelatorioPdf";
import { TELAS, buscarTela, type Tela } from "@/lib/telasRelatorio";
import { createClient } from "@/lib/supabase/client";
import { registrarAcao } from "./actions";

type CampoGeral = { chave: string; label: string; valor: string; grupo: "detalhes" | "area" };

export type DadosCapa = {
  obraNome: string;
  cidade: string | null;
  estado: string | null;
  competencia: string;
  fotoUrl: string | null;
  camposGerais: CampoGeral[];
  clienteContratante: string | null;
  responsavelTecnico: string | null;
  registroProfissional: string | null;
  logotipoUrl: string | null;
};

export type Acao = { id: string; telaChave: string; texto: string; imagemUrl: string | null };

const PRESETS_ZOOM = [50, 75, 100, 125, 150, 200, 300];
const AZUL_ACAO = "#2563eb"; // mesmo azul de "ação principal" já usado em HistoricoRelatorios.tsx

const useStyles = makeStyles({
  // position:fixed + inset:0 -- mesma técnica que AppShell.tsx já usa pra
  // tomar a tela toda, escopada ao tempo de vida deste componente (não
  // precisa de nenhum overflow:hidden global em html/body).
  raizTeatro: {
    position: "fixed",
    inset: 0,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
    background: "linear-gradient(160deg, #eef2f7 0%, #dbe4ee 100%)",
  },
  // overflow só vira "auto" (barra de rolagem de verdade) quando o zoom
  // passa de 100% -- no encaixe padrão fica "hidden" de propósito.
  fundoTeatro: { position: "absolute", inset: 0, display: "flex" },
  palcoOuter: { margin: "auto", flexShrink: 0 },
  palco: {
    width: "1280px",
    height: "720px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 10px 34px rgba(15,23,42,0.25)",
    transformOrigin: "top left",
    backgroundColor: "#ffffff",
    // escalar (transform: scale) um elemento com cantos arredondados +
    // overflow:hidden + foto grande dentro (CapaRelatorioPdf) causa um bug
    // conhecido do Chromium: a composição em GPU "tila" o conteúdo, e em
    // escalas não-inteiras as bordas dos blocos não batem, aparecendo como
    // rachaduras na imagem. backfaceVisibility+willChange força o
    // navegador a compor tudo como uma única camada/textura em vez de
    // tiles separados, o que elimina o artefato.
    backfaceVisibility: "hidden",
    willChange: "transform",
  },

  botaoFechar: {
    position: "absolute",
    top: "14px",
    right: "14px",
    zIndex: 21,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.92)",
    color: "#334155",
    boxShadow: "0 3px 10px rgba(15,23,42,0.18)",
    ":hover": { backgroundColor: "#dc2626", color: "#ffffff" },
  },

  // canto superior esquerdo, longe do topo-centro de propósito -- o
  // navegador/SO costuma desenhar o botão nativo de "sair da tela cheia"
  // ali, e um menu no canto não disputa esse espaço.
  superficiePopover: { backgroundColor: "rgba(255,255,255,0.92)" },
  alcaMenu: {
    position: "absolute",
    top: "14px",
    left: "14px",
    zIndex: 21,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.92)",
    color: "#334155",
    boxShadow: "0 3px 10px rgba(15,23,42,0.18)",
    transition: "background-color 0.15s ease, color 0.15s ease",
    ":hover": { backgroundColor: "rgba(255,255,255,1)" },
  },
  alcaMenuAtiva: { backgroundColor: AZUL_ACAO, color: "#ffffff", ":hover": { backgroundColor: "#3b76ee" } },
  painelEmpilhado: {
    position: "absolute",
    top: "54px",
    left: "14px",
    zIndex: 21,
    minWidth: "230px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    padding: "8px",
    borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.22)",
  },
  linhaEmpilhada: { display: "flex", alignItems: "center", gap: "2px" },
  itemEmpilhado: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    ":hover": { backgroundColor: "rgba(15,23,42,0.08)" },
  },
  itemEmpilhadoAtivo: { backgroundColor: AZUL_ACAO, color: "#ffffff", ":hover": { backgroundColor: "#3b76ee" } },
  divisorHorizontal: { height: "1px", backgroundColor: "rgba(15,23,42,0.1)", margin: "3px 2px" },
  divisor: { width: "1px", height: "18px", backgroundColor: "rgba(15,23,42,0.12)", margin: "0 3px", flexShrink: 0 },
  contadorTela: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "0 4px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#334155",
    whiteSpace: "nowrap",
  },
  zoomPercentual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
    height: "30px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#334155",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    cursor: "pointer",
    flexShrink: 0,
    ":hover": { backgroundColor: "rgba(15,23,42,0.08)" },
  },

  presetsZoom: { display: "flex", alignItems: "center", gap: "2px" },
  presetZoomBotao: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "38px",
    height: "28px",
    padding: "0 8px",
    flexShrink: 0,
    borderRadius: "8px",
    border: "none",
    fontSize: "12.5px",
    fontWeight: 600,
    backgroundColor: "transparent",
    color: "#334155",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    ":hover": { backgroundColor: "rgba(15,23,42,0.08)" },
  },
  presetZoomBotaoAtivo: { backgroundColor: AZUL_ACAO, color: "#ffffff", ":hover": { backgroundColor: "#3b76ee" } },
  presetZoomCustomBotao: {
    backgroundColor: "#cbd5e1",
    color: "#334155",
    marginLeft: "2px",
    ":hover": { backgroundColor: "#b7c3d1" },
  },
  presetZoomInput: {
    width: "48px",
    height: "28px",
    borderRadius: "8px",
    border: `1px solid ${AZUL_ACAO}`,
    textAlign: "center",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#0f172a",
    outline: "none",
  },

  botaoIcone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#334155",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background-color 0.15s ease",
    ":hover": { backgroundColor: "rgba(15,23,42,0.08)" },
  },
  botaoIconeAtivo: { backgroundColor: AZUL_ACAO, color: "#ffffff", ":hover": { backgroundColor: "#3b76ee" } },
  botaoIconeDesabilitado: { opacity: 0.35, cursor: "default", ":hover": { backgroundColor: "transparent" } },

  botaoGerarAcao: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: "30px",
    padding: "0 12px",
    marginLeft: "2px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "12.5px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    backgroundColor: AZUL_ACAO,
    color: "#ffffff",
    flexShrink: 0,
    ":hover": { backgroundColor: "#3b76ee" },
  },

  laserPonto: {
    position: "fixed",
    zIndex: 15,
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    boxShadow: "0 0 3px rgba(37,99,235,0.6)",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
    left: "50%",
    top: "50%",
  },

  paginaPlaceholder: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    backgroundColor: "#ffffff",
  },
  faixaPlaceholder: { backgroundColor: "#002244", color: "#ffffff", padding: "22px 32px", flexShrink: 0 },
  faixaPlaceholderFrente: { fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#BFD3E6", marginBottom: "4px" },
  faixaPlaceholderLabel: { fontSize: "26px", fontWeight: 700 },
  corpoPlaceholder: { flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" },
  caixaPlaceholder: {
    maxWidth: "620px",
    textAlign: "center",
    padding: "40px 36px",
    borderRadius: "14px",
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    fontSize: "16px",
    lineHeight: 1.5,
  },

  contextoAcao: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "10px",
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    marginBottom: "16px",
  },
  areaColarPrint: {
    marginTop: "12px",
    padding: "16px",
    borderRadius: "10px",
    textAlign: "center",
    cursor: "text",
    border: `1.5px dashed ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontSize: "12.5px",
  },
  previewImagemColada: {
    marginTop: "12px",
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  previewImagemColadaImg: { display: "block", width: "100%", maxHeight: "180px", objectFit: "contain", backgroundColor: "#f8fafc" },
  previewImagemColadaRemover: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    backgroundColor: "rgba(15,23,42,0.65)",
    color: "#ffffff",
    ":hover": { backgroundColor: "#dc2626" },
  },
  listaAcoes: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "360px", maxHeight: "320px", overflowY: "auto" },
  itemAcao: { padding: "10px 12px", borderRadius: "8px", backgroundColor: tokens.colorNeutralBackground2, fontSize: "13px" },
  itemAcaoTela: { display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#0f172a" },
  itemAcaoTexto: { color: tokens.colorNeutralForeground2, marginTop: "2px" },
});

function TelaPlaceholder({ tela }: { tela: Tela }) {
  const classes = useStyles();
  return (
    <div className={classes.paginaPlaceholder}>
      <div className={classes.faixaPlaceholder}>
        <div className={classes.faixaPlaceholderFrente}>{tela.frente}</div>
        <div className={classes.faixaPlaceholderLabel}>{tela.label}</div>
      </div>
      <div className={classes.corpoPlaceholder}>
        <div className={classes.caixaPlaceholder}>
          {`"${tela.label}" ainda não foi desenhada. Espaço reservado só pra mostrar a navegação entre telas da apresentação.`}
        </div>
      </div>
    </div>
  );
}

function PainelZoom({
  nivelZoomAtual,
  onEscolherPercentual,
}: {
  nivelZoomAtual: number;
  onEscolherPercentual: (percentual: number) => void;
}) {
  const classes = useStyles();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editando) inputRef.current?.focus();
  }, [editando]);

  function aplicar() {
    const n = parseInt(valor, 10);
    if (!Number.isNaN(n)) onEscolherPercentual(n);
    setValor("");
    setEditando(false);
  }

  const percentualAtual = Math.round(nivelZoomAtual * 100);
  const ehPreset = PRESETS_ZOOM.includes(percentualAtual);

  return (
    <div className={classes.presetsZoom}>
      {PRESETS_ZOOM.map((p) => (
        <button
          key={p}
          type="button"
          className={`${classes.presetZoomBotao} ${percentualAtual === p ? classes.presetZoomBotaoAtivo : ""}`}
          onClick={() => onEscolherPercentual(p)}
        >
          {p}%
        </button>
      ))}
      {editando ? (
        <input
          ref={inputRef}
          type="number"
          className={classes.presetZoomInput}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") aplicar();
            else if (e.key === "Escape") {
              setValor("");
              setEditando(false);
            }
          }}
          onBlur={aplicar}
        />
      ) : (
        <button
          type="button"
          className={`${classes.presetZoomBotao} ${ehPreset ? classes.presetZoomCustomBotao : classes.presetZoomBotaoAtivo}`}
          onClick={() => setEditando(true)}
        >
          {ehPreset ? <ChevronDown20Regular /> : `${percentualAtual}%`}
        </button>
      )}
    </div>
  );
}

function DialogoGerarAcao({
  open,
  onOpenChange,
  tela,
  onRegistrar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tela: Tela;
  onRegistrar: (args: { texto: string; arquivoImagem: File | null }) => Promise<void>;
}) {
  const classes = useStyles();
  const [texto, setTexto] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // reseta o formulário quando o diálogo abre -- ajuste de estado durante a
  // renderização (padrão recomendado pelo React pra "resetar quando uma prop
  // muda"), não um efeito, pra não disparar um segundo render em cascata.
  const [openAnterior, setOpenAnterior] = useState(open);
  if (open !== openAnterior) {
    setOpenAnterior(open);
    if (open) {
      setTexto("");
      setArquivoImagem(null);
    }
  }

  // URL local só pra mostrar a prévia do print colado -- derivada direto do
  // arquivo (useMemo, não estado próprio); o efeito só cuida da limpeza
  // (revokeObjectURL), sem chamar setState.
  const previewUrl = useMemo(() => (arquivoImagem ? URL.createObjectURL(arquivoImagem) : null), [arquivoImagem]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function aoColar(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const arquivo = item.getAsFile();
    if (arquivo) setArquivoImagem(arquivo);
  }

  async function aoRegistrar() {
    setEnviando(true);
    await onRegistrar({ texto: texto.trim(), arquivoImagem });
    setEnviando(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(_e, data) => onOpenChange(data.open)}>
      <DialogSurface style={{ maxWidth: "480px" }}>
        <DialogBody>
          <DialogTitle>Gerar ação</DialogTitle>
          <DialogContent>
            <div className={classes.contextoAcao}>
              <TaskListAdd20Regular />
              {tela.frente} · {tela.label}
            </div>
            <Field label="O que precisa ser feito?">
              <Textarea
                value={texto}
                onChange={(_e, data) => setTexto(data.value)}
                onPaste={aoColar}
                placeholder="Ex.: revisar o valor de IDC apresentado, parece divergente do combinado com o cliente"
                rows={4}
              />
            </Field>
            {previewUrl ? (
              <div className={classes.previewImagemColada}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} className={classes.previewImagemColadaImg} alt="Print colado" />
                <button type="button" className={classes.previewImagemColadaRemover} onClick={() => setArquivoImagem(null)}>
                  <Dismiss20Regular />
                </button>
              </div>
            ) : (
              <div className={classes.areaColarPrint}>
                <ImageAdd20Regular />
                Cole um print aqui (Ctrl+V) pra anexar na ação
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button appearance="primary" disabled={!texto.trim() || enviando} onClick={aoRegistrar}>
              {enviando ? "Registrando..." : "Registrar ação"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

export default function Apresentacao({
  obraId,
  relatorioId,
  dadosCapa,
  acoesIniciais,
}: {
  obraId: string;
  relatorioId: string;
  dadosCapa: DadosCapa;
  acoesIniciais: Acao[];
}) {
  const classes = useStyles();
  const router = useRouter();

  const [telaIdx, setTelaIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [laserAtivo, setLaserAtivo] = useState(false);
  const [escalaFit, setEscalaFit] = useState(1);
  const [nivelZoom, setNivelZoom] = useState(1);
  const [menuAberto, setMenuAberto] = useState(false);
  const [zoomMenuAberto, setZoomMenuAberto] = useState(false);
  const [acaoAberta, setAcaoAberta] = useState(false);
  const [acoes, setAcoes] = useState<Acao[]>(acoesIniciais);

  const raizRef = useRef<HTMLDivElement>(null);
  const fundoRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toasterId = useId("toaster-apresentacao");
  const { dispatchToast } = useToastController(toasterId);

  const tela = TELAS[telaIdx];

  // escala do palco (1280x720) pro espaço disponível -- calculada direto
  // contra o tamanho da janela (o teatro é sempre position:fixed;inset:0,
  // então sempre bate exatamente com window.innerWidth/innerHeight, tanto
  // dentro quanto fora do modo tela cheia real).
  useEffect(() => {
    function recalcularEscala() {
      const folga = 8;
      const larguraDisp = window.innerWidth - folga * 2;
      const alturaDisp = window.innerHeight - folga * 2;
      const escala = Math.min(larguraDisp / 1280, alturaDisp / 720);
      setEscalaFit(escala > 0 ? escala : 1);
    }
    recalcularEscala();
    window.addEventListener("resize", recalcularEscala);
    document.addEventListener("fullscreenchange", recalcularEscala);
    return () => {
      window.removeEventListener("resize", recalcularEscala);
      document.removeEventListener("fullscreenchange", recalcularEscala);
    };
  }, []);

  useEffect(() => {
    function aoMudarFullscreen() {
      const ativo = !!document.fullscreenElement;
      setFullscreen(ativo);
      if (ativo) setLaserAtivo(true); // liga o laser sozinho ao entrar em apresentação
    }
    document.addEventListener("fullscreenchange", aoMudarFullscreen);
    return () => document.removeEventListener("fullscreenchange", aoMudarFullscreen);
  }, []);

  // ponteiro laser -- mexe direto no DOM (sem setState) pra acompanhar o
  // mouse sem re-renderizar a árvore inteira a cada movimento. Coordenada
  // de tela (clientX/clientY) porque o ponto é position:fixed.
  useEffect(() => {
    const el = fundoRef.current;
    const ponto = laserRef.current;
    if (!el || !ponto) return;
    function aoMover(e: MouseEvent) {
      if (!ponto) return;
      ponto.style.left = `${e.clientX}px`;
      ponto.style.top = `${e.clientY}px`;
    }
    el.addEventListener("mousemove", aoMover);
    return () => el.removeEventListener("mousemove", aoMover);
  }, []);

  // fecha o menu empilhado clicando fora dele
  useEffect(() => {
    if (!menuAberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [menuAberto]);

  // navegação por teclado -- ignora se o foco estiver num campo de texto
  // (ex.: escrevendo a ação) pra não roubar as setas/espaço do usuário.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const alvo = document.activeElement;
      const digitando = alvo && (alvo.tagName === "TEXTAREA" || alvo.tagName === "INPUT");
      if (digitando) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        irProxima();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        irAnterior();
      } else if (e.key === "f" || e.key === "F") {
        alternarTelaCheia();
      } else if (e.key === "l" || e.key === "L") {
        setLaserAtivo((v) => !v);
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  });

  function irProxima() {
    setTelaIdx((i) => Math.min(TELAS.length - 1, i + 1));
  }
  function irAnterior() {
    setTelaIdx((i) => Math.max(0, i - 1));
  }

  function alternarTelaCheia() {
    if (!document.fullscreenElement) raizRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function fechar() {
    if (document.fullscreenElement) document.exitFullscreen();
    router.push(`/painel/${obraId}`);
  }

  function ajustarZoom() {
    setNivelZoom(1);
  }
  function aumentarZoom() {
    setNivelZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  }
  function diminuirZoom() {
    setNivelZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  }
  function escolherZoomPercentual(percentual: number) {
    setNivelZoom(Math.min(3, Math.max(0.5, percentual / 100)));
    setZoomMenuAberto(false);
  }

  async function aoRegistrarAcao({ texto, arquivoImagem }: { texto: string; arquivoImagem: File | null }) {
    let imagemCaminho: string | null = null;
    let imagemUrlLocal: string | null = null;

    if (arquivoImagem) {
      const supabase = createClient();
      const extensao = arquivoImagem.type.split("/")[1] || "png";
      const caminho = `${obraId}/${relatorioId}/${crypto.randomUUID()}.${extensao}`;
      const { error: erroUpload } = await supabase.storage
        .from("acoes")
        .upload(caminho, arquivoImagem, { contentType: arquivoImagem.type });

      if (erroUpload) {
        dispatchToast(
          <Toast>
            <ToastTitle>Não foi possível enviar o print.</ToastTitle>
            <ToastBody>{erroUpload.message}</ToastBody>
          </Toast>,
          { intent: "error" },
        );
        return;
      }
      imagemCaminho = caminho;
      imagemUrlLocal = URL.createObjectURL(arquivoImagem);
    }

    const resultado = await registrarAcao(obraId, relatorioId, tela.chave, texto, imagemCaminho);
    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível registrar a ação.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setAcoes((lista) => [...lista, { id: crypto.randomUUID(), telaChave: tela.chave, texto, imagemUrl: imagemUrlLocal }]);
    dispatchToast(
      <Toast>
        <ToastTitle>Ação registrada</ToastTitle>
        <ToastBody>
          {tela.label}: {texto}
        </ToastBody>
      </Toast>,
      { intent: "success" },
    );
  }

  const escalaFinal = escalaFit * nivelZoom;

  return (
    <>
      <Toaster toasterId={toasterId} />

      {/* Portal/Dialog/Popover do Fluent, por padrão, montam o conteúdo
          direto em document.body. Isso quebra em tela cheia de verdade: a
          Fullscreen API só deixa visível o próprio elemento (e
          descendentes) que virou fullscreen -- qualquer coisa portada fora
          dele (como o diálogo "Gerar Ação") fica escondida pelo navegador
          mesmo com open:true. Corrigido apontando o mountNode pra dentro
          da própria raiz da apresentação (raizRef), que é o elemento que
          vira fullscreen. */}
      <PortalMountNodeProvider value={raizRef.current ?? undefined}>
        <div ref={raizRef} className={`${classes.raizTeatro} palco-raiz`}>
          <div
            ref={fundoRef}
            className={classes.fundoTeatro}
            style={{ cursor: laserAtivo ? "none" : "default", overflow: nivelZoom > 1 ? "auto" : "hidden" }}
          >
            <div
              className={classes.palcoOuter}
              style={{ width: `${Math.floor(1280 * escalaFinal)}px`, height: `${Math.floor(720 * escalaFinal)}px` }}
            >
              <div className={classes.palco} style={{ transform: `scale(${escalaFinal})` }}>
                {tela.real ? <CapaRelatorioPdf {...dadosCapa} /> : <TelaPlaceholder tela={tela} />}
              </div>
            </div>
          </div>

          <Tooltip content="Fechar apresentação" relationship="label">
            <button type="button" className={classes.botaoFechar} onClick={fechar}>
              <Dismiss20Regular />
            </button>
          </Tooltip>

          <div ref={laserRef} className={classes.laserPonto} style={{ display: laserAtivo ? "block" : "none" }} />

          <div ref={menuRef}>
            <Tooltip content={menuAberto ? "Fechar menu" : "Abrir menu"} relationship="label">
              <button
                type="button"
                className={`${classes.alcaMenu} ${menuAberto ? classes.alcaMenuAtiva : ""}`}
                onClick={() => setMenuAberto((v) => !v)}
              >
                <MoreVertical20Regular />
              </button>
            </Tooltip>

            {menuAberto && (
              <div className={classes.painelEmpilhado}>
                <div className={classes.linhaEmpilhada}>
                  <Tooltip content="Tela anterior (←)" relationship="label">
                    <button
                      type="button"
                      className={`${classes.botaoIcone} ${telaIdx === 0 ? classes.botaoIconeDesabilitado : ""}`}
                      onClick={irAnterior}
                      disabled={telaIdx === 0}
                    >
                      <ChevronLeft20Regular />
                    </button>
                  </Tooltip>
                  <div className={classes.contadorTela}>
                    {telaIdx + 1}/{TELAS.length} · {tela.label}
                  </div>
                  <Tooltip content="Próxima tela (→)" relationship="label">
                    <button
                      type="button"
                      className={`${classes.botaoIcone} ${telaIdx === TELAS.length - 1 ? classes.botaoIconeDesabilitado : ""}`}
                      onClick={irProxima}
                      disabled={telaIdx === TELAS.length - 1}
                    >
                      <ChevronRight20Regular />
                    </button>
                  </Tooltip>
                </div>

                <div className={classes.divisorHorizontal} />

                <button
                  type="button"
                  className={`${classes.itemEmpilhado} ${laserAtivo ? classes.itemEmpilhadoAtivo : ""}`}
                  onClick={() => setLaserAtivo((v) => !v)}
                >
                  <Flashlight20Regular />
                  {laserAtivo ? "Desligar laser (L)" : "Ligar laser (L)"}
                </button>

                <div className={classes.linhaEmpilhada}>
                  <Tooltip content="Diminuir zoom" relationship="label">
                    <button
                      type="button"
                      className={`${classes.botaoIcone} ${nivelZoom <= 0.5 ? classes.botaoIconeDesabilitado : ""}`}
                      onClick={diminuirZoom}
                      disabled={nivelZoom <= 0.5}
                    >
                      <ZoomOut20Regular />
                    </button>
                  </Tooltip>

                  <Popover open={zoomMenuAberto} onOpenChange={(_e, data) => setZoomMenuAberto(data.open)}>
                    <PopoverTrigger disableButtonEnhancement>
                      <Tooltip content="Escolher zoom" relationship="label">
                        <button type="button" className={classes.zoomPercentual}>
                          {Math.round(nivelZoom * 100)}%
                        </button>
                      </Tooltip>
                    </PopoverTrigger>
                    <PopoverSurface className={classes.superficiePopover}>
                      <PainelZoom nivelZoomAtual={nivelZoom} onEscolherPercentual={escolherZoomPercentual} />
                    </PopoverSurface>
                  </Popover>

                  <Tooltip content="Aumentar zoom" relationship="label">
                    <button
                      type="button"
                      className={`${classes.botaoIcone} ${nivelZoom >= 3 ? classes.botaoIconeDesabilitado : ""}`}
                      onClick={aumentarZoom}
                      disabled={nivelZoom >= 3}
                    >
                      <ZoomIn20Regular />
                    </button>
                  </Tooltip>

                  <Tooltip content="Ajustar à tela" relationship="label">
                    <button type="button" className={classes.botaoIcone} onClick={ajustarZoom}>
                      <ZoomFit20Regular />
                    </button>
                  </Tooltip>
                </div>

                <button type="button" className={classes.itemEmpilhado} onClick={alternarTelaCheia}>
                  {fullscreen ? <FullScreenMinimize20Regular /> : <FullScreenMaximize20Regular />}
                  {fullscreen ? "Sair da tela cheia (F)" : "Tela cheia (F)"}
                </button>

                <div className={classes.divisorHorizontal} />

                <Popover>
                  <PopoverTrigger disableButtonEnhancement>
                    <button type="button" className={classes.itemEmpilhado}>
                      <TaskListAdd20Regular />
                      Ações registradas
                      {acoes.length > 0 && (
                        <Badge size="small" color="danger">
                          {acoes.length}
                        </Badge>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverSurface className={classes.superficiePopover}>
                    {acoes.length === 0 ? (
                      <div style={{ fontSize: "13px", color: tokens.colorNeutralForeground3, maxWidth: "260px" }}>
                        Nenhuma ação registrada ainda nesta apresentação.
                      </div>
                    ) : (
                      <div className={classes.listaAcoes}>
                        {[...acoes].reverse().map((a) => {
                          const telaDaAcao = buscarTela(a.telaChave);
                          return (
                            <div key={a.id} className={classes.itemAcao}>
                              <div className={classes.itemAcaoTela}>
                                {telaDaAcao?.label ?? a.telaChave}
                                {a.imagemUrl && <ImageAdd20Regular fontSize={14} />}
                              </div>
                              <div className={classes.itemAcaoTexto}>{a.texto}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </PopoverSurface>
                </Popover>

                <button
                  type="button"
                  className={classes.botaoGerarAcao}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setAcaoAberta(true)}
                >
                  <TaskListAdd20Regular />
                  Gerar ação
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogoGerarAcao open={acaoAberta} onOpenChange={setAcaoAberta} tela={tela} onRegistrar={aoRegistrarAcao} />
      </PortalMountNodeProvider>
    </>
  );
}
