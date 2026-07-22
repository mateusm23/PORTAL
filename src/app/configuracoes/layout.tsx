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
      subtitulo="Cadastros de obras e controle de acesso."
      secaoAtiva="configuracoes"
      flyout={<ConfiguracoesFlyout />}
    >
      {children}
    </AppShell>
  );
}
