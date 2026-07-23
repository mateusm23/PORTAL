"use client";

import { useMemo, useState } from "react";
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  Input,
  Badge,
  Avatar,
  Switch,
  Divider,
  Text,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
  TabList,
  Tab,
  type SelectTabData,
  type SelectTabEvent,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemCheckbox,
  MenuDivider,
} from "@fluentui/react-components";
import {
  Search20Regular,
  BuildingMultiple20Regular,
  Person20Regular,
  Filter16Regular,
  FilterDismiss16Regular,
} from "@fluentui/react-icons";
import {
  TIPO_LABEL,
  ESCOPO_LABEL,
  STATUS_LABEL,
  TIPO_COR,
  ESCOPO_COR,
  STATUS_COR,
  type CorBadge,
} from "@/lib/obraCatalogo";
import { alternarAcesso, definirAcessosDoUsuario, definirAcessosDaObra, definirAdmin } from "./actions";

type Usuario = { id: string; nome: string | null; email: string; is_admin: boolean };
type Obra = {
  id: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
  tipo: string;
  escopo: string;
  status: string;
};
type Acesso = { usuario_id: string; obra_id: string };
type Modo = "usuario" | "obra";

const COR_CABECALHO = "#0e3244";
const COR_CABECALHO_HOVER = "#154a63";
const COR_CABECALHO_TEXTO = "#eef4f7";
const COR_ZEBRA = "#eceef1";
const COR_BORDA = "#d7dee6";
const COR_BORDA_CABECALHO = "rgba(255,255,255,0.15)";

function chave(usuarioId: string, obraId: string) {
  return `${usuarioId}::${obraId}`;
}

const useStyles = makeStyles({
  tituloWrap: { marginBottom: "16px" },
  titulo: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  subtitulo: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    marginTop: "4px",
  },
  abas: { marginBottom: "18px" },
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  cartao: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: "hidden",
  },
  painelEsquerdoTopo: { padding: "14px 14px 10px 14px" },
  filtrosEsquerda: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },
  listaRolavel: {
    maxHeight: "560px",
    overflowY: "auto",
    padding: "0 8px 10px 8px",
  },
  itemLista: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    borderLeft: "3px solid transparent",
    ":hover": { backgroundColor: tokens.colorNeutralBackground3 },
  },
  itemListaAtivo: {
    backgroundColor: tokens.colorBrandBackground2,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
    ":hover": { backgroundColor: tokens.colorBrandBackground2 },
  },
  itemTextos: { flex: 1, minWidth: 0 },
  itemTitulo: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemSubtitulo: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemContagem: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  semResultado: {
    padding: "18px 10px",
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },
  cabecalhoDireita: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 18px",
  },
  cabecalhoTextos: { flex: 1, minWidth: 0 },
  contadorTexto: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: "nowrap",
  },
  badgesLinha: { display: "flex", gap: "6px", marginTop: "4px" },
  linhaAdmin: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
  },
  toolbarDireita: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    padding: "0 18px 14px 18px",
  },
  corpoRolavel: { maxHeight: "480px", overflowY: "auto" },
  rodapeAcoes: {
    display: "flex",
    gap: "10px",
    padding: "14px 18px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  cabecalhoCelula: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px",
    width: "100%",
  },
  cabecalhoTexto: {
    color: COR_CABECALHO_TEXTO,
    fontWeight: tokens.fontWeightSemibold,
  },
  botaoFiltroInativo: {
    color: COR_CABECALHO_TEXTO,
    backgroundColor: "rgba(255,255,255,0.08)",
    ":hover": {
      backgroundColor: COR_CABECALHO_HOVER,
      color: COR_CABECALHO_TEXTO,
    },
  },
});

/* ---------- botão de filtro no cabeçalho da coluna (mesmo padrão do Cadastro de Obras) ---------- */

