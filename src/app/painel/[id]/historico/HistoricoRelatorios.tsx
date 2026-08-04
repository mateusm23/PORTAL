"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  makeStyles,
  tokens,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  CheckmarkCircle20Filled,
  LockClosed20Regular,
  ArrowSync20Regular,
  Eye20Regular,
  Edit20Regular,
  DocumentAdd20Regular,
  DocumentPdf20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import DashboardCapaDialog from "@/components/DashboardCapaDialog";
import { MESES, competenciaIsoDeAnoMes } from "@/lib/competencia";
import { criarNovoRelatorio, fecharRelatorio, reabrirRelatorio } from "../atualizar-informacoes/actions";
import { buscarDadosVisualizacao } from "./actions";

type RelatorioResumo = { id: string; competencia: string; travadoEm: string | null };
type CampoGeral = { chave: string; label: string; valor: string; grupo: "detalhes" | "area" };
type DadosVisualizacao = {
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

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// mesma paleta já usada de verdade em ToolbarSecaoRelatorio.tsx (verde
// finalizar, âmbar reabrir), estendida com petróleo/cinza/azul pras ações
// novas desta tela -- validada em duas rodadas de preview (17 e 18).
const COR_PETROLEO = "#0e3244";
const COR_CINZA = "#64748b";
const COR_AZUL = "#2563eb";
const COR_AZUL_ABERTO = "#0284c7";
const COR_VERDE = "#15803d";
const COR_AMBAR = "#b45309";

function formatarData(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// {ano: {mes 1-12: relatorio}} -- não distingue "obra parada" de "mês
// futuro": não existe dado nenhum que diga quando a obra começou a precisar
// de relatório, então todo mês sem relatório é só "sem relatório", sempre
// clicável pra criar (retroativo ou adiantado, mesma flexibilidade da v3.16).
function construirMapaAnoMes(relatorios: RelatorioResumo[]) {
  const mapa: Record<number, Record<number, RelatorioResumo>> = {};
  for (const r of relatorios) {
    const ano = Number(r.competencia.slice(0, 4));
    const mes = Number(r.competencia.slice(5, 7));
    if (!mapa[ano]) mapa[ano] = {};
    mapa[ano][mes] = r;
  }
  return mapa;
}

const useStyles = makeStyles({
  pagina: { maxWidth: "100%", padding: "0 4px" },
  voltarLink: {
    display: "inline-flex", alignItems: "center", gap: "6px", fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2, cursor: "pointer", marginBottom: "18px", textDecoration: "none",
    ":hover": { color: tokens.colorBrandForeground1 },
  },
  controles: { display: "flex", justifyContent: "flex-end", marginBottom: "18px" },
  alternadorModo: { display: "flex", gap: "4px", padding: "3px", borderRadius: tokens.borderRadiusLarge, backgroundColor: tokens.colorNeutralBackground3 },
  botaoModo: { minWidth: 0 },

  // ---------- cordão (linha do tempo) ----------
  linhaAno: { marginBottom: "40px" },
  linhaAnoTitulo: { fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: "#0f172a", marginBottom: "16px" },
  cordaoWrap: { position: "relative", height: "44px" },
  cordaoLinha: { position: "absolute", left: "22px", right: "22px", top: "50%", height: "4px", backgroundColor: "#94a3b8", transform: "translateY(-50%)", zIndex: 0, borderRadius: "2px" },
  cordaoBotoes: { position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" },
  botaoMes: {
    width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, cursor: "pointer", border: "none", padding: 0,
    transition: "transform 0.15s ease, box-shadow 0.15s ease", boxShadow: tokens.shadow4,
    ":hover": { transform: "scale(1.18)", boxShadow: tokens.shadow16 },
  },
  botaoMesTravado: { backgroundColor: COR_VERDE, color: "#ffffff" },
  botaoMesAberto: { backgroundColor: COR_AZUL_ABERTO, color: "#ffffff" },
  botaoMesVazio: { backgroundColor: "#f1f5f9", color: "#94a3b8", border: "1px dashed #cbd5e1", boxShadow: "none" },

  // ---------- painel mini (dentro do popover) ----------
  painelMini: { width: "300px", padding: "4px 2px" },
  painelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" },
  painelTitulo: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold, color: "#0f172a" },
  painelMeta: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginTop: "3px" },
  painelAcoes: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" },
  painelVazioTexto: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, fontStyle: "italic", marginBottom: "10px" },

  botaoVer: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_CINZA, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#475569", color: "#ffffff" } },
  botaoEditar: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_PETROLEO, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#164a63", color: "#ffffff" } },
  botaoFechar: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_VERDE, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#16a34a", color: "#ffffff" } },
  botaoReabrir: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_AMBAR, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#c2670f", color: "#ffffff" } },
  botaoPdf: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_AZUL, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#1d4ed8", color: "#ffffff" } },
  botaoCriar: { color: COR_PETROLEO, border: `1px solid ${COR_PETROLEO}`, backgroundColor: "transparent" },

  // ---------- grade ----------
  grade: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  cardGrade: {
    padding: "12px 16px", borderRadius: tokens.borderRadiusXLarge, backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`, boxShadow: tokens.shadow8, display: "flex", flexDirection: "column",
    borderLeft: "4px solid #cbd5e1", position: "relative", minHeight: "150px",
  },
  cardGradeAberto: { borderLeftColor: COR_AZUL_ABERTO },
  cardGradeTravado: { borderLeftColor: COR_VERDE },
  cardGradeCompetencia: { fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: "#0f172a" },
  cardGradeAcoes: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto", paddingTop: "14px" },
  seloFinalizado: {
    position: "absolute", top: "-9px", right: "-9px", width: "26px", height: "26px", borderRadius: "50%",
    backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: tokens.shadow4, color: COR_VERDE, border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  botaoGradeVer: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_CINZA, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#475569", color: "#ffffff" } },
  botaoGradeEditar: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_PETROLEO, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#164a63", color: "#ffffff" } },
  botaoGradeFechar: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_VERDE, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#16a34a", color: "#ffffff" } },
  botaoGradeReabrir: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_AMBAR, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#c2670f", color: "#ffffff" } },
  botaoGradePdf: { flex: "1 1 0", minWidth: 0, justifyContent: "center", paddingLeft: "8px", paddingRight: "8px", backgroundColor: COR_AZUL, color: "#ffffff", border: "none", ":hover": { backgroundColor: "#1d4ed8", color: "#ffffff" } },
});

type Classes = ReturnType<typeof useStyles>;

function PainelRelatorio({
  classes, relatorio, competenciaLabel, souAdmin, carregandoVisualizar,
  onEditar, onVer, onFechar, onReabrir, onExportarPdf,
}: {
  classes: Classes;
  relatorio: RelatorioResumo;
  competenciaLabel: string;
  souAdmin: boolean;
  carregandoVisualizar: boolean;
  onEditar: () => void;
  onVer: () => void;
  onFechar: () => void;
  onReabrir: () => void;
  onExportarPdf: () => void;
}) {
  const aberto = relatorio.travadoEm === null;
  return (
    <div className={classes.painelMini}>
      <div className={classes.painelHeader}>
        <span className={classes.painelTitulo}>{competenciaLabel}</span>
        {!aberto && <CheckmarkCircle20Filled fontSize={18} style={{ color: COR_VERDE }} title="Travado (histórico) — finalizado" />}
      </div>
      <div className={classes.painelMeta}>{aberto ? "Em andamento" : "Travado (histórico)"}</div>
      {!aberto && relatorio.travadoEm && (
        <div className={classes.painelMeta}>{`Finalizado em ${formatarData(relatorio.travadoEm)}`}</div>
      )}
      <div className={classes.painelAcoes}>
        {aberto && (
          <Button className={classes.botaoEditar} size="small" icon={<Edit20Regular />} onClick={onEditar}>
            Editar
          </Button>
        )}
        <Button className={classes.botaoVer} size="small" icon={<Eye20Regular />} disabled={carregandoVisualizar} onClick={onVer}>
          {carregandoVisualizar ? "Carregando..." : "Visualizar"}
        </Button>
        {aberto && (
          <Button className={classes.botaoFechar} size="small" icon={<LockClosed20Regular />} onClick={onFechar}>
            Fechar
          </Button>
        )}
        {!aberto && (
          <Button className={classes.botaoPdf} size="small" icon={<DocumentPdf20Regular />} onClick={onExportarPdf}>
            Exportar PDF
          </Button>
        )}
        {!aberto && souAdmin && (
          <Button className={classes.botaoReabrir} size="small" icon={<ArrowSync20Regular />} onClick={onReabrir}>
            Reabrir
          </Button>
        )}
      </div>
    </div>
  );
}

function PainelVazio({ classes, competenciaLabel, onCriar }: { classes: Classes; competenciaLabel: string; onCriar: () => void }) {
  return (
    <div className={classes.painelMini}>
      <div className={classes.painelVazioTexto}>{`Sem relatório em ${competenciaLabel} ainda.`}</div>
      <Button className={classes.botaoCriar} size="small" icon={<DocumentAdd20Regular />} onClick={onCriar}>
        Criar relatório pra este mês
      </Button>
    </div>
  );
}

function BotaoMes({
  classes, ano, mes, relatorio, ehAtual, souAdmin, carregandoVisualizar,
  onEditar, onVer, onFechar, onReabrir, onExportarPdf, onCriar,
}: {
  classes: Classes;
  ano: number;
  mes: number;
  relatorio: RelatorioResumo | undefined;
  ehAtual: boolean;
  souAdmin: boolean;
  carregandoVisualizar: boolean;
  onEditar: (r: RelatorioResumo) => void;
  onVer: (r: RelatorioResumo) => void;
  onFechar: (r: RelatorioResumo) => void;
  onReabrir: (r: RelatorioResumo) => void;
  onExportarPdf: (r: RelatorioResumo) => void;
  onCriar: (ano: number, mes: number) => void;
}) {
  const label = MESES_ABREV[mes - 1];
  const competenciaLabel = `${MESES[mes - 1]}/${ano}`;
  const classeCor = !relatorio ? classes.botaoMesVazio : relatorio.travadoEm === null ? classes.botaoMesAberto : classes.botaoMesTravado;

  return (
    <Popover withArrow positioning="below">
      <PopoverTrigger disableButtonEnhancement>
        <button
          type="button"
          className={`${classes.botaoMes} ${classeCor} ${ehAtual ? "pulso-mes-atual" : ""}`}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverSurface>
        {relatorio ? (
          <PainelRelatorio
            classes={classes}
            relatorio={relatorio}
            competenciaLabel={competenciaLabel}
            souAdmin={souAdmin}
            carregandoVisualizar={carregandoVisualizar}
            onEditar={() => onEditar(relatorio)}
            onVer={() => onVer(relatorio)}
            onFechar={() => onFechar(relatorio)}
            onReabrir={() => onReabrir(relatorio)}
            onExportarPdf={() => onExportarPdf(relatorio)}
          />
        ) : (
          <PainelVazio classes={classes} competenciaLabel={competenciaLabel} onCriar={() => onCriar(ano, mes)} />
        )}
      </PopoverSurface>
    </Popover>
  );
}

function CardRelatorioGrade({
  classes, relatorio, souAdmin, carregandoVisualizar, onEditar, onVer, onFechar, onReabrir, onExportarPdf,
}: {
  classes: Classes;
  relatorio: RelatorioResumo;
  souAdmin: boolean;
  carregandoVisualizar: boolean;
  onEditar: () => void;
  onVer: () => void;
  onFechar: () => void;
  onReabrir: () => void;
  onExportarPdf: () => void;
}) {
  const aberto = relatorio.travadoEm === null;
  const ano = Number(relatorio.competencia.slice(0, 4));
  const mes = Number(relatorio.competencia.slice(5, 7));
  const competenciaLabel = `${MESES[mes - 1]}/${ano}`;

  return (
    <div className={`${classes.cardGrade} ${aberto ? classes.cardGradeAberto : classes.cardGradeTravado}`}>
      {!aberto && <CheckmarkCircle20Filled className={classes.seloFinalizado} title="Relatório travado (histórico) — finalizado" />}
      <div className={classes.cardGradeCompetencia}>{competenciaLabel}</div>
      {aberto && <Badge appearance="tint" color="warning" style={{ marginTop: "8px", alignSelf: "flex-start" }}>Em andamento</Badge>}
      {!aberto && relatorio.travadoEm && (
        <div className={classes.painelMeta} style={{ marginTop: "6px" }}>{`Finalizado em ${formatarData(relatorio.travadoEm)}`}</div>
      )}
      <div className={classes.cardGradeAcoes}>
        {aberto && (
          <Button className={classes.botaoGradeEditar} size="small" icon={<Edit20Regular />} onClick={onEditar}>
            Editar
          </Button>
        )}
        <Button className={classes.botaoGradeVer} size="small" icon={<Eye20Regular />} disabled={carregandoVisualizar} onClick={onVer}>
          {carregandoVisualizar ? "Carregando..." : "Visualizar"}
        </Button>
        {aberto && (
          <Button className={classes.botaoGradeFechar} size="small" icon={<LockClosed20Regular />} onClick={onFechar}>
            Fechar
          </Button>
        )}
        {!aberto && (
          <Button className={classes.botaoGradePdf} size="small" icon={<DocumentPdf20Regular />} onClick={onExportarPdf}>
            Exportar PDF
          </Button>
        )}
        {!aberto && souAdmin && (
          <Button className={classes.botaoGradeReabrir} size="small" icon={<ArrowSync20Regular />} onClick={onReabrir}>
            Reabrir
          </Button>
        )}
      </div>
    </div>
  );
}

export default function HistoricoRelatorios({
  obraId,
  obraNome,
  relatorios,
  souAdmin,
}: {
  obraId: string;
  obraNome: string;
  relatorios: RelatorioResumo[];
  souAdmin: boolean;
}) {
  const classes = useStyles();
  const router = useRouter();
  const toasterId = useId("toaster-historico");
  const { dispatchToast } = useToastController(toasterId);

  const [modo, setModo] = useState<"linha" | "grade">("linha");
  const [dialogFechar, setDialogFechar] = useState<RelatorioResumo | null>(null);
  const [dialogReabrir, setDialogReabrir] = useState<RelatorioResumo | null>(null);
  const [dialogCriar, setDialogCriar] = useState<{ ano: number; mes: number } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [carregandoVisualizarId, setCarregandoVisualizarId] = useState<string | null>(null);
  const [visualizarDados, setVisualizarDados] = useState<DadosVisualizacao | null>(null);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const mapa = construirMapaAnoMes(relatorios);
  const anoMinDados = relatorios.length ? Math.min(...relatorios.map((r) => Number(r.competencia.slice(0, 4)))) : anoAtual;
  const anos: number[] = [];
  for (let a = Math.min(anoMinDados, anoAtual); a <= anoAtual; a++) anos.push(a);

  async function aoVer(r: RelatorioResumo) {
    setCarregandoVisualizarId(r.id);
    const resultado = await buscarDadosVisualizacao(obraId, r.id);
    setCarregandoVisualizarId(null);
    if (resultado.erro || !resultado.dados) {
      dispatchToast(<Toast><ToastTitle>Não foi possível carregar a prévia.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    setVisualizarDados(resultado.dados);
  }

  function aoEditar(r: RelatorioResumo) {
    router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/${r.id}/informacoesCapa`);
  }

  function aoExportarPdf() {
    dispatchToast(<Toast><ToastTitle>Geração de PDF entra numa etapa futura.</ToastTitle></Toast>, { intent: "info" });
  }

  async function confirmarFechar() {
    if (!dialogFechar) return;
    setProcessando(true);
    const resultado = await fecharRelatorio(obraId, dialogFechar.id);
    setProcessando(false);
    setDialogFechar(null);
    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível fechar o mês.</ToastTitle><ToastBody>{resultado.erro}</ToastBody></Toast>, { intent: "error" });
      return;
    }
    dispatchToast(<Toast><ToastTitle>Relatório travado como histórico.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  async function confirmarReabrir() {
    if (!dialogReabrir) return;
    setProcessando(true);
    const resultado = await reabrirRelatorio(obraId, dialogReabrir.id);
    setProcessando(false);
    setDialogReabrir(null);
    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível reabrir o relatório.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    dispatchToast(<Toast><ToastTitle>Relatório reaberto pra edição.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  async function confirmarCriar() {
    if (!dialogCriar) return;
    setProcessando(true);
    const competenciaIso = competenciaIsoDeAnoMes(dialogCriar.ano, dialogCriar.mes);
    const resultado = await criarNovoRelatorio(obraId, competenciaIso);
    setProcessando(false);
    setDialogCriar(null);
    if (resultado.erro || !resultado.relatorioId) {
      dispatchToast(<Toast><ToastTitle>Não foi possível criar o relatório.</ToastTitle><ToastBody>{resultado.erro}</ToastBody></Toast>, { intent: "error" });
      return;
    }
    router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/${resultado.relatorioId}/informacoesCapa`);
  }

  const relatoriosOrdenados = [...relatorios].sort((a, b) => (a.competencia < b.competencia ? 1 : -1));

  return (
    <div className={classes.pagina}>
      <Toaster toasterId={toasterId} />

      <Link href={`/painel/${obraId}`} className={classes.voltarLink}>
        <ArrowLeft20Regular fontSize={18} /> Voltar
      </Link>

      <CabecalhoRelatorio obraNome={obraNome} subtitulo="Histórico de Relatórios" />

      <div className={classes.controles}>
        <div className={classes.alternadorModo}>
          <Button className={classes.botaoModo} appearance={modo === "linha" ? "primary" : "transparent"} size="small" onClick={() => setModo("linha")}>
            Linha do tempo
          </Button>
          <Button className={classes.botaoModo} appearance={modo === "grade" ? "primary" : "transparent"} size="small" onClick={() => setModo("grade")}>
            Grade
          </Button>
        </div>
      </div>

      {modo === "linha" ? (
        anos.map((ano) => (
          <div key={ano} className={classes.linhaAno}>
            <div className={classes.linhaAnoTitulo}>{ano}</div>
            <div className={classes.cordaoWrap}>
              <div className={classes.cordaoLinha} />
              <div className={classes.cordaoBotoes}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                  <BotaoMes
                    key={mes}
                    classes={classes}
                    ano={ano}
                    mes={mes}
                    relatorio={mapa[ano]?.[mes]}
                    ehAtual={ano === anoAtual && mes === mesAtual}
                    souAdmin={souAdmin}
                    carregandoVisualizar={carregandoVisualizarId === mapa[ano]?.[mes]?.id}
                    onEditar={aoEditar}
                    onVer={aoVer}
                    onFechar={setDialogFechar}
                    onReabrir={setDialogReabrir}
                    onExportarPdf={aoExportarPdf}
                    onCriar={(a, m) => setDialogCriar({ ano: a, mes: m })}
                  />
                ))}
              </div>
            </div>
          </div>
        ))
      ) : relatoriosOrdenados.length === 0 ? (
        <div className={classes.painelVazioTexto}>Essa obra ainda não tem nenhum relatório mensal.</div>
      ) : (
        <div className={classes.grade}>
          {relatoriosOrdenados.map((r) => (
            <CardRelatorioGrade
              key={r.id}
              classes={classes}
              relatorio={r}
              souAdmin={souAdmin}
              carregandoVisualizar={carregandoVisualizarId === r.id}
              onEditar={() => aoEditar(r)}
              onVer={() => aoVer(r)}
              onFechar={() => setDialogFechar(r)}
              onReabrir={() => setDialogReabrir(r)}
              onExportarPdf={aoExportarPdf}
            />
          ))}
        </div>
      )}

      <Dialog open={!!dialogFechar} onOpenChange={(_e, data) => !data.open && setDialogFechar(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
              Fechar este mês?
            </DialogTitle>
            <DialogContent>
              {dialogFechar &&
                `Isso vai travar os dados de ${MESES[Number(dialogFechar.competencia.slice(5, 7)) - 1]}/${dialogFechar.competencia.slice(0, 4)} como histórico — não será mais editável depois. Deseja continuar?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogFechar(null)}>Cancelar</Button>
              <Button appearance="primary" onClick={confirmarFechar} disabled={processando}>
                {processando ? "Fechando..." : "Sim, fechar mês"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={!!dialogReabrir} onOpenChange={(_e, data) => !data.open && setDialogReabrir(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
              Reabrir este mês?
            </DialogTitle>
            <DialogContent>
              {dialogReabrir &&
                `Isso volta a liberar edição de ${MESES[Number(dialogReabrir.competencia.slice(5, 7)) - 1]}/${dialogReabrir.competencia.slice(0, 4)}. Deseja continuar?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogReabrir(null)}>Cancelar</Button>
              <Button appearance="primary" onClick={confirmarReabrir} disabled={processando}>
                {processando ? "Reabrindo..." : "Sim, reabrir"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={!!dialogCriar} onOpenChange={(_e, data) => !data.open && setDialogCriar(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
              Criar relatório?
            </DialogTitle>
            <DialogContent>
              {dialogCriar && `Isso cria o relatório de ${MESES[dialogCriar.mes - 1]}/${dialogCriar.ano} pra essa obra. Deseja continuar?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogCriar(null)}>Cancelar</Button>
              <Button appearance="primary" onClick={confirmarCriar} disabled={processando}>
                {processando ? "Criando..." : "Sim, criar"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {visualizarDados && (
        <DashboardCapaDialog
          open
          onOpenChange={(aberto) => !aberto && setVisualizarDados(null)}
          obraNome={visualizarDados.obraNome}
          cidade={visualizarDados.cidade}
          estado={visualizarDados.estado}
          competencia={visualizarDados.competencia}
          fotoUrl={visualizarDados.fotoUrl}
          camposGerais={visualizarDados.camposGerais}
          clienteContratante={visualizarDados.clienteContratante}
          responsavelTecnico={visualizarDados.responsavelTecnico}
          registroProfissional={visualizarDados.registroProfissional}
          logotipoUrl={visualizarDados.logotipoUrl}
        />
      )}
    </div>
  );
}
