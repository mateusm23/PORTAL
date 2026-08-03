export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// competencia vem do banco como date (sempre dia 1 do mês), ex: "2026-08-01"
export function formatarCompetencia(competenciaIso: string) {
  const [ano, mes] = competenciaIso.split("-").map(Number);
  return `${MESES[mes - 1]}/${ano}`;
}

// pro seletor de mês/ano na tela de início do Relatório Mensal — a
// competência escolhida pelo usuário vira sempre dia 1 do mês.
export function competenciaIsoDeAnoMes(ano: number, mes1a12: number) {
  return `${ano}-${String(mes1a12).padStart(2, "0")}-01`;
}

// soma/subtrai meses a partir de uma competência ISO -- usado só pra
// sugerir um valor inicial no seletor (último relatório + 1), continua
// livre pro usuário trocar.
export function competenciaIsoSomarMeses(competenciaIso: string, meses: number) {
  const [ano, mes] = competenciaIso.split("-").map(Number);
  const data = new Date(ano, mes - 1 + meses, 1);
  return competenciaIsoDeAnoMes(data.getFullYear(), data.getMonth() + 1);
}
