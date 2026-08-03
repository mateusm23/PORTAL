"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  makeStyles,
  tokens,
  Field,
  Input,
  Button,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
} from "@fluentui/react-components";
import { ArrowLeft20Regular, ArrowUpload20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import CabecalhoRelatorio from "@/components/CabecalhoRelatorio";
import ToolbarSecaoRelatorio from "@/components/ToolbarSecaoRelatorio";
import DashboardCapaDialog from "@/components/DashboardCapaDialog";
import { createClient } from "@/lib/supabase/client";
import { SECOES_RELATORIO, type SecaoChave } from "@/lib/relatorioSecoesCatalogo";
import { CATALOGO_CAMPOS_GERAIS } from "@/lib/obraCampoCatalogo";
import { formatarCompetencia } from "@/lib/competencia";
import { salvarInformacoesCapa, replicarUltimoRelatorio, alternarFinalizarSecao } from "../../../actions";

const useStyles = makeStyles({
  pagina: { maxWidth: "900px", margin: "0 auto" },
  voltarLink: {
    display: "inline-flex", alignItems: "center", gap: "6px", fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2, cursor: "pointer", marginBottom: "18px",
    ":hover": { color: tokens.colorBrandForeground1 },
  },
  cartao: {
    backgroundColor: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusXLarge, boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`, padding: "24px 28px",
  },
  gradeCampos: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  labelCampo: { display: "flex", alignItems: "center", gap: "6px" },
  emConstrucaoWrap: {
    padding: "40px 20px", textAlign: "center", color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase300,
    border: `1px dashed ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge,
  },
  avisoTravado: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", marginBottom: "16px",
    borderRadius: tokens.borderRadiusLarge, backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase300,
  },
});

type CampoAtivo = { campo_chave: string; valor: string | null };
type InfoCapa = { cliente_contratante: string | null; responsavel_tecnico: string | null; registro_profissional: string | null; logotipo_url: string | null };

