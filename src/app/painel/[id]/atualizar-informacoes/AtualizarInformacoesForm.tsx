"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Field,
  Input,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  Location20Regular,
  CheckmarkCircle20Regular,
  ArrowUpload20Regular,
  ArrowLeft20Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import { createClient } from "@/lib/supabase/client";
import { CATALOGO_CAMPOS_GERAIS, type CampoChave } from "@/lib/obraCampoCatalogo";
import { salvarFotoObra, salvarInformacoesGerais, verificarEndereco } from "./actions";

type Obra = { id: string; nome: string; tipo: string; escopo: string; cidade: string | null; estado: string | null };
type InfoFixa = { foto_url: string | null; endereco: string | null };
type CampoAtivo = { campo_chave: string; valor: string | null };

const useStyles = makeStyles({
  pagina: { maxWidth: "900px", margin: "0 auto" },
  subtitulo: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, marginTop: "4px" },
  voltarLink: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginBottom: "12px" },
  cartao: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: "24px 28px",
  },
  cartaoFixo: { marginBottom: "20px" },
  secaoTitulo: { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  secaoDescricao: { fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginBottom: "20px" },
  linhaFixos: { display: "grid", gridTemplateColumns: "180px 1fr", gap: "20px", alignItems: "start" },
  fotoQuadro: {
    position: "relative",
    width: "180px", height: "180px",
    borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden",
    background: "linear-gradient(160deg, #ffb877 0%, #f2836a 30%, #6a5a9c 65%, #2c2a4f 100%)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  fotoImg: { width: "100%", height: "100%", objectFit: "cover" },
  fotoBotaoWrap: { position: "absolute", bottom: "8px", left: "8px", right: "8px" },
  fotoLegenda: { position: "absolute", top: "8px", left: "8px", fontSize: "10px", color: "rgba(255,255,255,0.8)" },
  gradeCampos: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  labelCampo: { display: "flex", alignItems: "center", gap: "6px" },
  rodape: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: `1px solid ${tokens.colorNeutralStroke3}` },
  semCampos: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3, padding: "20px 0" },
});

