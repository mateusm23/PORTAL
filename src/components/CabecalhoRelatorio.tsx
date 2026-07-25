"use client";

import { makeStyles, tokens, Badge } from "@fluentui/react-components";

// cabeçalho padrão de toda tela dentro de "Atualizar Informações" (início,
// Informações Gerais, seções do relatório) — validado em vários rounds de
// preview antes de virar código (ver CONTEXTO_PROJETO.md). Título é sempre o
// nome da obra; o subtítulo diz qual tela é essa. A régua bicolor (grosso
// petróleo + fino cinza) e a cor petróleo do badge de competência reaproveitam
// o mesmo acento já usado em ObrasGrid.tsx — não é uma paleta nova.
const useStyles = makeStyles({
  cabecalho: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", paddingBottom: "6px" },
  titulo: { fontSize: "30px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 },
  subtitulo: { fontSize: "18px", fontWeight: tokens.fontWeightMedium, color: "#64748b", marginTop: "6px" },
  badges: { display: "flex", alignItems: "flex-start", gap: "10px", flexShrink: 0 },
  badgeStatus: { fontSize: tokens.fontSizeBase400, padding: "12px 20px", fontWeight: tokens.fontWeightSemibold },
  badgeCompetencia: {
    fontSize: tokens.fontSizeBase400, padding: "12px 22px", fontWeight: tokens.fontWeightSemibold,
    backgroundColor: "#0e3244", color: "#ffffff",
  },
  regua: { display: "flex", alignItems: "center", marginBottom: "20px" },
  reguaGrossa: { width: "160px", height: "4px", backgroundColor: "#0e3244", borderRadius: "2px", flexShrink: 0 },
  reguaFina: { flex: 1, height: "1px", backgroundColor: "#cbd5e1" },
});

export default function CabecalhoRelatorio({
  obraNome,
  subtitulo,
  competencia,
  finalizado,
}: {
  obraNome: string;
  subtitulo: string;
  /** só passa quando a tela tem um mês associado (seções do relatório e a tela de início) */
  competencia?: string;
  /** só passa dentro de uma seção do relatório — controla o badge "Finalizada"/"Em preenchimento" */
  finalizado?: boolean;
}) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.cabecalho}>
        <div>
          <h1 className={classes.titulo}>{obraNome}</h1>
          <p className={classes.subtitulo}>{subtitulo}</p>
        </div>
        {competencia && (
          <div className={classes.badges}>
            {finalizado !== undefined && (
              <Badge className={classes.badgeStatus} appearance="tint" color={finalizado ? "success" : "warning"}>
                {finalizado ? "Finalizada" : "Em preenchimento"}
              </Badge>
            )}
            <Badge className={classes.badgeCompetencia} appearance="filled">
              {competencia}
            </Badge>
          </div>
        )}
      </div>
      <div className={classes.regua}>
        <div className={classes.reguaGrossa} />
        <div className={classes.reguaFina} />
      </div>
    </>
  );
}
