"use client";

import { useState } from "react";
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
} from "@fluentui/react-components";
import {
  DocumentEdit20Regular,
  DocumentAdd20Regular,
  DocumentPdf20Regular,
  CheckmarkCircle20Filled,
  Circle20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import { formatarCompetencia } from "@/lib/competencia";
import { criarNovoRelatorio } from "./actions";

const useStyles = makeStyles({
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px 20px", maxWidth: "720px", margin: "0 auto" },
  progresso: {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", padding: "10px 18px",
    borderRadius: tokens.borderRadiusXLarge, backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`, boxShadow: tokens.shadow4,
  },
  titulo: { fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1, marginBottom: "6px" },
  subtitulo: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, marginBottom: "32px", textAlign: "center", maxWidth: "460px" },
  acoes: { display: "flex", gap: "20px" },
  card: {
    width: "210px", padding: "24px 18px", borderRadius: tokens.borderRadiusXLarge,
    backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", gap: "10px",
    ":hover": { boxShadow: tokens.shadow16 },
  },
  cardDesabilitado: { cursor: "not-allowed", opacity: 0.55, ":hover": { boxShadow: tokens.shadow8 } },
  iconeWrap: { display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: tokens.borderRadiusCircular },
  iconePetroleo: { backgroundColor: "#dbe7ec", color: "#0e3244" },
  iconeAmbar: { backgroundColor: tokens.colorPaletteMarigoldBackground2, color: tokens.colorPaletteMarigoldForeground1 },
  iconeVerde: { backgroundColor: tokens.colorPaletteGreenBackground2, color: tokens.colorPaletteGreenForeground1 },
  iconeCinza: { backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3 },
  cardTitulo: { fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  cardDescricao: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
});

export default function InicioRelatorioMensal({
  obraId,
  obraNome,
  relatorioAtual,
  finalizadasCount,
  totalSecoes,
}: {
  obraId: string;
  obraNome: string;
  relatorioAtual: { id: string; competencia: string } | null;
  finalizadasCount: number;
  totalSecoes: number;
}) {
  const classes = useStyles();
  const router = useRouter();
  const toasterId = useId("toaster-inicio-relatorio");
  const { dispatchToast } = useToastController(toasterId);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [criando, setCriando] = useState(false);

  const progressoCompleto = !!relatorioAtual && finalizadasCount === totalSecoes;
  const competenciaLabel = relatorioAtual ? formatarCompetencia(relatorioAtual.competencia) : null;

  function irParaPrimeiraSecao() {
    router.push(`/painel/${obraId}/atualizar-informacoes/relatorio/informacoesCapa`);
  }

  async function confirmarNovoRelatorio() {
    setCriando(true);
    const resultado = await criarNovoRelatorio(obraId);
    setCriando(false);
    setDialogAberto(false);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível criar o relatório.</ToastTitle></Toast>, { intent: "error" });
      return;
    }
    irParaPrimeiraSecao();
  }

  function gerarPdf() {
    dispatchToast(
      <Toast><ToastTitle>Geração de PDF entra numa etapa futura — libera exatamente daqui quando todas as seções estiverem finalizadas.</ToastTitle></Toast>,
      { intent: "info" },
    );
  }

  return (
    <div>
      <Toaster toasterId={toasterId} />
      <CabecalhoRelatorio obraNome={obraNome} subtitulo="Relatório Mensal" competencia={competenciaLabel ?? undefined} />

      <div className={classes.wrap}>
        {relatorioAtual && (
          <div className={classes.progresso}>
            {progressoCompleto
              ? <CheckmarkCircle20Filled fontSize={18} style={{ color: tokens.colorPaletteGreenForeground1 }} />
              : <Circle20Regular fontSize={18} style={{ color: tokens.colorPaletteMarigoldForeground1 }} />}
            <Text weight="semibold">{finalizadasCount}/{totalSecoes} seções finalizadas</Text>
          </div>
        )}

        <div className={classes.titulo}>O que você quer fazer?</div>
        <div className={classes.subtitulo}>
          {relatorioAtual
            ? "Continue de onde parou no relatório deste mês, ou avance pro próximo mês — isso trava os dados atuais como histórico."
            : "Essa obra ainda não tem nenhum relatório mensal — lance o primeiro pra começar a preencher."}
        </div>

        <div className={classes.acoes}>
          {relatorioAtual && (
            <div className={classes.card} onClick={irParaPrimeiraSecao} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") irParaPrimeiraSecao(); }}>
              <div className={`${classes.iconeWrap} ${classes.iconePetroleo}`}><DocumentEdit20Regular fontSize={22} /></div>
              <div className={classes.cardTitulo}>Editar relatório atual</div>
              <div className={classes.cardDescricao}>Continuar o relatório de {competenciaLabel}.</div>
            </div>
          )}

          <Dialog open={dialogAberto} onOpenChange={(_e, data) => setDialogAberto(data.open)}>
            <DialogTrigger disableButtonEnhancement>
              <div className={classes.card} role="button" tabIndex={0}>
                <div className={`${classes.iconeWrap} ${classes.iconeAmbar}`}><DocumentAdd20Regular fontSize={22} /></div>
                <div className={classes.cardTitulo}>{relatorioAtual ? "Desenvolver novo Relatório" : "Lançar primeiro relatório"}</div>
                <div className={classes.cardDescricao}>
                  {relatorioAtual ? "Avança pro próximo mês e trava o atual como histórico." : "Cria o relatório do mês atual pra começar a preencher."}
                </div>
              </div>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>
                  <Warning20Regular style={{ verticalAlign: "middle", marginRight: 8, color: tokens.colorPaletteMarigoldForeground1 }} />
                  {relatorioAtual ? "Travar dados do mês atual?" : "Lançar o primeiro relatório?"}
                </DialogTitle>
                <DialogContent>
                  {relatorioAtual
                    ? `Isso vai travar os dados de ${competenciaLabel} como histórico — não será mais editável depois. Deseja continuar?`
                    : "Isso cria o relatório do mês atual pra essa obra. Deseja continuar?"}
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancelar</Button>
                  </DialogTrigger>
                  <Button appearance="primary" onClick={confirmarNovoRelatorio} disabled={criando}>
                    {criando ? "Criando..." : "Sim, continuar"}
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>

          {relatorioAtual && (
            <div
              className={`${classes.card} ${!progressoCompleto ? classes.cardDesabilitado : ""}`}
              onClick={progressoCompleto ? gerarPdf : undefined}
              role="button" tabIndex={progressoCompleto ? 0 : -1}
            >
              <div className={`${classes.iconeWrap} ${progressoCompleto ? classes.iconeVerde : classes.iconeCinza}`}><DocumentPdf20Regular fontSize={22} /></div>
              <div className={classes.cardTitulo}>Gerar PDF</div>
              <div className={classes.cardDescricao}>{progressoCompleto ? "Todas as seções prontas." : "Libera quando todas as seções estiverem finalizadas."}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
