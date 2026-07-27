"use client";

import { makeStyles, tokens, Text } from "@fluentui/react-components";

// Visual puro da Capa do Relatório Mensal — validado em preview/16 (várias
// rodadas, incluindo teste real de impressão em PDF via Chrome headless).
// Separado do DashboardCapaDialog.tsx de propósito: esse componente não sabe
// nada sobre "estar dentro de um modal" — ele é só o conteúdo, pra poder ser
// reaproveitado tanto no modal "Visualizar" quanto na exportação real de PDF
// (Playwright) mais pra frente, sem duplicar o visual em dois lugares.
//
// Cores exatas das medidas DAX do Power BI original (ver dados-obras/ e
// CONTEXTO_PROJETO.md) — não são uma paleta nova, é a correção de um desvio
// que já existia no app antes desta rodada.
const AZUL_PROFUNDO = "#003366";
const AZUL_FAIXA = "#002244";
const AZUL_DESTAQUE = "#005599";
const AZUL_TILE = "#002B55";
const CINZA_RESUMO = "#E6E6E6";

// Prazo e Financeiro ainda não foram construídos — estes números são só
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

type EstiloLinha = { fontSize: string; padding: string };
type EstiloSubfaixa = { fontSize: string; margin: string; paddingBottom: string };
type EstiloDestaque = { fontSize: string; padding: string; marginBottom: string };
type EscalaFonte = { linha: EstiloLinha; subfaixa: EstiloSubfaixa; destaque: EstiloDestaque; titulo: string };

// fonte automatica: quanto mais campo de Informações Gerais a obra tiver
// habilitado, menor o corpo do texto (fonte E espaçamento) -- assim nunca
// corta conteúdo (regra "Visualizar nunca rola"), só aperta quando precisa.
// Calibrado contra o tamanho real da página do Power BI (1280x720px,
// confirmado no arquivo original) via teste de impressão real
// (Chrome headless --print-to-pdf) -- não é A4, é bem mais baixo que uma
// janela de navegador comum, por isso o ajuste é mais agressivo do que só
// diminuir a fonte.
function calcularEscalaFonte(totalLinhas: number): EscalaFonte {
  if (totalLinhas <= 11) {
    return {
      linha: { fontSize: "16px", padding: "8px 1px" },
      subfaixa: { fontSize: "18px", margin: "14px 0 6px 0", paddingBottom: "4px" },
      destaque: { fontSize: "16px", padding: "11px 14px", marginBottom: "12px" },
      titulo: "24px",
    };
  }
  if (totalLinhas <= 14) {
    return {
      linha: { fontSize: "13px", padding: "6px 1px" },
      subfaixa: { fontSize: "16px", margin: "10px 0 5px 0", paddingBottom: "3px" },
      destaque: { fontSize: "14px", padding: "9px 12px", marginBottom: "10px" },
      titulo: "22px",
    };
  }
  return {
    linha: { fontSize: "11px", padding: "4px 1px" },
    subfaixa: { fontSize: "14px", margin: "7px 0 4px 0", paddingBottom: "2px" },
    destaque: { fontSize: "12px", padding: "7px 10px", marginBottom: "8px" },
    titulo: "20px",
  };
}

const useStyles = makeStyles({
  pagina: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", fontFamily: "'Segoe UI', Arial, sans-serif" },
  grade: { display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "24px", height: "100%" },
  coluna: {
    borderRadius: "10px", overflow: "hidden", boxShadow: "0 6px 20px rgba(0,20,50,0.18)",
    display: "flex", flexDirection: "column", height: "100%",
  },

  colunaEsquerda: { backgroundColor: AZUL_PROFUNDO },
  faixaEsquerda: {
    backgroundColor: AZUL_FAIXA, color: "#ffffff", padding: "16px 20px",
    fontWeight: 700, letterSpacing: "0.02em", flexShrink: 0,
  },
  corpoEsquerdo: {
    padding: "20px 24px 26px", flex: 1, minHeight: 0, overflow: "hidden", color: "#ffffff",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
  },
  destaque: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    backgroundColor: AZUL_DESTAQUE, borderRadius: "4px", fontWeight: 700, color: "#ffffff",
  },
  linha: {
    display: "flex", justifyContent: "space-between", color: "#ffffff",
    borderBottom: "1px solid rgba(255,255,255,0.25)",
  },
  linhaLabel: { fontWeight: 400 },
  linhaValor: { fontWeight: 700, textAlign: "right" },
  linhaValorVazio: { fontWeight: 400, color: "rgba(255,255,255,0.45)", fontStyle: "italic" },
  subfaixa: { fontWeight: 700, color: "#ffffff", borderBottom: `1px solid ${AZUL_DESTAQUE}` },

  colunaDireita: { backgroundColor: "#ffffff", border: `1px solid ${tokens.colorNeutralStroke2}` },
  faixaDireita: {
    backgroundColor: AZUL_FAIXA, color: "#ffffff", padding: "11px 18px", textAlign: "center",
    fontSize: "17px", fontWeight: 700, letterSpacing: "0.03em", flexShrink: 0,
  },
  fotoWrap: {
    flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
    background: "linear-gradient(160deg, #ffb877 0%, #f2836a 30%, #6a5a9c 65%, #2c2a4f 100%)",
  },
  fotoImg: { width: "100%", height: "100%", objectFit: "cover" },
  resumoWrap: { padding: "13px", backgroundColor: CINZA_RESUMO, flexShrink: 0 },
  gradeTiles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "9px" },
  tile: { backgroundColor: AZUL_TILE, borderRadius: "7px", padding: "11px 13px", minHeight: "72px", display: "flex", flexDirection: "column", justifyContent: "center" },
  tileLabel: { fontSize: "10.5px", color: "#BFD3E6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "5px", fontWeight: 600 },
  tileValor: { fontSize: "19px", fontWeight: 700, color: "#ffffff", lineHeight: 1.15 },
  tileLogo: {
    backgroundColor: CINZA_RESUMO, borderRadius: "7px", minHeight: "72px",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "10px",
  },
  logoImg: { maxHeight: "42px", maxWidth: "100%", display: "block" },

  rodape: {
    display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 18px", backgroundColor: "#ffffff",
    fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, flexShrink: 0,
  },
});

