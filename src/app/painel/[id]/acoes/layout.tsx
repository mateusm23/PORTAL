import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function AcoesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: obra } = await supabase.from("obra").select("id").eq("id", id).single();
  if (!obra) {
    notFound();
  }

  // sem "titulo" de propósito -- AcoesTriagem.tsx já tem o próprio
  // cabeçalho (CabecalhoRelatorio, nome da obra em destaque), duplicava com
  // o <h1> que o AppShell mostraria aqui em cima.
  return (
    <AppShell secaoAtiva="obras">
      {children}
    </AppShell>
  );
}
