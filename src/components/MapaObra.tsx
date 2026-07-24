"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// corrige um bug clássico do Leaflet com bundlers (Next.js/Webpack): o ícone
// padrão do marcador referencia os PNGs por um caminho relativo que não
// existe depois do build, então o pino aparecia quebrado ("imagem não
// encontrada"). Aponta explicitamente pros arquivos via CDN.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// tiles CartoDB Positron: estilo claro/minimalista, sem chave de API
// (mesmo padrão validado no preview preview/06-home-obra-blend.html)
export default function MapaObra({
  lat,
  lon,
  zoom = 14,
}: {
  lat: number;
  lon: number;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapaRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return;

    const mapa = L.map(containerRef.current).setView([lat, lon], zoom);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(mapa);
    L.marker([lat, lon]).addTo(mapa);
    mapaRef.current = mapa;
    requestAnimationFrame(() => mapa.invalidateSize());

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, [lat, lon, zoom]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
