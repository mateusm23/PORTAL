"use client";

import { Spinner, tokens } from "@fluentui/react-components";

export default function CarregandoOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(1.5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
        zIndex: 10,
      }}
    >
      <Spinner size="large" />
      <span style={{ fontSize: "13px", color: tokens.colorNeutralForeground3 }}>Carregando...</span>
    </div>
  );
}
