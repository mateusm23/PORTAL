"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Button,
  Input,
  Badge,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemCheckbox,
  MenuDivider,
  Tooltip,
  Toaster,
  Toast,
  ToastTitle,
  useToastController,
  useId,
} from "@fluentui/react-components";
import {
  Search20Regular,
  Filter16Regular,
  FilterDismiss16Regular,
  ChevronUp16Regular,
  ChevronDown16Regular,
  ArrowSort16Regular,
  Edit16Regular,
  BuildingMultiple20Regular,
} from "@fluentui/react-icons";
import { atualizarCampoObra } from "./actions";
import { TIPO_LABEL, ESCOPO_LABEL, STATUS_LABEL, TIPO_COR, ESCOPO_COR, STATUS_COR, type CorBadge } from "@/lib/obraCatalogo";

type Obra = {
  id: string;
  nome: string;
  tipo: string;
  escopo: string;
  status: string;
  cidade: string | null;
  estado: string | null;
};

type ColunaFiltro = "nome" | "cidade" | "tipo" | "escopo" | "status";
type Ordenacao = { coluna: ColunaFiltro | null; direcao: "asc" | "desc" };

const COR_CABECALHO = "#0e3244";
const COR_CABECALHO_HOVER = "#154a63";
const COR_CABECALHO_TEXTO = "#eef4f7";
const COR_ZEBRA = "#eceef1";
const COR_HOVER_LINHA = "#eaf2fc";
const COR_BORDA = "#d7dee6";
const COR_BORDA_CABECALHO = "rgba(255,255,255,0.15)";

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  contador: {
    marginLeft: "auto",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  cartao: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: "hidden",
  },
  corpoRolavel: {
    maxHeight: "560px",
    overflowY: "auto",
  },
  cabecalhoCelula: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px",
    width: "100%",
  },
  botaoOrdenar: {
    color: COR_CABECALHO_TEXTO,
    ":hover": {
      backgroundColor: COR_CABECALHO_HOVER,
      color: COR_CABECALHO_TEXTO,
    },
  },
  botaoFiltroInativo: {
    color: COR_CABECALHO_TEXTO,
    backgroundColor: "rgba(255,255,255,0.08)",
    ":hover": {
      backgroundColor: COR_CABECALHO_HOVER,
      color: COR_CABECALHO_TEXTO,
    },
  },
  filtroLista: {
    maxHeight: "220px",
    overflowY: "auto",
  },
});

/* ---------- popup de filtro por coluna ---------- */

