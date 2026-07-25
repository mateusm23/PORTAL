const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// competencia vem do banco como date (sempre dia 1 do mês), ex: "2026-08-01"
export function formatarCompetencia(competenciaIso: string) {
  const [ano, mes] = competenciaIso.split("-").map(Number);
  return `${MESES[mes - 1]}/${ano}`;
}