type CampoGeral = { chave: string; label: string; valor: string; grupo: "detalhes" | "area" };

function LinhaCampo({
  classes, label, valor, estilo,
}: {
  classes: ReturnType<typeof useStyles>;
  label: string;
  valor: string;
  estilo: EstiloLinha;
}) {
  const vazio = !valor;
  return (
    <div className={classes.linha} style={estilo}>
      <span className={classes.linhaLabel}>{label}:</span>
      <span className={`${classes.linhaValor} ${vazio ? classes.linhaValorVazio : ""}`}>{vazio ? "—" : valor}</span>
    </div>
  );
}

export default function CapaRelatorioPdf({
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
  const escala = calcularEscalaFonte(2 + camposGerais.length); // +Nome Comercial +Cidade

  const temRodape = !!(clienteContratante || responsavelTecnico || logotipoUrl);

  return (
    <div className={classes.pagina}>
      <div className={classes.grade}>
        <div className={`${classes.coluna} ${classes.colunaEsquerda}`}>
          <div className={classes.faixaEsquerda} style={{ fontSize: escala.titulo }}>INFORMAÇÕES GERAIS</div>
          <div className={classes.corpoEsquerdo}>
            <div className={classes.destaque} style={escala.destaque}>
              <span>Data Base do relatório:</span>
              <span>{competencia}</span>
            </div>
            <LinhaCampo classes={classes} label="Nome Comercial" valor={obraNome} estilo={escala.linha} />

            {camposDetalhes.length > 0 && (
              <>
                <div className={classes.subfaixa} style={escala.subfaixa}>Detalhes do Projeto</div>
                {camposDetalhes.map((c) => (
                  <LinhaCampo key={c.chave} classes={classes} label={c.label} valor={c.valor} estilo={escala.linha} />
                ))}
              </>
            )}
            <LinhaCampo
              classes={classes} label="Cidade"
              valor={cidade && estado ? `${cidade} - ${estado}` : ""}
              estilo={escala.linha}
            />

            {camposArea.length > 0 && (
              <>
                <div className={classes.subfaixa} style={escala.subfaixa}>Dados de Área do Projeto</div>
                {camposArea.map((c) => (
                  <LinhaCampo key={c.chave} classes={classes} label={c.label} valor={c.valor} estilo={escala.linha} />
                ))}
              </>
            )}
          </div>
        </div>

        <div className={`${classes.coluna} ${classes.colunaDireita}`}>
          <div className={classes.faixaDireita}>RELATÓRIO MENSAL DE OBRA</div>
          <div className={classes.fotoWrap}>
            {fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt={`Foto de ${obraNome}`} className={classes.fotoImg} />
            )}
          </div>
          <div className={classes.faixaDireita}>RESUMO EXECUTIVO DO EMPREENDIMENTO</div>
          <div className={classes.resumoWrap}>
            <div className={classes.gradeTiles}>
              {([
                ["Orçamento", RESUMO_EXECUTIVO_ILUSTRATIVO.orcamento],
                ["Pago acumulado", RESUMO_EXECUTIVO_ILUSTRATIVO.pagoAcumulado],
                ["IDC", RESUMO_EXECUTIVO_ILUSTRATIVO.idc],
                ["Término previsto", RESUMO_EXECUTIVO_ILUSTRATIVO.terminoPrevisto],
                ["Executado (acum.)", RESUMO_EXECUTIVO_ILUSTRATIVO.executadoAcumulado],
                ["Executado (mensal)", RESUMO_EXECUTIVO_ILUSTRATIVO.executadoMensal],
                ["IDP", RESUMO_EXECUTIVO_ILUSTRATIVO.idp],
              ] as const).map(([label, valor]) => (
                <div key={label} className={classes.tile}>
                  <div className={classes.tileLabel}>{label}</div>
                  <div className={classes.tileValor}>{valor}</div>
                </div>
              ))}
              <div className={classes.tileLogo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marca/logo-trinus.png" alt="Trinus" className={classes.logoImg} />
              </div>
            </div>
          </div>

          {temRodape && (
            <div className={classes.rodape}>
              <span>Cliente: {clienteContratante || "—"}</span>
              <span>Responsável: {responsavelTecnico || "—"}{registroProfissional ? ` · ${registroProfissional}` : ""}</span>
              {logotipoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logotipoUrl} alt="Logotipo do cliente" style={{ maxHeight: 22, maxWidth: 100 }} />
              ) : (
                <Text size={200} style={{ color: tokens.colorNeutralForeground4, fontStyle: "italic" }}>sem logo do cliente</Text>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
