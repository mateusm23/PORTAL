async function buscarNominatim(consulta: string): Promise<{ lat: number; lon: number } | null> {
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

// Converte um endereço em texto pra lat/lon usando o Nominatim (geocodificação
// gratuita do próprio OpenStreetMap, mesma origem dos tiles do MapaObra).
// Cacheado por 24h (revalidate) pra não estourar o limite de uso do serviço
// gratuito a cada carregamento da Home da obra.
//
// Recebe cidade/estado separados (já existem no cadastro da obra) e monta a
// consulta completa por baixo dos panos — a pessoa só precisa digitar a rua,
// não o endereço inteiro. Se não achar o endereço exato, cai pro nível da
// cidade (sempre resolve), em vez de simplesmente não mostrar mapa nenhum.
export async function geocodificarEndereco(
  endereco: string,
  cidade?: string | null,
  estado?: string | null,
): Promise<{ lat: number; lon: number } | null> {
  const rua = endereco.trim();
  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");

  if (rua) {
    const consultaCompleta = [rua, cidadeEstado, "Brasil"].filter(Boolean).join(", ");
    const resultado = await buscarNominatim(consultaCompleta);
    if (resultado) return resultado;
  }

  if (cidadeEstado) {
    return buscarNominatim(`${cidadeEstado}, Brasil`);
  }

  return null;
}
