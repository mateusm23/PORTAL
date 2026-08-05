"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  makeStyles,
  tokens,
  Button,
  Slider,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { ZoomIn20Regular, ZoomOut20Regular, CheckmarkCircle20Regular } from "@fluentui/react-icons";

// proporção real do espaço da foto em CapaRelatorioPdf.tsx, no tamanho
// verdadeiro da página (1280x720): coluna direita ~721,5px de largura, e
// depois de descontar as duas faixas de título (~44px cada) e o bloco de
// indicadores (~179px), sobram ~453px de altura -- por isso ~1,593, não o
// 750:380 (~1,97) que a ferramenta antiga do Power BI usava. Validado
// interativamente em preview/20-cortar-foto-obra.html.
const RAZAO_FOTO_CAPA = 721.5 / 453;
const QUADRO_HOME = 150; // prévia reduzida do fotoQuadro real (180x180, ver InformacoesGeraisForm.tsx)

const AZUL_FAIXA = "#002244";
const AZUL_TILE = "#002B55";
const CINZA_RESUMO = "#E6E6E6";
const AZUL_ACAO = "#2563eb";
const GRADIENTE_VAZIO = "linear-gradient(160deg, #ffb877 0%, #f2836a 30%, #6a5a9c 65%, #2c2a4f 100%)";

type Viewport = { w: number; h: number };
type Pan = { x: number; y: number };

// maior caixa na proporção RAZAO_FOTO_CAPA que cabe no espaço disponível --
// o viewport usa o espaço de verdade em vez de um tamanho fixo, senão a
// foto fica pequena demais pra ajustar com precisão.
function calcularViewport(dispW: number, dispH: number): Viewport {
  let w = dispW;
  let h = w / RAZAO_FOTO_CAPA;
  if (h > dispH) {
    h = dispH;
    w = h * RAZAO_FOTO_CAPA;
  }
  return { w: Math.max(200, Math.round(w)), h: Math.max(125, Math.round(h)) };
}

function escalaCover(img: HTMLImageElement, viewport: Viewport) {
  return Math.max(viewport.w / img.naturalWidth, viewport.h / img.naturalHeight);
}
function tamanhoNaTela(img: HTMLImageElement, zoom: number, viewport: Viewport) {
  const base = escalaCover(img, viewport);
  return { w: img.naturalWidth * base * zoom, h: img.naturalHeight * base * zoom };
}
function limitarPan(pan: Pan, tam: { w: number; h: number }, viewport: Viewport): Pan {
  const minX = Math.min(0, viewport.w - tam.w);
  const minY = Math.min(0, viewport.h - tam.h);
  return { x: Math.min(0, Math.max(pan.x, minX)), y: Math.min(0, Math.max(pan.y, minY)) };
}

