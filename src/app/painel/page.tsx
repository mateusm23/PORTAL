import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import ObrasVitrine from "./ObrasVitrine";

type Obra = {
  id: string;
  nome: string;
  tipo: "incorporacao_vertical" | "urbanismo" | "multipropriedade";
  escopo: "construcao" | "gerenciamento" | "administracao";
  status: "ativa" | "concluida" | "pausada";
  estado: string | null;
  cidade: string | null;
};

export default async function PainelPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("obra")
    .select("id, nome, tipo, escopo, status, estado, cidade")
    .order("nome");

  const obras = (data ?? []) as Obra[];

  return (
    <AppShell titulo="Obras" subtitulo="Visão geral das obras que você acompanha." secaoAtiva="obras">
      <ObrasVitrine obras={obras} />
    </AppShell>
  );
}