export default function SecaoRelatorioForm({
  obraId,
  obraNome,
  cidade,
  estado,
  secaoChave,
  secaoLabel,
  temReplicar,
  emConstrucao,
  relatorioId,
  competencia,
  travado,
  finalizado,
  infoCapaInicial,
  fotoUrl,
  camposAtivos,
  camposSecaoAtivos,
}: {
  obraId: string;
  obraNome: string;
  cidade: string | null;
  estado: string | null;
  secaoChave: SecaoChave;
  secaoLabel: string;
  temReplicar: boolean;
  emConstrucao: boolean;
  relatorioId: string;
  competencia: string;
  /** relatório já travado como histórico — formulário fica só leitura */
  travado: boolean;
  finalizado: boolean;
  infoCapaInicial: InfoCapa;
  fotoUrl: string | null;
  camposAtivos: CampoAtivo[];
  /** campos da SEÇÃO habilitados pelo admin (tela Configurações · Seções e Campos da Obra) */
  camposSecaoAtivos: string[];
}) {
  const classes = useStyles();
  const router = useRouter();
  const toasterId = useId("toaster-secao-relatorio");
  const { dispatchToast } = useToastController(toasterId);
  const inputLogoRef = useRef<HTMLInputElement | null>(null);

  const [valores, setValores] = useState({
    clienteContratante: infoCapaInicial.cliente_contratante ?? "",
    responsavelTecnico: infoCapaInicial.responsavel_tecnico ?? "",
    registroProfissional: infoCapaInicial.registro_profissional ?? "",
    logotipoUrl: infoCapaInicial.logotipo_url,
  });
  const [finalizadoLocal, setFinalizadoLocal] = useState(finalizado);
  const [salvando, setSalvando] = useState(false);
  const [replicando, setReplicando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [dialogVisualizarAberto, setDialogVisualizarAberto] = useState(false);

  const competenciaLabel = formatarCompetencia(competencia);
  const secaoCatalogo = SECOES_RELATORIO[secaoChave];
  const camposGerais = camposAtivos.map((c) => {
    const meta = CATALOGO_CAMPOS_GERAIS[c.campo_chave as keyof typeof CATALOGO_CAMPOS_GERAIS];
    return { chave: c.campo_chave, label: meta?.label ?? c.campo_chave, valor: c.valor ?? "", grupo: meta?.grupo ?? ("detalhes" as const) };
  });
  // só os campos que o admin habilitou pra essa obra E que o engenheiro
  // realmente preenche (nomeObra/fotoCapa/tipologia são "somenteLeitura" —
  // aparecem só como toggle pro admin, nunca como input aqui)
  const camposParaPreencher = Object.entries(secaoCatalogo.campos ?? {}).filter(
    ([chave, meta]) => camposSecaoAtivos.includes(chave) && !meta.somenteLeitura,
  );

  function mudarValor(chave: "clienteContratante" | "responsavelTecnico" | "registroProfissional", valor: string) {
    setValores((atual) => ({ ...atual, [chave]: valor }));
  }

  async function aoEscolherLogo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    setEnviandoLogo(true);
    const supabase = createClient();
    const caminho = `${obraId}/relatorios/${competencia}/logotipo-cliente`;
    const { error: erroUpload } = await supabase.storage.from("obras").upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });
    setEnviandoLogo(false);

    if (erroUpload) {
      dispatchToast(<Toast><ToastTitle>Não foi possível enviar o logotipo.</ToastTitle><ToastBody>{erroUpload.message}</ToastBody></Toast>, { intent: "error" });
      return;
    }

    const { data } = supabase.storage.from("obras").getPublicUrl(caminho);
    setValores((atual) => ({ ...atual, logotipoUrl: `${data.publicUrl}?v=${Date.now()}` }));
    dispatchToast(<Toast><ToastTitle>Logotipo selecionado — clique em Salvar pra confirmar.</ToastTitle></Toast>, { intent: "success" });
  }

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarInformacoesCapa(obraId, relatorioId, valores);
    setSalvando(false);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível salvar. Nada foi alterado — tente de novo.</ToastTitle><ToastBody>{resultado.erro}</ToastBody></Toast>, { intent: "error" });
      return;
    }
    dispatchToast(<Toast><ToastTitle>{secaoLabel} salva com sucesso.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  async function replicar() {
    setReplicando(true);
    const resultado = await replicarUltimoRelatorio(obraId, relatorioId);
    setReplicando(false);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível replicar.</ToastTitle><ToastBody>{resultado.erro}</ToastBody></Toast>, { intent: "error" });
      return;
    }
    if (resultado.valores) {
      setValores(resultado.valores);
    }
    dispatchToast(<Toast><ToastTitle>Dados do relatório anterior replicados.</ToastTitle></Toast>, { intent: "success" });
    router.refresh();
  }

  async function alternarFinalizar() {
    setFinalizando(true);
    const resultado = await alternarFinalizarSecao(obraId, relatorioId, secaoChave, !finalizadoLocal);
    setFinalizando(false);

    if (resultado.erro) {
      dispatchToast(<Toast><ToastTitle>Não foi possível atualizar o status da seção.</ToastTitle><ToastBody>{resultado.erro}</ToastBody></Toast>, { intent: "error" });
      return;
    }
    setFinalizadoLocal(!finalizadoLocal);
    dispatchToast(
      <Toast><ToastTitle>{!finalizadoLocal ? `"${secaoLabel}" finalizada. Ainda dá pra corrigir até o mês virar.` : `"${secaoLabel}" reaberta pra edição.`}</ToastTitle></Toast>,
      { intent: "success" },
    );
    router.refresh();
  }

  return (
    <div className={classes.pagina}>
      <Toaster toasterId={toasterId} />
      <DashboardCapaDialog
        open={dialogVisualizarAberto}
        onOpenChange={setDialogVisualizarAberto}
        obraNome={obraNome}
        cidade={cidade}
        estado={estado}
        competencia={competenciaLabel}
        fotoUrl={fotoUrl}
        camposGerais={camposGerais}
        clienteContratante={valores.clienteContratante}
        responsavelTecnico={valores.responsavelTecnico}
        registroProfissional={valores.registroProfissional}
        logotipoUrl={valores.logotipoUrl}
      />

      <Link href={`/painel/${obraId}/atualizar-informacoes`} className={classes.voltarLink}>
        <ArrowLeft20Regular fontSize={18} /> Voltar
      </Link>

      <CabecalhoRelatorio obraNome={obraNome} subtitulo={secaoLabel} competencia={competenciaLabel} finalizado={finalizadoLocal} />

      {travado && (
        <div className={classes.avisoTravado}>
          <LockClosed20Regular fontSize={16} />
          Este relatório está travado como histórico — só leitura. Um admin pode reabrir em Histórico, na tela de início.
        </div>
      )}

      <ToolbarSecaoRelatorio
        temReplicar={temReplicar && !emConstrucao}
        onReplicar={replicar}
        onVisualizar={() => setDialogVisualizarAberto(true)}
        finalizado={finalizadoLocal}
        onAlternarFinalizar={alternarFinalizar}
        onSalvar={salvar}
        salvarDesabilitado={emConstrucao || camposParaPreencher.length === 0 || salvando}
        salvando={salvando || replicando || finalizando}
        travado={travado}
      />

      <div className={classes.cartao}>
        {emConstrucao ? (
          <div className={classes.emConstrucaoWrap}>
            {`"${secaoLabel}" ainda não foi desenhada — espaço reservado só pra mostrar a navegação entre seções.`}
          </div>
        ) : camposParaPreencher.length === 0 ? (
          <div className={classes.emConstrucaoWrap}>Nenhum campo habilitado pra essa obra ainda, nessa seção. Fale com o administrador.</div>
        ) : (
          <div className={classes.gradeCampos}>
            {camposParaPreencher.map(([chave, meta]) => {
              const Icone = meta.icone;
              if (chave === "logotipoCliente") {
                return (
                  <Field key={chave} label={<span className={classes.labelCampo}><Icone fontSize={16} /> {meta.label}</span>}>
                    <Button appearance="secondary" size="small" icon={<ArrowUpload20Regular />} disabled={enviandoLogo || travado} onClick={() => inputLogoRef.current?.click()}>
                      {enviandoLogo ? "Enviando..." : valores.logotipoUrl ? "Trocar logotipo" : "Enviar logotipo"}
                    </Button>
                  </Field>
                );
              }
              const chaveValor = chave as "clienteContratante" | "responsavelTecnico" | "registroProfissional";
              return (
                <Field key={chave} label={<span className={classes.labelCampo}><Icone fontSize={16} /> {meta.label}</span>}>
                  <Input
                    value={valores[chaveValor]}
                    placeholder={`Digite ${meta.label.toLowerCase()}...`}
                    onChange={(_e, data) => mudarValor(chaveValor, data.value)}
                    disabled={travado}
                  />
                </Field>
              );
            })}
            <input ref={inputLogoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={aoEscolherLogo} />
          </div>
        )}
      </div>
    </div>
  );
}