function FiltroColuna({
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
  const temSelecao = selecionados.size > 0;

  return (
    <Menu
      checkedValues={{ valor: Array.from(selecionados) }}
      onCheckedValueChange={(_e, data) => onChange(new Set(data.checkedItems))}
    >
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance={temSelecao ? "primary" : "subtle"}
          className={temSelecao ? undefined : classes.botaoFiltroInativo}
          icon={<Filter16Regular />}
          size="small"
          shape="circular"
          title={`Filtrar ${label}`}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <div className={classes.filtroLista}>
            {valoresUnicos.map((valor) => (
              <MenuItemCheckbox key={valor} name="valor" value={valor}>
                {valor}
              </MenuItemCheckbox>
            ))}
          </div>
          <MenuDivider />
          <MenuItem icon={<FilterDismiss16Regular />} onClick={() => onChange(new Set())}>
            Limpar filtro
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

/* ---------- cabeçalho com ordenação + filtro ---------- */

function CabecalhoOrdenavel({
  label,
  coluna,
  ordenacao,
  aoOrdenar,
  valoresUnicos,
  selecionados,
  onChange,
}: {
  label: string;
  coluna: ColunaFiltro;
  ordenacao: Ordenacao;
  aoOrdenar: (coluna: ColunaFiltro) => void;
  valoresUnicos: string[];
  selecionados: Set<string>;
  onChange: (novo: Set<string>) => void;
}) {
  const classes = useStyles();
  const ativo = ordenacao.coluna === coluna;
  const Icone = !ativo ? ArrowSort16Regular : ordenacao.direcao === "asc" ? ChevronUp16Regular : ChevronDown16Regular;

  return (
    <div className={classes.cabecalhoCelula}>
      <Button
        appearance="transparent"
        className={classes.botaoOrdenar}
        size="small"
        onClick={() => aoOrdenar(coluna)}
        icon={<Icone />}
        iconPosition="after"
      >
        {label}
      </Button>
      <FiltroColuna label={label} valoresUnicos={valoresUnicos} selecionados={selecionados} onChange={onChange} />
    </div>
  );
}

/* ---------- badge com menu de reclassificação rápida ---------- */

function BadgeReclassificar({
  valor,
  opcoes,
  cores,
  onTrocar,
}: {
  valor: string;
  opcoes: Record<string, string>;
  cores: Record<string, CorBadge>;
  onTrocar: (novo: string) => void;
}) {
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Badge appearance="tint" color={cores[valor]} shape="rounded" size="medium" style={{ cursor: "pointer" }}>
          {opcoes[valor]}
        </Badge>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {Object.entries(opcoes).map(([chave, texto]) => (
            <MenuItem key={chave} onClick={() => onTrocar(chave)}>
              {texto}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

/* ---------- linha da tabela (zebra + hover controlados por estado, sem conflito de CSS) ---------- */

function LinhaObra({
  linha,
  indice,
  onTrocarCampo,
}: {
  linha: Obra & { cidadeEstado: string };
  indice: number;
  onTrocarCampo: (id: string, campo: "tipo" | "escopo" | "status", valor: string) => void;
}) {
  const [sobre, setSobre] = useState(false);
  const corFundo = sobre ? COR_HOVER_LINHA : indice % 2 === 1 ? COR_ZEBRA : undefined;

  return (
    <TableRow
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
      style={{ backgroundColor: corFundo, transition: "background-color 0.15s ease" }}
    >
      <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
        <TableCellLayout media={<BuildingMultiple20Regular />}>{linha.nome}</TableCellLayout>
      </TableCell>
      <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>{linha.cidadeEstado}</TableCell>
      <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
        <BadgeReclassificar
          valor={linha.tipo}
          opcoes={TIPO_LABEL}
          cores={TIPO_COR}
          onTrocar={(novo) => onTrocarCampo(linha.id, "tipo", novo)}
        />
      </TableCell>
      <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
        <BadgeReclassificar
          valor={linha.escopo}
          opcoes={ESCOPO_LABEL}
          cores={ESCOPO_COR}
          onTrocar={(novo) => onTrocarCampo(linha.id, "escopo", novo)}
        />
      </TableCell>
      <TableCell style={{ borderRight: `1px solid ${COR_BORDA}` }}>
        <BadgeReclassificar
          valor={linha.status}
          opcoes={STATUS_LABEL}
          cores={STATUS_COR}
          onTrocar={(novo) => onTrocarCampo(linha.id, "status", novo)}
        />
      </TableCell>
      <TableCell>
        <Tooltip content="Editar obra" relationship="label">
          <Link href={`/configuracoes/cadastros/obras/${linha.id}`}>
            <Button appearance="subtle" icon={<Edit16Regular />} shape="circular" size="small" />
          </Link>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

/* ---------- grid principal ---------- */

export default function ObrasGrid({ obras }: { obras: Obra[] }) {
  const classes = useStyles();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toasterId = useId("toaster-obras");
  const { dispatchToast } = useToastController(toasterId);
  const [, startTransition] = useTransition();

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({ coluna: null, direcao: "asc" });
  const [selecionados, setSelecionados] = useState<Record<ColunaFiltro, Set<string>>>({
    nome: new Set(),
    cidade: new Set(),
    tipo: new Set(),
    escopo: new Set(),
    status: new Set(),
  });

  useEffect(() => {
    const sucesso = searchParams.get("sucesso");
    const mensagem =
      sucesso === "criada" ? "Obra criada com sucesso." : sucesso === "atualizada" ? "Alterações salvas." : null;
    if (mensagem) {
      dispatchToast(
        <Toast>
          <ToastTitle>{mensagem}</ToastTitle>
        </Toast>,
        { intent: "success" },
      );
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, router]);

  const linhas = useMemo(
    () => obras.map((o) => ({ ...o, cidadeEstado: [o.cidade, o.estado].filter(Boolean).join(", ") })),
    [obras],
  );

  function aoMudarFiltro(chave: ColunaFiltro, novo: Set<string>) {
    setSelecionados((atual) => ({ ...atual, [chave]: novo }));
  }

  // testa uma linha contra todos os filtros ativos, exceto o da coluna "ignorar"
  // (permite calcular quais opções ainda fazem sentido mostrar em cada filtro)
  function passaFiltro(l: (typeof linhas)[number], ignorar: ColunaFiltro | null) {
    const buscaLower = busca.trim().toLowerCase();
    if (buscaLower && !l.nome.toLowerCase().includes(buscaLower) && !l.cidadeEstado.toLowerCase().includes(buscaLower)) {
      return false;
    }
    if (ignorar !== "nome" && selecionados.nome.size > 0 && !selecionados.nome.has(l.nome)) return false;
    if (ignorar !== "cidade" && selecionados.cidade.size > 0 && !selecionados.cidade.has(l.cidade ?? "")) return false;
    if (ignorar !== "tipo" && selecionados.tipo.size > 0 && !selecionados.tipo.has(l.tipo)) return false;
    if (ignorar !== "escopo" && selecionados.escopo.size > 0 && !selecionados.escopo.has(l.escopo)) return false;
    if (ignorar !== "status" && selecionados.status.size > 0 && !selecionados.status.has(l.status)) return false;
    return true;
  }

  // valores únicos considerando os OUTROS filtros já aplicados (filtro em cascata,
  // igual Excel: filtrou Tipo, ao abrir Escopo só aparecem escopos que ainda existem)
  function valoresUnicos(chave: ColunaFiltro, mapaLabel?: Record<string, string>) {
    const base = linhas.filter((l) => passaFiltro(l, chave));
    const brutos = Array.from(new Set(base.map((d) => (chave === "cidade" ? d.cidade ?? "" : (d as Record<string, string>)[chave])))).filter(
      Boolean,
    );
    if (mapaLabel) return brutos.map((v) => mapaLabel[v] ?? v).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return brutos.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  // pontes entre rótulo (mostrado no menu) e código salvo, para tipo/escopo/status
  function filtroPorLabel(chave: ColunaFiltro, labelMap: Record<string, string>) {
    const reverso = Object.fromEntries(Object.entries(labelMap).map(([k, v]) => [v, k]));
    return {
      valoresUnicos: valoresUnicos(chave, labelMap),
      selecionados: new Set(Array.from(selecionados[chave]).map((v) => labelMap[v] ?? v)),
      onChange: (novo: Set<string>) =>
        aoMudarFiltro(chave, new Set(Array.from(novo).map((label) => reverso[label] ?? label))),
    };
  }

  function aoOrdenar(coluna: ColunaFiltro) {
    setOrdenacao((atual) => {
      if (atual.coluna !== coluna) return { coluna, direcao: "asc" };
      if (atual.direcao === "asc") return { coluna, direcao: "desc" };
      return { coluna: null, direcao: "asc" };
    });
  }

  function trocarCampo(id: string, campo: "tipo" | "escopo" | "status", novoValor: string) {
    startTransition(async () => {
      await atualizarCampoObra(id, campo, novoValor);
      router.refresh();
    });
    const rotulos = { tipo: "Tipo", escopo: "Escopo", status: "Status" } as const;
    dispatchToast(
      <Toast>
        <ToastTitle>{rotulos[campo]} atualizado.</ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  const linhasFiltradas = useMemo(() => {
    let resultado = linhas.filter((l) => passaFiltro(l, null));
    if (ordenacao.coluna) {
      const coluna = ordenacao.coluna;
      resultado = [...resultado].sort((a, b) => {
        const va = String((a as Record<string, unknown>)[coluna] ?? "");
        const vb = String((b as Record<string, unknown>)[coluna] ?? "");
        const comparado = va.localeCompare(vb, "pt-BR");
        return ordenacao.direcao === "asc" ? comparado : -comparado;
      });
    }
    return resultado;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhas, busca, selecionados, ordenacao]);

  return (
    <div>
      <Toaster toasterId={toasterId} />

      <div className={classes.toolbar}>
        <Input
          placeholder="Buscar por nome ou cidade..."
          contentBefore={<Search20Regular />}
          value={busca}
          onChange={(_e, data) => setBusca(data.value)}
          style={{ width: 280 }}
        />
        <span className={classes.contador}>
          {linhasFiltradas.length} de {obras.length} obras
        </span>
      </div>

      <div className={classes.cartao}>
        <div className={classes.corpoRolavel}>
          <Table aria-label="Tabela de obras" size="medium">
            <TableHeader>
              <TableRow style={{ backgroundColor: COR_CABECALHO }}>
                <TableHeaderCell
                  style={{
                    width: 220,
                    backgroundColor: COR_CABECALHO,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    borderRight: `1px solid ${COR_BORDA_CABECALHO}`,
                  }}
                >
                  <CabecalhoOrdenavel
                    label="Nome"
                    coluna="nome"
                    ordenacao={ordenacao}
                    aoOrdenar={aoOrdenar}
                    valoresUnicos={valoresUnicos("nome")}
                    selecionados={selecionados.nome}
                    onChange={(novo) => aoMudarFiltro("nome", novo)}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  style={{
                    width: 170,
                    backgroundColor: COR_CABECALHO,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    borderRight: `1px solid ${COR_BORDA_CABECALHO}`,
                  }}
                >
                  <CabecalhoOrdenavel
                    label="Cidade/UF"
                    coluna="cidade"
                    ordenacao={ordenacao}
                    aoOrdenar={aoOrdenar}
                    valoresUnicos={valoresUnicos("cidade")}
                    selecionados={selecionados.cidade}
                    onChange={(novo) => aoMudarFiltro("cidade", novo)}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  style={{
                    width: 190,
                    backgroundColor: COR_CABECALHO,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    borderRight: `1px solid ${COR_BORDA_CABECALHO}`,
                  }}
                >
                  <CabecalhoOrdenavel
                    label="Tipo"
                    coluna="tipo"
                    ordenacao={ordenacao}
                    aoOrdenar={aoOrdenar}
                    {...filtroPorLabel("tipo", TIPO_LABEL)}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  style={{
                    width: 180,
                    backgroundColor: COR_CABECALHO,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    borderRight: `1px solid ${COR_BORDA_CABECALHO}`,
                  }}
                >
                  <CabecalhoOrdenavel
                    label="Escopo"
                    coluna="escopo"
                    ordenacao={ordenacao}
                    aoOrdenar={aoOrdenar}
                    {...filtroPorLabel("escopo", ESCOPO_LABEL)}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  style={{
                    width: 140,
                    backgroundColor: COR_CABECALHO,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    borderRight: `1px solid ${COR_BORDA_CABECALHO}`,
                  }}
                >
                  <CabecalhoOrdenavel
                    label="Status"
                    coluna="status"
                    ordenacao={ordenacao}
                    aoOrdenar={aoOrdenar}
                    {...filtroPorLabel("status", STATUS_LABEL)}
                  />
                </TableHeaderCell>
                <TableHeaderCell
                  style={{ width: 56, backgroundColor: COR_CABECALHO, position: "sticky", top: 0, zIndex: 1 }}
                >
                  {""}
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasFiltradas.map((linha, indice) => (
                <LinhaObra key={linha.id} linha={linha} indice={indice} onTrocarCampo={trocarCampo} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