function FiltroColuna({
  label,
  valoresUnicos,
  selecionados,
  onChange,
  escuro,
  comTexto,
}: {
  label: string;
  valoresUnicos: string[];
  selecionados: Set<string>;
  onChange: (novo: Set<string>) => void;
  escuro?: boolean;
  comTexto?: boolean;
}) {
  const classes = useStyles();
  const temSelecao = selecionados.size > 0;

  return (
    <Menu
      checkedValues={{ valor: Array.from(selecionados) }}
      onCheckedValueChange={(_e, data) => onChange(new Set(data.checkedItems))}
    >
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance={temSelecao ? "primary" : "subtle"}
          className={temSelecao ? undefined : escuro ? classes.botaoFiltroInativo : undefined}
          icon={<Filter16Regular />}
          size="small"
          shape={comTexto ? "rounded" : "circular"}
          title={`Filtrar ${label}`}
        >
          {comTexto ? (temSelecao ? `${label} (${selecionados.size})` : label) : undefined}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {valoresUnicos.map((valor) => (
            <MenuItemCheckbox key={valor} name="valor" value={valor}>
              {valor}
            </MenuItemCheckbox>
          ))}
          <MenuDivider />
          <MenuItem icon={<FilterDismiss16Regular />} onClick={() => onChange(new Set())}>
            Limpar filtro
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

function CabecalhoComFiltro({
  label,
  valoresUnicos,
  selecionados,
  onChange,
}: {
  label: string;
  valoresUnicos: string[];
  selecionados: Set<string>;
  onChange: (novo: Set<string>) => void;
}) {
  const classes = useStyles();
  return (
    <div className={classes.cabecalhoCelula}>
      <span className={classes.cabecalhoTexto}>{label}</span>
      <FiltroColuna label={label} valoresUnicos={valoresUnicos} selecionados={selecionados} onChange={onChange} escuro />
    </div>
  );
}

function BadgeCatalogo({ valor, labelMap, corMap }: { valor: string; labelMap: Record<string, string>; corMap: Record<string, CorBadge> }) {
  return (
    <Badge appearance="tint" color={corMap[valor]} shape="rounded" size="small">
      {labelMap[valor] ?? valor}
    </Badge>
  );
}

function LinhaEsquerda({
  ativo,
  onClick,
  media,
  titulo,
  subtitulo,
  contagemTexto,
  admin,
}: {
  ativo: boolean;
  onClick: () => void;
  media: React.ReactNode;
  titulo: string;
  subtitulo: string;
  contagemTexto: string;
  admin?: boolean;
}) {
  const classes = useStyles();
  return (
    <div
      className={`${classes.itemLista} ${ativo ? classes.itemListaAtivo : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      {media}
      <div className={classes.itemTextos}>
        <div className={classes.itemTitulo}>
          {titulo} {admin && <Badge appearance="tint" color="important" size="small">Admin</Badge>}
        </div>
        {subtitulo ? <div className={classes.itemSubtitulo}>{subtitulo}</div> : null}
      </div>
      <span className={classes.itemContagem}>{contagemTexto}</span>
    </div>
  );
}

export default function AcessosPainel({
  usuarios,
  obras,
  acessosIniciais,
  usuarioLogadoId,
}: {
  usuarios: Usuario[];
  obras: Obra[];
  acessosIniciais: Acesso[];
  usuarioLogadoId: string;
}) {
  const classes = useStyles();
  const toasterId = useId("toaster-acessos");
  const { dispatchToast } = useToastController(toasterId);

  const [modo, setModo] = useState<Modo>("usuario");
  const [acessos, setAcessos] = useState<Set<string>>(
    () => new Set(acessosIniciais.map((a) => chave(a.usuario_id, a.obra_id))),
  );
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string | undefined>(usuarios[0]?.id);
  const [obraSelecionadaId, setObraSelecionadaId] = useState<string | undefined>(obras[0]?.id);
  const [buscaEsquerda, setBuscaEsquerda] = useState("");
  const [buscaDireita, setBuscaDireita] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<Set<string>>(new Set());
  const [filtroEscopo, setFiltroEscopo] = useState<Set<string>>(new Set());
  const [filtroStatus, setFiltroStatus] = useState<Set<string>>(new Set());
  const [pendentes, setPendentes] = useState<Set<string>>(new Set());
  const [pendenteEmMassa, setPendenteEmMassa] = useState(false);
  const [admins, setAdmins] = useState<Set<string>>(
    () => new Set(usuarios.filter((u) => u.is_admin).map((u) => u.id)),
  );
  const [pendenteAdmin, setPendenteAdmin] = useState(false);

  function temAcesso(usuarioId: string, obraId: string) {
    return acessos.has(chave(usuarioId, obraId));
  }
  function contarObrasDoUsuario(usuarioId: string) {
    return obras.filter((o) => temAcesso(usuarioId, o.id)).length;
  }
  function contarUsuariosDaObra(obraId: string) {
    return usuarios.filter((u) => temAcesso(u.id, obraId)).length;
  }

  // switch controlado pelo estado real (nunca muda antes do servidor confirmar) —
  // se a chamada falhar, a tela não fica dessincronizada do banco
  async function alternar(usuarioId: string, obraId: string, novoValor: boolean) {
    const k = chave(usuarioId, obraId);
    setPendentes((atual) => new Set(atual).add(k));
    const resultado = await alternarAcesso(usuarioId, obraId, novoValor);
    setPendentes((atual) => {
      const novo = new Set(atual);
      novo.delete(k);
      return novo;
    });

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível atualizar o acesso agora. Nada foi alterado — tente de novo.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setAcessos((atual) => {
      const novo = new Set(atual);
      if (novoValor) novo.add(k);
      else novo.delete(k);
      return novo;
    });
    const obra = obras.find((o) => o.id === obraId);
    const usuario = usuarios.find((u) => u.id === usuarioId);
    dispatchToast(
      <Toast>
        <ToastTitle>
          {novoValor
            ? `Acesso liberado: ${usuario?.nome || usuario?.email} → ${obra?.nome}.`
            : `Acesso revogado: ${usuario?.nome || usuario?.email} → ${obra?.nome}.`}
        </ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  // promove/rebaixa administrador — nunca deixa mexer no próprio usuário logado,
  // pra evitar alguém se rebaixar por engano e ficar sem acesso à própria tela
  async function alternarAdmin(usuarioId: string, novoValor: boolean) {
    if (usuarioId === usuarioLogadoId) return;
    setPendenteAdmin(true);
    const resultado = await definirAdmin(usuarioId, novoValor);
    setPendenteAdmin(false);

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível atualizar o papel de administrador.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setAdmins((atual) => {
      const novo = new Set(atual);
      if (novoValor) novo.add(usuarioId);
      else novo.delete(usuarioId);
      return novo;
    });
    const usuario = usuarios.find((u) => u.id === usuarioId);
    dispatchToast(
      <Toast>
        <ToastTitle>
          {novoValor
            ? `${usuario?.nome || usuario?.email} agora é administrador.`
            : `${usuario?.nome || usuario?.email} não é mais administrador.`}
        </ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  // ação em massa: uma única chamada — ou aplica tudo, ou nada muda
  async function alternarEmMassa(idsVariaveis: string[], conceder: boolean) {
    if (idsVariaveis.length === 0) return;
    setPendenteEmMassa(true);
    const resultado =
      modo === "usuario"
        ? await definirAcessosDoUsuario(usuarioSelecionadoId!, idsVariaveis, conceder)
        : await definirAcessosDaObra(obraSelecionadaId!, idsVariaveis, conceder);
    setPendenteEmMassa(false);

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Falha ao aplicar em massa — nenhum acesso foi alterado.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setAcessos((atual) => {
      const novo = new Set(atual);
      idsVariaveis.forEach((idVariavel) => {
        const k = modo === "usuario" ? chave(usuarioSelecionadoId!, idVariavel) : chave(idVariavel, obraSelecionadaId!);
        if (conceder) novo.add(k);
        else novo.delete(k);
      });
      return novo;
    });
    dispatchToast(
      <Toast>
        <ToastTitle>
          {idsVariaveis.length} acesso(s) {conceder ? "liberado(s)" : "revogado(s)"} em massa.
        </ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  const usuariosFiltradosEsquerda = useMemo(() => {
    const b = buscaEsquerda.trim().toLowerCase();
    return usuarios.filter((u) => !b || (u.nome ?? "").toLowerCase().includes(b) || u.email.toLowerCase().includes(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaEsquerda, usuarios]);

  // a lista de obras só aparece num painel por vez (esquerda no modo "obra",
  // direita no modo "usuario") — os filtros de Tipo/Escopo/Status são os mesmos
  // nos dois casos, só muda qual busca de texto vale em cada momento
  function buscaAtivaObras() {
    return modo === "obra" ? buscaEsquerda : buscaDireita;
  }

  function passaFiltroObra(o: Obra, ignorar: "tipo" | "escopo" | "status" | null) {
    const b = buscaAtivaObras().trim().toLowerCase();
    const cidadeEstado = [o.cidade, o.estado].filter(Boolean).join(", ");
    if (b && !o.nome.toLowerCase().includes(b) && !cidadeEstado.toLowerCase().includes(b)) return false;
    if (ignorar !== "tipo" && filtroTipo.size > 0 && !filtroTipo.has(o.tipo)) return false;
    if (ignorar !== "escopo" && filtroEscopo.size > 0 && !filtroEscopo.has(o.escopo)) return false;
    if (ignorar !== "status" && filtroStatus.size > 0 && !filtroStatus.has(o.status)) return false;
    return true;
  }

  // valores únicos considerando os OUTROS filtros já aplicados (cascata: filtrou
  // Tipo, ao abrir Escopo só aparecem escopos que ainda existem no resultado)
  function valoresUnicosObra(campo: "tipo" | "escopo" | "status") {
    const base = obras.filter((o) => passaFiltroObra(o, campo));
    return Array.from(new Set(base.map((o) => o[campo]))).filter(Boolean);
  }

  function filtroPorLabel(
    campo: "tipo" | "escopo" | "status",
    labelMap: Record<string, string>,
    selecionadosSet: Set<string>,
    definirSelecionados: (novo: Set<string>) => void,
  ) {
    const reverso = Object.fromEntries(Object.entries(labelMap).map(([k, v]) => [v, k]));
    return {
      valoresUnicos: valoresUnicosObra(campo)
        .map((v) => labelMap[v] ?? v)
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
      selecionados: new Set(Array.from(selecionadosSet).map((v) => labelMap[v] ?? v)),
      onChange: (novoLabelSet: Set<string>) =>
        definirSelecionados(new Set(Array.from(novoLabelSet).map((label) => reverso[label] ?? label))),
    };
  }

  const obrasFiltradasEsquerda = useMemo(
    () => obras.filter((o) => passaFiltroObra(o, null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [obras, buscaEsquerda, modo, filtroTipo, filtroEscopo, filtroStatus],
  );

  const obrasFiltradasDireita = useMemo(
    () => obras.filter((o) => passaFiltroObra(o, null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [obras, buscaDireita, modo, filtroTipo, filtroEscopo, filtroStatus],
  );

  const usuariosFiltradosDireita = useMemo(() => {
    const b = buscaDireita.trim().toLowerCase();
    return usuarios.filter((u) => !b || (u.nome ?? "").toLowerCase().includes(b) || u.email.toLowerCase().includes(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaDireita, usuarios]);

  const idsVisiveis =
    modo === "usuario" ? obrasFiltradasDireita.map((o) => o.id) : usuariosFiltradosDireita.map((u) => u.id);
  const chavesVisiveis =
    modo === "usuario"
      ? obrasFiltradasDireita.map((o) => chave(usuarioSelecionadoId ?? "", o.id))
      : usuariosFiltradosDireita.map((u) => chave(u.id, obraSelecionadaId ?? ""));
  const faltantes = chavesVisiveis
    .map((k, i) => ({ k, id: idsVisiveis[i] }))
    .filter(({ k }) => !acessos.has(k))
    .map(({ id }) => id);
  const presentes = chavesVisiveis
    .map((k, i) => ({ k, id: idsVisiveis[i] }))
    .filter(({ k }) => acessos.has(k))
    .map(({ id }) => id);

  const usuarioAtual = usuarios.find((u) => u.id === usuarioSelecionadoId);
  const obraAtual = obras.find((o) => o.id === obraSelecionadaId);

  if (usuarios.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum usuário cadastrado ainda.</p>;
  }
  if (obras.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma obra cadastrada ainda.</p>;
  }

  return (
    <div>
      <Toaster toasterId={toasterId} />

      <div className={classes.tituloWrap}>
        <h1 className={classes.titulo}>Acessos · Usuários × Obras</h1>
        <div className={classes.subtitulo}>Controla quais obras cada usuário pode ver e editar.</div>
      </div>

      <TabList
        className={classes.abas}
        selectedValue={modo}
        onTabSelect={(_e: SelectTabEvent, data: SelectTabData) => setModo(data.value as Modo)}
      >
        <Tab value="usuario" icon={<Person20Regular />}>
          Por usuário
        </Tab>
        <Tab value="obra" icon={<BuildingMultiple20Regular />}>
          Por obra
        </Tab>
      </TabList>

      <div className={classes.layout}>
        {/* ---- coluna esquerda ---- */}
        <div className={classes.cartao}>
          <div className={classes.painelEsquerdoTopo}>
            <Input
              placeholder={modo === "usuario" ? "Buscar usuário..." : "Buscar obra..."}
              contentBefore={<Search20Regular />}
              value={buscaEsquerda}
              onChange={(_e, data) => setBuscaEsquerda(data.value)}
              style={{ width: "100%" }}
            />
            {modo === "obra" && (
              <div className={classes.filtrosEsquerda}>
                <FiltroColuna label="Tipo" comTexto {...filtroPorLabel("tipo", TIPO_LABEL, filtroTipo, setFiltroTipo)} />
                <FiltroColuna
                  label="Escopo"
                  comTexto
                  {...filtroPorLabel("escopo", ESCOPO_LABEL, filtroEscopo, setFiltroEscopo)}
                />
                <FiltroColuna
                  label="Status"
                  comTexto
                  {...filtroPorLabel("status", STATUS_LABEL, filtroStatus, setFiltroStatus)}
                />
              </div>
            )}
          </div>
          <div className={classes.listaRolavel}>
            {modo === "usuario"
              ? usuariosFiltradosEsquerda.length === 0
                ? <div className={classes.semResultado}>Nenhum usuário encontrado.</div>
                : usuariosFiltradosEsquerda.map((u) => (
                    <LinhaEsquerda
                      key={u.id}
                      ativo={u.id === usuarioSelecionadoId}
                      onClick={() => setUsuarioSelecionadoId(u.id)}
                      media={<Avatar name={u.nome || u.email} size={32} color="colorful" />}
                      titulo={u.nome || u.email}
                      subtitulo={u.email}
                      contagemTexto={`${contarObrasDoUsuario(u.id)} obras`}
                      admin={admins.has(u.id)}
                    />
                  ))
              : obrasFiltradasEsquerda.length === 0
                ? <div className={classes.semResultado}>Nenhuma obra encontrada.</div>
                : obrasFiltradasEsquerda.map((o) => (
                    <LinhaEsquerda
                      key={o.id}
                      ativo={o.id === obraSelecionadaId}
                      onClick={() => setObraSelecionadaId(o.id)}
                      media={<BuildingMultiple20Regular style={{ fontSize: 24, color: tokens.colorNeutralForeground3, flexShrink: 0 }} />}
                      titulo={o.nome}
                      subtitulo={[o.cidade, o.estado].filter(Boolean).join(", ")}
                      contagemTexto={`${contarUsuariosDaObra(o.id)} usuários`}
                    />
                  ))}
          </div>
        </div>

        {/* ---- coluna direita ---- */}
        <div className={classes.cartao}>
          <div className={classes.cabecalhoDireita}>
            {modo === "usuario" ? (
              <Avatar name={usuarioAtual?.nome || usuarioAtual?.email} size={40} color="colorful" />
            ) : (
              <BuildingMultiple20Regular style={{ fontSize: 32, color: tokens.colorNeutralForeground3 }} />
            )}
            <div className={classes.cabecalhoTextos}>
              {modo === "usuario" ? (
                <>
                  <Text weight="semibold" size={400} block>
                    {usuarioAtual?.nome || usuarioAtual?.email}
                  </Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    {usuarioAtual?.email}
                  </Text>
                  {usuarioAtual && (
                    <div className={classes.linhaAdmin}>
                      <Switch
                        label="Administrador"
                        checked={admins.has(usuarioAtual.id)}
                        disabled={usuarioAtual.id === usuarioLogadoId || pendenteAdmin}
                        onChange={(_e, data) => alternarAdmin(usuarioAtual.id, data.checked)}
                      />
                      {usuarioAtual.id === usuarioLogadoId && (
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                          (você não pode alterar seu próprio papel)
                        </Text>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Text weight="semibold" size={400} block>
                    {obraAtual?.nome}
                  </Text>
                  {obraAtual && (
                    <div className={classes.badgesLinha}>
                      <BadgeCatalogo valor={obraAtual.tipo} labelMap={TIPO_LABEL} corMap={TIPO_COR} />
                      <BadgeCatalogo valor={obraAtual.escopo} labelMap={ESCOPO_LABEL} corMap={ESCOPO_COR} />
                      <BadgeCatalogo valor={obraAtual.status} labelMap={STATUS_LABEL} corMap={STATUS_COR} />
                    </div>
                  )}
                </>
              )}
            </div>
            <span className={classes.contadorTexto}>
              {modo === "usuario"
                ? `${contarObrasDoUsuario(usuarioSelecionadoId ?? "")} de ${obras.length} obras liberadas`
                : `${contarUsuariosDaObra(obraSelecionadaId ?? "")} de ${usuarios.length} usuários com acesso`}
            </span>
          </div>

          <Divider />

          <div className={classes.toolbarDireita}>
            <Input
              placeholder={modo === "usuario" ? "Buscar obra na lista..." : "Buscar usuário na lista..."}
              contentBefore={<Search20Regular />}
              value={buscaDireita}
              onChange={(_e, data) => setBuscaDireita(data.value)}
              style={{ width: 260 }}
            />
          </div>

          <div className={classes.corpoRolavel}>
            <Table aria-label="Tabela de acessos" size="medium">
              <TableHeader>
                {modo === "usuario" ? (
                  <TableRow style={{ backgroundColor: COR_CABECALHO }}>
                    <TableHeaderCell
                      style={{ backgroundColor: COR_CABECALHO, color: COR_CABECALHO_TEXTO, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}
                    >
                      Obra
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, width: 190, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}>
                      <CabecalhoComFiltro label="Tipo" {...filtroPorLabel("tipo", TIPO_LABEL, filtroTipo, setFiltroTipo)} />
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, width: 170, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}>
                      <CabecalhoComFiltro label="Escopo" {...filtroPorLabel("escopo", ESCOPO_LABEL, filtroEscopo, setFiltroEscopo)} />
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, width: 150, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}>
                      <CabecalhoComFiltro label="Status" {...filtroPorLabel("status", STATUS_LABEL, filtroStatus, setFiltroStatus)} />
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, color: COR_CABECALHO_TEXTO, width: 110, position: "sticky", top: 0, zIndex: 1 }}>
                      Acesso
                    </TableHeaderCell>
                  </TableRow>
                ) : (
                  <TableRow style={{ backgroundColor: COR_CABECALHO }}>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, color: COR_CABECALHO_TEXTO, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}>
                      Usuário
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, color: COR_CABECALHO_TEXTO, position: "sticky", top: 0, zIndex: 1, borderRight: `1px solid ${COR_BORDA_CABECALHO}` }}>
                      Email
                    </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: COR_CABECALHO, color: COR_CABECALHO_TEXTO, width: 110, position: "sticky", top: 0, zIndex: 1 }}>
                      Acesso
                    </TableHeaderCell>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {modo === "usuario"
                  ? obrasFiltradasDireita.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} style={{ textAlign: "center", color: tokens.colorNeutralForeground3, padding: 24 }}>
                            Nenhuma obra encontrada com esses filtros.
                          </TableCell>
                        </TableRow>
                      )
                    : obrasFiltradasDireita.map((o, indice) => {
                        const k = chave(usuarioSelecionadoId ?? "", o.id);
                        return (
                          <TableRow key={o.id} style={{ backgroundColor: indice % 2 === 1 ? COR_ZEBRA : undefined }}>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
                              {o.nome} · {[o.cidade, o.estado].filter(Boolean).join("/")}
                            </TableCell>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
                              <BadgeCatalogo valor={o.tipo} labelMap={TIPO_LABEL} corMap={TIPO_COR} />
                            </TableCell>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
                              <BadgeCatalogo valor={o.escopo} labelMap={ESCOPO_LABEL} corMap={ESCOPO_COR} />
                            </TableCell>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
                              <BadgeCatalogo valor={o.status} labelMap={STATUS_LABEL} corMap={STATUS_COR} />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={temAcesso(usuarioSelecionadoId ?? "", o.id)}
                                disabled={pendentes.has(k) || pendenteEmMassa}
                                onChange={(_e, data) => alternar(usuarioSelecionadoId ?? "", o.id, data.checked)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  : usuariosFiltradosDireita.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={3} style={{ textAlign: "center", color: tokens.colorNeutralForeground3, padding: 24 }}>
                            Nenhum usuário encontrado.
                          </TableCell>
                        </TableRow>
                      )
                    : usuariosFiltradosDireita.map((u, indice) => {
                        const k = chave(u.id, obraSelecionadaId ?? "");
                        return (
                          <TableRow key={u.id} style={{ backgroundColor: indice % 2 === 1 ? COR_ZEBRA : undefined }}>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>{u.nome || u.email}</TableCell>
                            <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>{u.email}</TableCell>
                            <TableCell>
                              <Switch
                                checked={temAcesso(u.id, obraSelecionadaId ?? "")}
                                disabled={pendentes.has(k) || pendenteEmMassa}
                                onChange={(_e, data) => alternar(u.id, obraSelecionadaId ?? "", data.checked)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
              </TableBody>
            </Table>
          </div>

          <div className={classes.rodapeAcoes}>
            <Button
              appearance="primary"
              disabled={faltantes.length === 0 || pendenteEmMassa}
              onClick={() => alternarEmMassa(faltantes, true)}
            >
              Marcar todos os visíveis ({faltantes.length})
            </Button>
            <Button
              appearance="secondary"
              disabled={presentes.length === 0 || pendenteEmMassa}
              onClick={() => alternarEmMassa(presentes, false)}
            >
              Desmarcar todos os visíveis ({presentes.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
