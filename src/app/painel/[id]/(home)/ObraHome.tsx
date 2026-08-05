"use client";

import Link from "next/link";
import { makeStyles, tokens, Badge, Text } from "@fluentui/react-components";
import {
  Edit20Regular,
  ArrowTrending20Regular,
  DocumentBulletList20Regular,
  TaskListLtr20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import { TIPO_LABEL, ESCOPO_LABEL, STATUS_LABEL, TIPO_COR, ESCOPO_COR, STATUS_COR } from "@/lib/obraCatalogo";
import { CATALOGO_CAMPOS_GERAIS, type CampoChave } from "@/lib/obraCampoCatalogo";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import MapaObra from "@/components/MapaObra";

type Obra = { id: string; nome: string; tipo: string; escopo: string; status: string; cidade: string | null; estado: string | null };
type InfoFixa = { foto_url: string | null; endereco: string | null };
type CampoAtivo = { campo_chave: string; valor: string | null };

const useStyles = makeStyles({
  badgesLinha: { display: "flex", gap: "6px", marginTop: "4px" },

  linhaAcessoRapidoTopo: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "20px" },
  cartaoAcessoRapido: {
    display: "flex", alignItems: "center", gap: "12px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: "16px 18px",
    cursor: "pointer",
    textDecoration: "none",
    ":hover": { backgroundColor: tokens.colorNeutralBackground2 },
  },

  linhaPrincipal: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    // mapa empilhado na mesma coluna da foto, logo abaixo dela -- antes vivia
    // numa grade própria mais embaixo, e como o cartão "dados" ao lado é mais
    // alto que a foto, sobrava um vão vazio antes do mapa começar.
    gridTemplateAreas: '"foto dados" "mapa dados"',
    gap: "12px 20px",
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

  mapaCard: {
    gridArea: "mapa",
    borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden",
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    height: "220px",
    // padding própria (não é só estética): sem essa folga, o cartão de
    // localização que o próprio embed do Google desenha (ícone + "Abrir no
    // Maps") nasce colado no canto do iframe e o arredondamento deste
    // cartão (overflow:hidden) corta a ponta dele -- por isso ele aparecia
    // "quebrado em dois pedaços" (ícone cortado e o link solto embaixo).
    padding: "8px",
    boxSizing: "border-box",
    position: "relative",
  },
  mapaVazio: {
    gridArea: "mapa",
    height: "220px", borderRadius: tokens.borderRadiusXLarge, border: `1px dashed ${tokens.colorNeutralStroke2}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3, textAlign: "center", padding: "0 16px",
  },
});

export default function ObraHome({
  obra,
  infoFixa,
  camposAtivos,
  temRelatorio,
}: {
  obra: Obra;
  infoFixa: InfoFixa;
  camposAtivos: CampoAtivo[];
  temRelatorio: boolean;
}) {
  const classes = useStyles();
  const cidadeEstado = obra.cidade && obra.estado ? `${obra.cidade} - ${obra.estado}` : null;
  const cidadeEstadoLabel = obra.cidade && obra.estado ? `${obra.cidade}/${obra.estado}` : obra.cidade || obra.estado || "";
  const enderecoCompleto = [infoFixa.endereco, cidadeEstado, "Brasil"].filter(Boolean).join(", ");
  const temLocalizacao = Boolean(infoFixa.endereco || cidadeEstado);

  return (
    <div>
      <CabecalhoRelatorio obraNome={obra.nome} subtitulo={cidadeEstadoLabel} />
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

      <div className={classes.linhaAcessoRapidoTopo}>
        {temRelatorio ? (
          <Link href={`/painel/${obra.id}/dashboard`} className={classes.cartaoAcessoRapido}>
            <div className={classes.iconTileIconeWrap}>
              <ArrowTrending20Regular fontSize={18} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="medium" size={300} block>Dashboard</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Apresentar o relatório em reunião</Text>
            </div>
            <ChevronRight20Regular style={{ color: tokens.colorNeutralForeground3 }} />
          </Link>
        ) : (
          <div className={classes.cartaoAcessoRapido} style={{ cursor: "default" }}>
            <div className={classes.iconTileIconeWrap}>
              <ArrowTrending20Regular fontSize={18} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="medium" size={300} block>Dashboard</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Disponível após o primeiro relatório mensal</Text>
            </div>
          </div>
        )}

        <Link href={`/painel/${obra.id}/historico`} className={classes.cartaoAcessoRapido}>
          <div className={classes.iconTileIconeWrap}>
            <DocumentBulletList20Regular fontSize={18} />
          </div>
          <div style={{ flex: 1 }}>
            <Text weight="medium" size={300} block>Histórico de Relatórios</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Relatórios anteriores e em andamento</Text>
          </div>
          <ChevronRight20Regular style={{ color: tokens.colorNeutralForeground3 }} />
        </Link>

        <Link href={`/painel/${obra.id}/atualizar-informacoes`} className={classes.cartaoAcessoRapido}>
          <div className={classes.iconTileIconeWrap}>
            <Edit20Regular fontSize={18} />
          </div>
          <div style={{ flex: 1 }}>
            <Text weight="medium" size={300} block>Atualizar Informações</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Preencher dados do mês</Text>
          </div>
          <ChevronRight20Regular style={{ color: tokens.colorNeutralForeground3 }} />
        </Link>

        <div className={classes.cartaoAcessoRapido} style={{ cursor: "default" }}>
          <div className={classes.iconTileIconeWrap}>
            <TaskListLtr20Regular fontSize={18} />
          </div>
          <div style={{ flex: 1 }}>
            <Text weight="medium" size={300} block>Ações</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Em breve</Text>
          </div>
        </div>
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
                      <span className={classes.iconTileValor}>{c.valor || "-"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {temLocalizacao ? (
          <div className={classes.mapaCard}>
            <MapaObra endereco={enderecoCompleto} />
          </div>
        ) : (
          <div className={classes.mapaVazio}>Sem endereço cadastrado ainda.</div>
        )}
      </div>
    </div>
  );
}
