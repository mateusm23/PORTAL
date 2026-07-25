"use client";

import {
  makeStyles,
  tokens,
  Button,
  Text,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
} from "@fluentui/react-components";

// prévia do dashboard da capa — representa a imagem exata que vira PDF, por
// isso NUNCA pode ter barra de rolagem (ver CONTEXTO_PROJETO.md e a memória
// salva sobre isso): tudo aqui é flex com overflow:hidden em vez de altura
// fixa em px, pra caber inteiro no modal em vez de estourar.
const useStyles = makeStyles({
  dialogo: { width: "97vw", maxWidth: "1700px", height: "94vh", maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  corpo: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" },
  conteudo: { flex: 1, minHeight: 0, overflow: "hidden" },
  grade: { display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "24px", height: "100%" },
  coluna: {
    borderRadius: tokens.borderRadiusLarge, overflow: "hidden", border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex", flexDirection: "column", height: "100%",
  },
  faixa: {
    backgroundColor: "#0e3244", color: "#ffffff", padding: "14px 18px", textAlign: "center",
    fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, letterSpacing: "0.03em", flexShrink: 0,
  },
  faixaEsquerda: { textAlign: "left" },
  colunaCorpo: { padding: "18px 20px", backgroundColor: "#ffffff", flex: 1, minHeight: 0, overflow: "hidden" },
  destaque: {
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px",
    backgroundColor: "#e7f0f6", borderRadius: tokens.borderRadiusMedium, marginBottom: "16px",
    fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, color: "#0e3244",
  },
  linha: {
    display: "flex", justifyContent: "space-between", padding: "7px 2px",
    fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  linhaValor: { fontWeight: 600, color: "#0f172a" },
  subfaixa: {
    backgroundColor: "#f1f5f9", color: "#0e3244", padding: "6px 10px", fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200, margin: "16px 0 6px 0", borderRadius: tokens.borderRadiusSmall,
  },
  fotoWrap: {
    flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
    background: "linear-gradient(160deg, #ffb877 0%, #f2836a 30%, #6a5a9c 65%, #2c2a4f 100%)",
  },
  fotoImg: { width: "100%", height: "100%", objectFit: "cover" },
  resumoWrap: { padding: "20px 22px", backgroundColor: "#eef1f4", flexShrink: 0 },
  gradeTiles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  tile: { backgroundColor: "#ffffff", borderRadius: tokens.borderRadiusMedium, padding: "16px 18px", border: `1px solid ${tokens.colorNeutralStroke2}` },
  tileLabel: { fontSize: "11px", fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.03em" },
  tileValor: { fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightBold, color: "#0e3244", marginTop: "4px" },
  tileLogo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
  rodapeCapa: {
    display: "flex", justifyContent: "space-between", gap: "12px", padding: "12px 18px", backgroundColor: "#ffffff",
    fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, flexShrink: 0,
  },
});

// Prazo e Financeiro ainda não foram construídos — esses números são só
// ilustrativos, mesmo formato da capa da Versão Atual (Power BI).
const RESUMO_EXECUTIVO_ILUSTRATIVO = {
  orcamento: "R$ 40.863.521,40",
  pagoAcumulado: "R$ 33.911.168,24",
  idc: "0,93",
  terminoPrevisto: "dez/2026",
  executadoAcumulado: "77,4%",
  executadoMensal: "2,7%",
  idp: "0,90",
};

type CampoGeral = { chave: string; label: string; valor: string; grupo: "detalhes" | "area" };

export default function DashboardCapaDialog({
  open,
  onOpenChange,
  obraNome,
  cidade,
  estado,
  competencia,
  fotoUrl,
  camposGerais,
  clienteContratante,
  responsavelTecnico,
  registroProfissional,
  logotipoUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}) {
  const classes = useStyles();
  const camposDetalhes = camposGerais.filter((c) => c.grupo === "detalhes");
  const camposArea = camposGerais.filter((c) => c.grupo === "area");

  return (
    <Dialog open={open} onOpenChange={(_e, data) => onOpenChange(data.open)}>
      <DialogSurface className={classes.dialogo}>
        <DialogBody className={classes.corpo}>
          <DialogTitle>Prévia · Dashboard da Capa</DialogTitle>
          <DialogContent className={classes.conteudo}>
            <div className={classes.grade}>
              {/* coluna esquerda — Informações Gerais */}
              <div className={classes.coluna}>
                <div className={`${classes.faixa} ${classes.faixaEsquerda}`}>INFORMAÇÕES GERAIS</div>
                <div className={classes.colunaCorpo}>
                  <div className={classes.destaque}>
                    <span>Data Base do relatório:</span>
                    <span>{competencia}</span>
                  </div>
                  <div className={classes.linha}>
                    <span>Nome Comercial:</span>
                    <span className={classes.linhaValor}>{obraNome}</span>
                  </div>

                  {camposDetalhes.length > 0 && (
                    <>
                      <div className={classes.subfaixa}>Detalhes do Projeto</div>
                      {camposDetalhes.map((c) => (
                        <div key={c.chave} className={classes.linha}>
                          <span>{c.label}:</span>
                          <span className={classes.linhaValor}>{c.valor || "—"}</span>
                        </div>
                      ))}
                      <div className={classes.linha}>
                        <span>Cidade:</span>
                        <span className={classes.linhaValor}>{cidade && estado ? `${cidade} - ${estado}` : "—"}</span>
                      </div>
                    </>
                  )}

                  {camposArea.length > 0 && (
                    <>
                      <div className={classes.subfaixa}>Dados de Área do Projeto</div>
                      {camposArea.map((c) => (
                        <div key={c.chave} className={classes.linha}>
                          <span>{c.label}:</span>
                          <span className={classes.linhaValor}>{c.valor || "—"}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* coluna direita — Relatório Mensal de Obra */}
              <div className={classes.coluna}>
                <div className={classes.faixa}>RELATÓRIO MENSAL DE OBRA</div>
                <div className={classes.fotoWrap}>
                  {fotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoUrl} alt={`Foto de ${obraNome}`} className={classes.fotoImg} />
                  )}
                </div>
                <div className={classes.faixa}>RESUMO EXECUTIVO DO EMPREENDIMENTO</div>
                <div className={classes.resumoWrap}>
                  <div className={classes.gradeTiles}>
                    <div className={classes.tile}><div className={classes.tileLabel}>Orçamento</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.orcamento}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>Pago acumulado</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.pagoAcumulado}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>IDC</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.idc}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>Término previsto</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.terminoPrevisto}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>Executado (acum.)</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.executadoAcumulado}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>Executado (mensal)</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.executadoMensal}</div></div>
                    <div className={classes.tile}><div className={classes.tileLabel}>IDP</div><div className={classes.tileValor}>{RESUMO_EXECUTIVO_ILUSTRATIVO.idp}</div></div>
                    <div className={`${classes.tile} ${classes.tileLogo}`}>
                      {logotipoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logotipoUrl} alt="Logotipo do cliente" style={{ maxHeight: 28, maxWidth: "100%" }} />
                      ) : (
                        <Text size={200} style={{ color: tokens.colorNeutralForeground4, fontStyle: "italic" }}>sem logotipo</Text>
                      )}
                    </div>
                  </div>
                </div>
                <div className={classes.rodapeCapa}>
                  <span>Cliente: {clienteContratante || "—"}</span>
                  <span>Responsável: {responsavelTecnico || "—"}{registroProfissional ? ` · ${registroProfissional}` : ""}</span>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Fechar</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
