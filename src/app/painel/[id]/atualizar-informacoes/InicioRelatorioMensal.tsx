"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  makeStyles,
  tokens,
  Text,
  Toaster,
  Toast,
  ToastTitle,
  useToastController,
  useId,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Dropdown,
  Option,
  Field,
} from "@fluentui/react-components";
import {
  DocumentAdd20Regular,
  DocumentPdf20Regular,
  CheckmarkCircle20Filled,
  Circle20Regular,
  Warning20Regular,
  LockClosed20Regular,
  LockOpen20Regular,
  Eye20Regular,
} from "@fluentui/react-icons";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import { MESES, formatarCompetencia, competenciaIsoDeAnoMes, competenciaIsoSomarMeses } from "@/lib/competencia";
import { criarNovoRelatorio, fecharRelatorio, reabrirRelatorio } from "./actions";

const useStyles = makeStyles({
  pagina: { maxWidth: "900px", margin: "0 auto" },
  wrap: { display: "flex", flexDirection: "column", padding: "32px 20px 20px", maxWidth: "720px", margin: "0 auto" },
  tituloSecao: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1, marginTop: "28px", marginBottom: "10px" },
  subtitulo: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, marginBottom: "6px" },

  linha: {
    display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px",
    borderRadius: tokens.borderRadiusXLarge, backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`, boxShadow: tokens.shadow4, marginBottom: "10px",
  },
  linhaHistorico: { opacity: 0.85 },
  iconeWrap: { display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: tokens.borderRadiusCircular, flexShrink: 0 },
  iconePetroleo: { backgroundColor: "#dbe7ec", color: "#0e3244" },
  iconeCinza: { backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3 },
  linhaTitulo: { fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  linhaDescricao: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
  linhaBotoes: { display: "flex", gap: "8px", marginLeft: "auto", flexShrink: 0 },
  vazio: {
    padding: "20px", textAlign: "center", color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase300,
    border: `1px dashed ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, marginBottom: "10px",
  },

  cardCriar: {
    display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground1, border: `1px dashed ${tokens.colorNeutralStroke2}`,
    cursor: "pointer", ":hover": { backgroundColor: tokens.colorNeutralBackground2 },
  },
  seletorMesAno: { display: "flex", gap: "12px" },
});

type RelatorioEmAndamento = { id: string; competencia: string; finalizadasCount: number };
type RelatorioHistorico = { id: string; competencia: string };

