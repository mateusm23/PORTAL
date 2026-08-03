"use client";

import { makeStyles, tokens, Button } from "@fluentui/react-components";
import { ArrowSync20Regular, Eye20Regular, CheckmarkCircle20Regular } from "@fluentui/react-icons";

// barra de ações padrão de toda seção do relatório mensal — mesmos 4 botões
// em toda seção nova que for construída (Replicar/Visualizar/Finalizar/
// Salvar), cores sólidas fortes validadas em preview antes de virar código.
const useStyles = makeStyles({
  toolbar: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", margin: "20px 0" },
  botaoReplicar: {
    backgroundColor: "#0e3244", color: "#ffffff", border: "none", boxShadow: "0 3px 10px rgba(14,50,68,0.35)",
    ":hover": { backgroundColor: "#164a63", color: "#ffffff" },
  },
  botaoVisualizar: {
    backgroundColor: "#334155", color: "#ffffff", border: "none", boxShadow: "0 3px 10px rgba(51,65,85,0.3)",
    ":hover": { backgroundColor: "#475569", color: "#ffffff" },
  },
  botaoFinalizar: {
    backgroundColor: "#15803d", color: "#ffffff", border: "none", boxShadow: "0 3px 10px rgba(21,128,61,0.35)",
    ":hover": { backgroundColor: "#16a34a", color: "#ffffff" },
  },
  botaoReabrir: {
    backgroundColor: "#b45309", color: "#ffffff", border: "none", boxShadow: "0 3px 10px rgba(180,83,9,0.35)",
    ":hover": { backgroundColor: "#c2670f", color: "#ffffff" },
  },
});

export default function ToolbarSecaoRelatorio({
  temReplicar,
  onReplicar,
  onVisualizar,
  finalizado,
  onAlternarFinalizar,
  onSalvar,
  salvarDesabilitado,
  salvando,
  travado,
}: {
  temReplicar: boolean;
  onReplicar: () => void;
  onVisualizar: () => void;
  finalizado: boolean;
  onAlternarFinalizar: () => void;
  onSalvar: () => void;
  salvarDesabilitado?: boolean;
  salvando?: boolean;
  /** relatório já travado como histórico — só Visualizar continua liberado */
  travado?: boolean;
}) {
  const classes = useStyles();

  return (
    <div className={classes.toolbar}>
      {temReplicar && (
        <Button className={classes.botaoReplicar} size="large" icon={<ArrowSync20Regular />} onClick={onReplicar} disabled={travado}>
          Replicar dados do último relatório
        </Button>
      )}
      <Button className={classes.botaoVisualizar} size="large" icon={<Eye20Regular />} onClick={onVisualizar}>
        Visualizar
      </Button>
      <Button
        className={finalizado ? classes.botaoReabrir : classes.botaoFinalizar}
        size="large"
        icon={finalizado ? <ArrowSync20Regular /> : <CheckmarkCircle20Regular />}
        onClick={onAlternarFinalizar}
        disabled={travado}
      >
        {finalizado ? "Reabrir seção" : "Finalizar seção"}
      </Button>
      <Button appearance="primary" size="large" icon={<CheckmarkCircle20Regular />} onClick={onSalvar} disabled={salvarDesabilitado || travado}>
        {salvando ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
