// Embed do Google Maps (sem precisar de chave de API — mesmo truque usado em
// muitos sites institucionais, inclusive nos das próprias obras). Trocado do
// Nominatim/Leaflet porque a geocodificação de rua no Brasil do Google é bem
// mais precisa (o Mateus testou um endereço real e o pino saiu no lugar
// errado com o OpenStreetMap).
export default function MapaObra({ endereco }: { endereco: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`;

  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100%", border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Mapa de ${endereco}`}
    />
  );
}
