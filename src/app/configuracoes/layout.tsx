import AppShell from "@/components/AppShell";
import ConfiguracoesFlyout from "./ConfiguracoesFlyout";

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      titulo="Configurações"
      secaoAtiva="configuracoes"
      flyout={<ConfiguracoesFlyout />}
    >
      {children}
    </AppShell>
  );
}