export default function InicioRelatorioMensal({
  obraId,
  obraNome,
  emAndamento,
  historico,
  competenciasExistentes,
  totalSecoes,
  souAdmin,
}: {
  obraId: string;
  obraNome: string;
  emAndamento: RelatorioEmAndamento[];
  historico: RelatorioHistorico[];
  /** competências (ISO) já usadas, abertas ou não -- pro seletor de mês/ano não deixar escolher de novo */
  competenciasExistentes: string[];
  totalSecoes: number;
  souAdmin: boolean;
}) {
  const classes = useStyles();
  const router = useRouter();
  const toasterId = useId("toaster-inicio-relatorio");
  const { dispatchToast } = useToastController(toasterId);

  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const [relatorioFechando, setRelatorioFechando] = useState<RelatorioEmAndamento | null>(null);
  const [fechando, setFechando] = useState(false);
  const [relatorioReabrindo, setRelatorioReabrindo] = useState<RelatorioHistorico | null>(null);
  const [reabrindo, setReabrindo] = useState(false);

  const sugestaoIso = useMemo(() => {
    const todas = [...emAndamento.map((r) => r.competencia), ...historico.map((r) => r.competencia)];
    if (todas.length === 0) {
      const hoje = new Date();
      return competenciaIsoDeAnoMes(hoje.getFullYear(), hoje.getMonth() + 1);
    }
    const maisRecente = todas.reduce((a, b) => (a > b ? a : b));
    return competenciaIsoSomarMeses(maisRecente, 1);
  }, [emAndamento, historico]);
  const [sugestaoAno, sugestaoMes] = sugestaoIso.split("-").map(Number);
  const [anoSelecionado, setAnoSelecionado] = useState(sugestaoAno);
  const [mesSelecionado, setMesSelecionado] = useState(sugestaoMes);

  const anoAtual = new Date().getFullYear();
  const anosOpcoes = Array.from({ length: 7 }, (_, i) => anoAtual - 5 + i);
  const competenciaSelecionadaIso = competenciaIsoDeAnoMes(anoSelecionado, mesSelecionado);
  const competenciaJaExiste = competenciasExistentes.includes(competenciaSelecionadaIso);

  const competenciaLabelUnica = emAndamento.length === 1 ? formatarCompetencia(emAndamento[0].competencia) : undefined;

  async function confirmarNovoRelatorio() {
    if (competenciaJaExiste) {
      dispatchToast(<Toast><ToastTitle>Já existe um relatório pra esse mês nessa obra.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    setCriando(true);
    const resultado = await criarNovoRelatorio(obraId, competenciaSelecionadaIso);
    setCriando(false);

    if (resultado.erro || !resultado.relatorioId) {
      dispatchToast(<Toast><ToastTitle>{resultado.erro ?? "Não foi possível criar o relatório."}</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    setDialogCriarAberto(false);
    router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/${resultado.relatorioId}/informacoesCapa`);
  }

  async function confirmarFecharMes() {
    if (!relatorioFechando) return;
    setFechando(true);
    const resultado = await fecharRelatorio(obraId, relatorioFechando.id);
    setFechando(false);
    setRelatorioFechando(null);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível fechar o mês.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    dispatchToast(<Toast><ToastTitle>{formatarCompetencia(relatorioFechando.competencia)} travado como histórico.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  async function confirmarReabrir() {
    if (!relatorioReabrindo) return;
    setReabrindo(true);
    const resultado = await reabrirRelatorio(obraId, relatorioReabrindo.id);
    setReabrindo(false);
    setRelatorioReabrindo(null);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível reabrir o relatório.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    dispatchToast(<Toast><ToastTitle>{formatarCompetencia(relatorioReabrindo.competencia)} reaberto pra edição.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  function gerarPdf() {
    dispatchToast(
      <Toast><ToastTitle>Geração de PDF entra numa etapa futura — libera exatamente daqui quando todas as seções estiverem finalizadas.</ToastTitle></Toast>,
      { intent: "info" },
    );
  }

  return (
    <div className={classes.pagina}>
      <Toaster toasterId={toasterId} />
      <CabecalhoRelatorio obraNome={obraNome} subtitulo="Relatório Mensal" competencia={competenciaLabelUnica} />

      <div className={classes.wrap}>
        <div className={classes.subtitulo}>
          {emAndamento.length > 0
            ? "Continue de onde parou, ou feche o mês pra travar os dados como histórico."
            : "Essa obra ainda não tem nenhum relatório mensal — lance o primeiro pra começar a preencher."}
        </div>

        <div className={classes.tituloSecao}>Relatórios em andamento</div>
        {emAndamento.length === 0 ? (
          <div className={classes.vazio}>Nenhum relatório em andamento.</div>
        ) : (
          emAndamento.map((r) => {
            const progressoCompleto = r.finalizadasCount === totalSecoes;
            return (
              <div key={r.id} className={classes.linha}>
                <div className={`${classes.iconeWrap} ${classes.iconePetroleo}`}>
                  {progressoCompleto ? <CheckmarkCircle20Filled fontSize={18} /> : <Circle20Regular fontSize={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={classes.linhaTitulo}>{formatarCompetencia(r.competencia)}</div>
                  <div className={classes.linhaDescricao}>{r.finalizadasCount}/{totalSecoes} seções finalizadas</div>
                </div>
                <div className={classes.linhaBotoes}>
                  <Button
                    appearance="subtle"
                    icon={<DocumentPdf20Regular />}
                    disabled={!progressoCompleto}
                    onClick={gerarPdf}
                  >
                    Gerar PDF
                  </Button>
                  <Button
                    appearance="subtle"
                    icon={<LockClosed20Regular />}
                    onClick={() => setRelatorioFechando(r)}
                  >
                    Fechar mês
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={() => router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/${r.id}/informacoesCapa`)}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            );
          })
        )}

        <Dialog open={dialogCriarAberto} onOpenChange={(_e, data) => setDialogCriarAberto(data.open)}>
          <DialogTrigger disableButtonEnhancement>
            <div className={classes.cardCriar} role="button" tabIndex={0}>
              <div className={`${classes.iconeWrap} ${classes.iconeCinza}`}><DocumentAdd20Regular fontSize={20} /></div>
              <div>
                <div className={classes.linhaTitulo}>Criar relatório de outro mês</div>
                <div className={classes.linhaDescricao}>Escolha o mês — inclusive pra lançar um mês que ficou pra trás.</div>
              </div>
            </div>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Criar relatório</DialogTitle>
              <DialogContent>
                <Text block style={{ marginBottom: 14 }}>
                  Escolha a competência (mês/ano) desse relatório. Não precisa ser o mês seguinte ao último — dá pra
                  voltar e preencher um mês que ficou pra trás.
                </Text>
                <div className={classes.seletorMesAno}>
                  <Field label="Mês">
                    <Dropdown
                      value={MESES[mesSelecionado - 1]}
                      selectedOptions={[String(mesSelecionado)]}
                      onOptionSelect={(_e, data) => data.optionValue && setMesSelecionado(Number(data.optionValue))}
                    >
                      {MESES.map((nome, i) => (
                        <Option key={nome} value={String(i + 1)}>{nome}</Option>
                      ))}
                    </Dropdown>
                  </Field>
                  <Field label="Ano">
                    <Dropdown
                      value={String(anoSelecionado)}
                      selectedOptions={[String(anoSelecionado)]}
                      onOptionSelect={(_e, data) => data.optionValue && setAnoSelecionado(Number(data.optionValue))}
                    >
                      {anosOpcoes.map((ano) => (
                        <Option key={ano} value={String(ano)}>{String(ano)}</Option>
                      ))}
                    </Dropdown>
                  </Field>
                </div>
                {competenciaJaExiste && (
                  <Text block style={{ marginTop: 10, color: tokens.colorPaletteRedForeground1 }}>
                    Já existe um relatório pra {formatarCompetencia(competenciaSelecionadaIso)} nessa obra.
                  </Text>
                )}
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">Cancelar</Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={confirmarNovoRelatorio} disabled={criando || competenciaJaExiste}>
                  {criando ? "Criando..." : "Criar relatório"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {historico.length > 0 && (
          <>
            <div className={classes.tituloSecao}>Histórico</div>
            {historico.map((r) => (
              <div key={r.id} className={`${classes.linha} ${classes.linhaHistorico}`}>
                <div className={`${classes.iconeWrap} ${classes.iconeCinza}`}><LockClosed20Regular fontSize={16} /></div>
                <div style={{ flex: 1 }}>
                  <div className={classes.linhaTitulo}>{formatarCompetencia(r.competencia)}</div>
                  <div className={classes.linhaDescricao}>Travado como histórico.</div>
                </div>
                <div className={classes.linhaBotoes}>
                  <Button
                    appearance="subtle"
                    icon={<Eye20Regular />}
                    onClick={() => router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/${r.id}/informacoesCapa`)}
                  >
                    Visualizar
                  </Button>
                  {souAdmin && (
                    <Button appearance="subtle" icon={<LockOpen20Regular />} onClick={() => setRelatorioReabrindo(r)}>
                      Reabrir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog open={!!relatorioFechando} onOpenChange={(_e, data) => !data.open && setRelatorioFechando(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
              Fechar {relatorioFechando ? formatarCompetencia(relatorioFechando.competencia) : "mês"}?
            </DialogTitle>
            <DialogContent>
              {relatorioFechando &&
                `Isso vai travar os dados de ${formatarCompetencia(relatorioFechando.competencia)} como histórico — não será mais editável (só um admin pode reabrir depois). Deseja continuar?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setRelatorioFechando(null)}>Cancelar</Button>
              <Button appearance="primary" onClick={confirmarFecharMes} disabled={fechando}>
                {fechando ? "Fechando..." : "Sim, fechar mês"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={!!relatorioReabrindo} onOpenChange={(_e, data) => !data.open && setRelatorioReabrindo(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
              Reabrir {relatorioReabrindo ? formatarCompetencia(relatorioReabrindo.competencia) : "relatório"}?
            </DialogTitle>
            <DialogContent>
              {relatorioReabrindo &&
                `Isso vai destravar os dados de ${formatarCompetencia(relatorioReabrindo.competencia)} pra edição de novo. Deseja continuar?`}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setRelatorioReabrindo(null)}>Cancelar</Button>
              <Button appearance="primary" onClick={confirmarReabrir} disabled={reabrindo}>
                {reabrindo ? "Reabrindo..." : "Sim, reabrir"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
