"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { makeStyles, tokens, Badge, Text, Button } from "@fluentui/react-components";
import { Location20Regular, Edit20Regular } from "@fluentui/react-icons";
import { TIPO_LABEL, ESCOPO_LABEL, STATUS_LABEL, TIPO_COR, ESCOPO_COR, STATUS_COR } from "@/lib/obraCatalogo";
import { CATALOGO_CAMPOS_GERAIS, type CampoChave } from "@/lib/obraCampoCatalogo";

const MapaObra = dynamic(() => import("@/components/MapaObra"), { ssr: false });

type Obra = { id: string; nome: string; tipo: string; escopo: string; status: string; cidade: string | null; estado: string | null };
type InfoFixa = { foto_url: string | null; endereco: string | null };
type CampoAtivo = { campo_chave: string; valor: string | null };

const useStyles = makeStyles({
  badgesLinha: { display: "flex", gap: "6px", marginTop: "8px" },
  subtitulo: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, marginTop: "4px" },

  linhaPrincipal: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gridTemplateAreas: '"foto dados"',
    gap: "20px",
    marginTop: "24px",
  },
  heroImagem: {
    position: "relative",
    gridArea: "foto",
    width: "100%",
    height: "320px",
    borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden",
    background: "linear-gradient(160deg, #ffb877 0%, #f2836a 30%, #6a5a9c 65%, #2c2a4f 100%)",
    boxShadow: tokens.shadow8,
  },
  fotoImg: { width: "100%", height: "100%", objectFit: "cover" },
  heroLegenda: { position: "absolute", bottom: "10px", right: "14px", fontSize: "10.5px", color: "rgba(255,255,255,0.75)" },

  cartaoDados: {
    gridArea: "dados",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: "20px 22px",
    height: "100%",
    boxSizing: "border-box",
  },
  cabecalhoCartao: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  gradeIconTiles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  iconTile: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: tokens.borderRadiusLarge, backgroundColor: tokens.colorNeutralBackground3 },
  iconTileIconeWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "34px", height: "34px", borderRadius: tokens.borderRadiusCircular, flexShrink: 0,
    backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1,
  },
  iconTileLabel: { fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3, display: "block" },
  iconTileValor: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground1, fontWeight: tokens.fontWeightMedium, display: "block" },
  semCampos: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, padding: "8px 0" },

  linhaMapa: { marginTop: "20px", display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" },
  mapaCard: {
    borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden",
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    height: "220px",
    position: "relative",
  },
  mapaPill: {
    position: "absolute", top: "10px", left: "10px", zIndex: 1000,
    display: "flex", alignItems: "center", gap: "6px",
    padding: "5px 10px", borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightMedium,
    backgroundColor: "rgba(255,255,255,0.92)", color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow4,
  },
  mapaVazio: {
    height: "220px", borderRadius: tokens.borderRadiusXLarge, border: `1px dashed ${tokens.colorNeutralStroke2}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3, textAlign: "center", padding: "0 16px",
  },
});

export default function ObraHome({
  obra,
  infoFixa,
  camposAtivos,
  localizacao,
}: {
  obra: Obra;
  infoFixa: InfoFixa;
  camposAtivos: CampoAtivo[];
  localizacao: { lat: number; lon: number } | null;
}) {
  const classes = useStyles();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div className={classes.subtitulo} style={{ marginTop: 0 }}>
            {obra.cidade}/{obra.estado}
          </div>
          <div className={classes.badgesLinha}>
            <Badge appearance="tint" color={TIPO_COR[obra.tipo]} shape="rounded">
              {TIPO_LABEL[obra.tipo] ?? obra.tipo}
            </Badge>
            <Badge appearance="tint" color={ESCOPO_COR[obra.escopo]} shape="rounded">
              {ESCOPO_LABEL[obra.escopo] ?? obra.escopo}
            </Badge>
            <Badge appearance="tint" color={STATUS_COR[obra.status]} shape="rounded">
              {STATUS_LABEL[obra.status] ?? obra.status}
            </Badge>
          </div>
        </div>
        <Link href={`/painel/${obra.id}/atualizar-informacoes`}>
          <Button appearance="primary" icon={<Edit20Regular />}>
            Atualizar Informações
          </Button>
        </Link>
      </div>

      <div className={classes.linhaPrincipal}>
        <div className={classes.heroImagem}>
          {infoFixa.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={infoFixa.foto_url} alt={`Foto de ${obra.nome}`} className={classes.fotoImg} />
          ) : (
            <span className={classes.heroLegenda}>Sem foto ainda</span>
          )}
        </div>

        <div className={classes.cartaoDados}>
          <div className={classes.cabecalhoCartao}>
            <Text weight="semibold" size={300}>
              Informações Gerais
            </Text>
          </div>
          {camposAtivos.length === 0 ? (
            <div className={classes.semCampos}>
              Nenhum campo habilitado ainda pra essa obra. Peça pro admin habilitar em Configurações.
            </div>
          ) : (
            <div className={classes.gradeIconTiles}>
              {camposAtivos.map((c) => {
                const meta = CATALOGO_CAMPOS_GERAIS[c.campo_chave as CampoChave];
                if (!meta) return null;
                const Icone = meta.icone;
                return (
                  <div key={c.campo_chave} className={classes.iconTile}>
                    <div className={classes.iconTileIconeWrap}>
                      <Icone fontSize={18} />
                    </div>
                    <div>
                      <span className={classes.iconTileLabel}>{meta.label}</span>
                      <span className={classes.iconTileValor}>{c.valor || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={classes.linhaMapa}>
        {localizacao ? (
          <div className={classes.mapaCard}>
            <div className={classes.mapaPill}>
              <Location20Regular fontSize={14} />
              {obra.cidade}/{obra.estado}
            </div>
            <MapaObra lat={localizacao.lat} lon={localizacao.lon} />
          </div>
        ) : (
          <div className={classes.mapaVazio}>
            {infoFixa.endereco ? "Não foi possível localizar esse endereço no mapa." : "Sem endereço cadastrado ainda."}
          </div>
        )}
        <div />
      </div>
    </div>
  );
}
