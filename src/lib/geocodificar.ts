// Converte um endereço em texto pra lat/lon usando o Nominatim (geocodificação
// gratuita do próprio OpenStreetMap, mesma origem dos tiles do MapaObra).
// Cacheado por 24h (revalidate) pra não estourar o limite de uso do serviço
// gratuito a cada carregamento da Home da obra.
export async function geocodificarEndereco(endereco: string): Promise<{ lat: number; lon: number } | null> {
  const consulta = endereco.trim();
  if (!consulta) return null;

  try {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`,
      {
        headers: { "User-Agent": "portal-relatorios-mensais (uso interno)" },
        next: { revalidate: 60 * 60 * 24 },
      },
    );
    if (!resposta.ok) return null;

    const dados: Array<{ lat: string; lon: string }> = await resposta.json();
    if (!Array.isArray(dados) || dados.length === 0) return null;

    const lat = parseFloat(dados[0].lat);
    const lon = parseFloat(dados[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { lat, lon };
  } catch {
    return null;
  }
}
