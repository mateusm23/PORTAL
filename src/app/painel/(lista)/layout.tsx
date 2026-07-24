import AppShell from "@/components/AppShell";

export default function PainelListaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell titulo="Obras" subtitulo="Visão geral das obras que você acompanha." secaoAtiva="obras">
      {children}
    </AppShell>
  );
}