const useStyles = makeStyles({
  superficie: { maxWidth: "980px", width: "94vw" },
  corpo: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", minHeight: "480px" },

  areaCanvas: {
    borderRadius: tokens.borderRadiusXLarge, border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: "#e8edf5", backgroundImage: "radial-gradient(circle, #c8d0db 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", position: "relative",
  },
  viewport: {
    position: "relative", overflow: "hidden", borderRadius: "8px",
    boxShadow: `0 0 0 3px ${AZUL_ACAO}, 0 8px 30px rgba(0,0,0,0.35)`,
    backgroundColor: "#0f172a",
  },
  viewportImg: { position: "absolute", maxWidth: "none", pointerEvents: "none" },
  dicaCanvas: {
    fontSize: "11px", color: "#475569", backgroundColor: "rgba(255,255,255,0.9)",
    padding: "5px 14px", borderRadius: "20px", border: `1px solid ${tokens.colorNeutralStroke2}`, whiteSpace: "nowrap",
  },

  sidebar: { display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" },
  painelSidebar: {
    backgroundColor: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusXLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`, padding: "14px",
  },
  tituloPainel: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, marginBottom: "10px" },
  linhaPreviasDuplas: { display: "flex", gap: "12px", alignItems: "flex-end" },

  previaCapa: { flex: 1, borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,20,50,0.18)" },
  previaFaixa: { backgroundColor: AZUL_FAIXA, color: "#ffffff", padding: "5px 8px", textAlign: "center", fontSize: "8px", fontWeight: 700, letterSpacing: "0.03em" },
  previaFotoWrap: { position: "relative", overflow: "hidden", background: GRADIENTE_VAZIO, aspectRatio: `${RAZAO_FOTO_CAPA}` },
  previaImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  previaResumo: { padding: "5px", backgroundColor: CINZA_RESUMO },
  previaTiles: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3px" },
  previaTile: { backgroundColor: AZUL_TILE, borderRadius: "3px", minHeight: "16px" },

  blocoHome: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  previaHomeQuadro: {
    width: `${QUADRO_HOME}px`, height: `${QUADRO_HOME}px`, borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden", background: GRADIENTE_VAZIO, boxShadow: "0 4px 14px rgba(0,20,50,0.18)",
  },
  legendaPrevia: { fontSize: "10px", color: tokens.colorNeutralForeground3, textAlign: "center" },

  linhaSlider: { display: "flex", alignItems: "center", gap: "8px" },
  valorSlider: { fontSize: "12px", fontWeight: 600, color: AZUL_ACAO, minWidth: "44px", textAlign: "right" },
});

export default function RecorteFotoObra({
  open,
  onOpenChange,
  arquivo,
  enviando,
  onConfirmar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arquivo: File | null;
  enviando: boolean;
  onConfirmar: (blob: Blob) => void;
}) {
  const classes = useStyles();
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [arrastando, setArrastando] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ w: 480, h: Math.round(480 / RAZAO_FOTO_CAPA) });

  const arrastoRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  // carrega a imagem quando o diálogo abre com um arquivo novo -- efeito
  // legítimo (sincroniza com o carregamento assíncrono da imagem, um
  // sistema externo), diferente dos resets abaixo.
  useEffect(() => {
    if (!arquivo || !open) return;
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => setImagem(img);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [arquivo, open]);

  // viewport ocupa o espaço disponível de verdade (não um tamanho fixo)
  useEffect(() => {
    const el = areaRef.current;
    if (!el || !open) return;
    const folga = 24;
    function recalcular() {
      if (!el) return;
      const novo = calcularViewport(el.clientWidth - folga * 2, el.clientHeight - folga * 2);
      setViewport((atual) => (atual.w === novo.w && atual.h === novo.h ? atual : novo));
    }
    recalcular();
    const observer = new ResizeObserver(recalcular);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  // reseta zoom/posição ao fechar o diálogo ou ao trocar de imagem -- ajuste
  // de estado durante a renderização (padrão recomendado pelo React pra
  // "resetar quando algo muda"), não um efeito, pra não disparar um
  // segundo render em cascata.
  const [rastreado, setRastreado] = useState({ open, imagem });
  if (rastreado.open !== open || rastreado.imagem !== imagem) {
    setRastreado({ open, imagem });
    if (!open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else if (imagem && imagem !== rastreado.imagem) {
      const tam = tamanhoNaTela(imagem, 1, viewport);
      setZoom(1);
      setPan(limitarPan({ x: (viewport.w - tam.w) / 2, y: (viewport.h - tam.h) / 2 }, tam, viewport));
    }
  }

  // pan é clampado no ponto de uso (aqui), não guardado já clampado via um
  // efeito reagindo ao viewport -- assim redimensionar a janela nunca
  // precisa de setState fora de uma interação real (drag/zoom/imagem nova).
  const tam = useMemo(() => (imagem ? tamanhoNaTela(imagem, zoom, viewport) : { w: 0, h: 0 }), [imagem, zoom, viewport]);
  const panClampado = imagem ? limitarPan(pan, tam, viewport) : pan;

  // muda o zoom mantendo o mesmo ponto da foto centralizado no viewport
  function aoMudarZoom(novoZoom: number) {
    if (!imagem) { setZoom(novoZoom); return; }
    const tamAntigo = tamanhoNaTela(imagem, zoom, viewport);
    const tamNovo = tamanhoNaTela(imagem, novoZoom, viewport);
    const centroX = viewport.w / 2 - panClampado.x;
    const centroY = viewport.h / 2 - panClampado.y;
    const fatorX = tamNovo.w / tamAntigo.w;
    const fatorY = tamNovo.h / tamAntigo.h;
    setZoom(novoZoom);
    setPan(limitarPan({ x: viewport.w / 2 - centroX * fatorX, y: viewport.h / 2 - centroY * fatorY }, tamNovo, viewport));
  }

  function aoMouseDown(e: React.MouseEvent) {
    setArrastando(true);
    arrastoRef.current = { x: e.clientX, y: e.clientY, panX: panClampado.x, panY: panClampado.y };
  }
  useEffect(() => {
    function aoMouseMove(e: MouseEvent) {
      if (!arrastando || !arrastoRef.current || !imagem) return;
      const dx = e.clientX - arrastoRef.current.x;
      const dy = e.clientY - arrastoRef.current.y;
      setPan(limitarPan({ x: arrastoRef.current.panX + dx, y: arrastoRef.current.panY + dy }, tam, viewport));
    }
    function aoMouseUp() { setArrastando(false); }
    window.addEventListener("mousemove", aoMouseMove);
    window.addEventListener("mouseup", aoMouseUp);
    return () => {
      window.removeEventListener("mousemove", aoMouseMove);
      window.removeEventListener("mouseup", aoMouseUp);
    };
  }, [arrastando, imagem, tam, viewport]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function aoRodarRoda(e: WheelEvent) {
      if (!imagem) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      aoMudarZoom(Math.max(1, Math.min(5, +(zoom + delta).toFixed(2))));
    }
    el.addEventListener("wheel", aoRodarRoda, { passive: false });
    return () => el.removeEventListener("wheel", aoRodarRoda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagem, zoom, panClampado, viewport]);

  // prévia (canvas offscreen) derivada direto -- useMemo, não estado+efeito,
  // já que toDataURL é só computação em memória, sem recurso externo pra
  // limpar depois (diferente de um object URL, que precisaria de efeito).
  const previewUrl = useMemo(() => {
    if (!imagem) return null;
    const base = escalaCover(imagem, viewport) * zoom;
    const naturalX = -panClampado.x / base;
    const naturalY = -panClampado.y / base;
    const naturalW = viewport.w / base;
    const naturalH = viewport.h / base;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(naturalW));
    canvas.height = Math.max(1, Math.round(naturalH));
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(imagem, naturalX, naturalY, naturalW, naturalH, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [imagem, zoom, panClampado, viewport]);

  function aoConfirmar() {
    if (!imagem) return;
    const base = escalaCover(imagem, viewport) * zoom;
    const naturalX = -panClampado.x / base;
    const naturalY = -panClampado.y / base;
    const naturalW = viewport.w / base;
    const naturalH = viewport.h / base;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(naturalW));
    canvas.height = Math.max(1, Math.round(naturalH));
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(imagem, naturalX, naturalY, naturalW, naturalH, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => { if (blob) onConfirmar(blob); }, "image/jpeg", 0.9);
  }

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!enviando) onOpenChange(data.open); }}>
      <DialogSurface className={classes.superficie}>
        <DialogBody>
          <DialogTitle>Ajustar foto da obra</DialogTitle>
          <DialogContent>
            <div className={classes.corpo}>
              <div className={classes.areaCanvas} ref={areaRef}>
                {imagem && (
                  <>
                    <div
                      ref={viewportRef}
                      className={classes.viewport}
                      style={{ width: `${viewport.w}px`, height: `${viewport.h}px`, cursor: arrastando ? "grabbing" : "grab" }}
                      onMouseDown={aoMouseDown}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem.src}
                        draggable={false}
                        className={classes.viewportImg}
                        style={{ left: `${panClampado.x}px`, top: `${panClampado.y}px`, width: `${tam.w}px`, height: `${tam.h}px` }}
                        alt="Foto pra recortar"
                      />
                    </div>
                    <div className={classes.dicaCanvas}>🖱 Arraste pra mover · Scroll ou o controle ao lado pra dar zoom</div>
                  </>
                )}
              </div>

              <div className={classes.sidebar}>
                <div className={classes.painelSidebar}>
                  <div className={classes.tituloPainel}>Prévia real (mesmo recorte nos dois lugares)</div>
                  <div className={classes.linhaPreviasDuplas}>
                    <div className={classes.previaCapa}>
                      <div className={classes.previaFaixa}>RELATÓRIO MENSAL DE OBRA</div>
                      <div className={classes.previaFotoWrap}>
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} className={classes.previaImg} alt="Prévia na Capa" />
                        )}
                      </div>
                      <div className={classes.previaFaixa}>RESUMO EXECUTIVO</div>
                      <div className={classes.previaResumo}>
                        <div className={classes.previaTiles}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={classes.previaTile} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={classes.blocoHome}>
                      <div className={classes.previaHomeQuadro}>
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} className={classes.previaImg} alt="Prévia na Home" />
                        )}
                      </div>
                      <div className={classes.legendaPrevia}>Quadro da Home</div>
                    </div>
                  </div>
                </div>

                <div className={classes.painelSidebar}>
                  <div className={classes.tituloPainel}>Zoom</div>
                  <div className={classes.linhaSlider}>
                    <ZoomOut20Regular fontSize={16} style={{ color: "#64748b" }} />
                    <Slider
                      min={100}
                      max={500}
                      value={Math.round(zoom * 100)}
                      onChange={(_e, data) => aoMudarZoom(data.value / 100)}
                      style={{ flex: 1 }}
                    />
                    <ZoomIn20Regular fontSize={16} style={{ color: "#64748b" }} />
                    <div className={classes.valorSlider}>{Math.round(zoom * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" disabled={enviando} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              appearance="primary"
              icon={enviando ? <Spinner size="tiny" /> : <CheckmarkCircle20Regular />}
              disabled={!imagem || enviando}
              onClick={aoConfirmar}
            >
              {enviando ? "Enviando..." : "Usar esta foto"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
