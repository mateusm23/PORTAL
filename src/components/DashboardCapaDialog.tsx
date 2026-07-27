"use client";

import {
  makeStyles,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
} from "@fluentui/react-components";
import CapaRelatorioPdf from "./CapaRelatorioPdf";

// casca fina: só a moldura de modal (título, botão fechar). O visual da capa
// em si mora em CapaRelatorioPdf.tsx, separado de propósito — reaproveitado
// também na exportação real de PDF (Playwright) mais pra frente, sem
// duplicar o desenho da capa em dois lugares. Nunca pode ter barra de
// rolagem (representa a imagem exata que vira PDF): flex/overflow:hidden,
// nunca altura fixa em px que possa estourar.
const useStyles = makeStyles({
  dialogo: { width: "97vw", maxWidth: "1700px", height: "94vh", maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  corpo: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" },
  conteudo: { flex: 1, minHeight: 0, overflow: "hidden" },
});

type CampoGeral = { chave: string; label: string; valor: string; grupo: "detalhes" | "area" };

export default function DashboardCapaDialog({
  open,
  onOpenChange,
  obraNome,
  cidade,
  estado,
  competencia,
  fotoUrl,
  camposGerais,
  clienteContratante,
  responsavelTecnico,
  registroProfissional,
  logotipoUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraNome: string;
  cidade: string | null;
  estado: string | null;
  competencia: string;
  fotoUrl: string | null;
  camposGerais: CampoGeral[];
  clienteContratante: string | null;
  responsavelTecnico: string | null;
  registroProfissional: string | null;
  logotipoUrl: string | null;
}) {
  const classes = useStyles();

  return (
    <Dialog open={open} onOpenChange={(_e, data) => onOpenChange(data.open)}>
      <DialogSurface className={classes.dialogo}>
        <DialogBody className={classes.corpo}>
          <DialogTitle>Prévia · Dashboard da Capa</DialogTitle>
          <DialogContent className={classes.conteudo}>
            <CapaRelatorioPdf
              obraNome={obraNome}
              cidade={cidade}
              estado={estado}
              competencia={competencia}
              fotoUrl={fotoUrl}
              camposGerais={camposGerais}
              clienteContratante={clienteContratante}
              responsavelTecnico={responsavelTecnico}
              registroProfissional={registroProfissional}
              logotipoUrl={logotipoUrl}
            />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Fechar</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
