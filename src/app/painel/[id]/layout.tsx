import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function ObraLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: obra } = await supabase.from("obra").select("nome").eq("id", id).single();

  if (!obra) {
    notFound();
  }

  return (
    <AppShell titulo={obra.nome} secaoAtiva="obras">
      {children}
    </AppShell>
  );
}