export default function AtualizarInformacoesForm({
  obra,
  infoFixaInicial,
  camposAtivosIniciais,
}: {
  obra: Obra;
  infoFixaInicial: InfoFixa;
  camposAtivosIniciais: CampoAtivo[];
}) {
  const classes = useStyles();
  const toasterId = useId("toaster-atualizar-info");
  const { dispatchToast } = useToastController(toasterId);
  const inputArquivoRef = useRef<HTMLInputElement | null>(null);

  const [fotoUrl, setFotoUrl] = useState(infoFixaInicial.foto_url);
  const [endereco, setEndereco] = useState(infoFixaInicial.endereco ?? "");
  const [valores, setValores] = useState<Record<string, string>>(
    () => Object.fromEntries(camposAtivosIniciais.map((c) => [c.campo_chave, c.valor ?? ""])),
  );
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [resultadoEndereco, setResultadoEndereco] = useState<{
    intent: "success" | "warning" | "error";
    mensagem: string;
  } | null>(null);

  const camposAtivos = camposAtivosIniciais.map((c) => c.campo_chave as CampoChave);

  async function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    setEnviandoFoto(true);
    const supabase = createClient();
    const caminho = `${obra.id}/capa`;
    const { error: erroUpload } = await supabase.storage
      .from("obras")
      .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });

    if (erroUpload) {
      setEnviandoFoto(false);
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível enviar a foto.</ToastTitle>
          <ToastBody>{erroUpload.message}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    const { data } = supabase.storage.from("obras").getPublicUrl(caminho);
    const urlComVersao = `${data.publicUrl}?v=${Date.now()}`;
    const resultado = await salvarFotoObra(obra.id, urlComVersao);
    setEnviandoFoto(false);

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Foto enviada, mas não foi possível salvar a referência.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    setFotoUrl(urlComVersao);
    dispatchToast(
      <Toast>
        <ToastTitle>Foto atualizada com sucesso.</ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  async function verificarEnderecoDigitado() {
    setVerificando(true);
    setResultadoEndereco(null);
    const resultado = await verificarEndereco(endereco, obra.cidade, obra.estado);
    setVerificando(false);

    if (!resultado.encontrado) {
      setResultadoEndereco({
        intent: "error",
        mensagem: "Não encontramos esse endereço. Confira a escrita ou tente com menos detalhes (só rua e número).",
      });
      return;
    }
    if (resultado.precisao === "endereco") {
      setResultadoEndereco({ intent: "success", mensagem: "Endereço encontrado — o pino vai aparecer exatamente nesse local." });
    } else {
      setResultadoEndereco({
        intent: "warning",
        mensagem: `Não achamos essa rua específica — o mapa vai mostrar o centro de ${obra.cidade}/${obra.estado} até você ajustar.`,
      });
    }
  }

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarInformacoesGerais(obra.id, endereco, valores);
    setSalvando(false);

    if (resultado.erro) {
      dispatchToast(
        <Toast>
          <ToastTitle>Não foi possível salvar. Nada foi alterado — tente de novo.</ToastTitle>
          <ToastBody>{resultado.erro}</ToastBody>
        </Toast>,
        { intent: "error" },
      );
      return;
    }

    dispatchToast(
      <Toast>
        <ToastTitle>Informações de {obra.nome} salvas com sucesso.</ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  }

  return (
    <div className={classes.pagina}>
      <Toaster toasterId={toasterId} />

      <Link href={`/painel/${obra.id}`} className={classes.voltarLink}>
        <ArrowLeft20Regular fontSize={14} /> Voltar pra {obra.nome}
      </Link>

      <div className={classes.cartaoFixo}>
        <div className={classes.subtitulo} style={{ marginTop: 0, marginBottom: 16 }}>
          Só aparecem aqui os campos que o admin habilitou pra essa obra.
        </div>
      </div>

      <div className={`${classes.cartao} ${classes.cartaoFixo}`}>
        <Text className={classes.secaoTitulo}>Foto e Localização</Text>
        <div className={classes.secaoDescricao}>Sempre presentes, em qualquer obra — não fazem parte do catálogo configurável.</div>
        <div className={classes.linhaFixos}>
          <div className={classes.fotoQuadro}>
            {!fotoUrl && <span className={classes.fotoLegenda}>Sem foto ainda</span>}
            {fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt={`Foto de ${obra.nome}`} className={classes.fotoImg} />
            )}
            <input ref={inputArquivoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={aoEscolherArquivo} />
            <div className={classes.fotoBotaoWrap}>
              <Button
                appearance="secondary"
                size="small"
                icon={<ArrowUpload20Regular />}
                style={{ width: "100%" }}
                disabled={enviandoFoto}
                onClick={() => inputArquivoRef.current?.click()}
              >
                {enviandoFoto ? "Enviando..." : fotoUrl ? "Trocar foto" : "Enviar foto"}
              </Button>
            </div>
          </div>
          <Field
            label={
              <span className={classes.labelCampo}>
                <Location20Regular fontSize={16} /> Endereço (usado no mapa da Home)
              </span>
            }
            hint={`Só a rua e o número — cidade/UF (${obra.cidade}/${obra.estado}) já vem do cadastro da obra.`}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                value={endereco}
                placeholder="Ex: Rua das Flores, 250 - Bairro Centro"
                style={{ flex: 1 }}
                onChange={(_e, data) => {
                  setEndereco(data.value);
                  setResultadoEndereco(null);
                }}
              />
              <Button
                appearance="outline"
                icon={<Search20Regular />}
                disabled={verificando || !endereco.trim()}
                onClick={verificarEnderecoDigitado}
              >
                {verificando ? "Verificando..." : "Verificar endereço"}
              </Button>
            </div>
            {resultadoEndereco && (
              <MessageBar intent={resultadoEndereco.intent} style={{ marginTop: 8 }}>
                <MessageBarBody>{resultadoEndereco.mensagem}</MessageBarBody>
              </MessageBar>
            )}
          </Field>
        </div>
      </div>

      <div className={classes.cartao}>
        <Text className={classes.secaoTitulo}>Seção: Informações Gerais</Text>
        <div className={classes.secaoDescricao}>{obra.cidade}/{obra.estado}</div>

        {camposAtivos.length === 0 ? (
          <div className={classes.semCampos}>Nenhum campo habilitado pra essa obra ainda. Fale com o administrador.</div>
        ) : (
          <div className={classes.gradeCampos}>
            {camposAtivos.map((campoChave) => {
              const meta = CATALOGO_CAMPOS_GERAIS[campoChave];
              const Icone = meta.icone;
              return (
                <Field
                  key={campoChave}
                  label={
                    <span className={classes.labelCampo}>
                      <Icone fontSize={16} /> {meta.label}
                    </span>
                  }
                >
                  <Input
                    value={valores[campoChave] ?? ""}
                    placeholder={`Digite ${meta.label.toLowerCase()}...`}
                    onChange={(_e, data) => setValores((atual) => ({ ...atual, [campoChave]: data.value }))}
                  />
                </Field>
              );
            })}
          </div>
        )}

        <div className={classes.rodape}>
          <Button appearance="primary" icon={<CheckmarkCircle20Regular />} onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
