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
  fotoUrl: string | null;
};

export default async function PainelPage() {
  const supabase = await createClient();

  const [{ data: obrasData }, { data: fotos }] = await Promise.all([
    supabase.from("obra").select("id, nome, tipo, escopo, status, estado, cidade").order("nome"),
    supabase.from("obra_info_fixa").select("obra_id, foto_url"),
  ]);

  const fotoPorObra = new Map((fotos ?? []).map((f) => [f.obra_id, f.foto_url]));
  const obras: Obra[] = (obrasData ?? []).map((o) => ({ ...o, fotoUrl: fotoPorObra.get(o.id) ?? null }));

  return (
    <AppShell titulo="Obras" subtitulo="Visão geral das obras que você acompanha." secaoAtiva="obras">
      <ObrasVitrine obras={obras} />
    </AppShell>
  );
}
