import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarDadosVisualizacao } from "../historico/actions";
import Apresentacao from "./Apresentacao";

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // sempre apresenta o relatório mais recente da obra -- não há seletor
  // aqui de propósito, quem quiser outro mês usa o Histórico.
  const { data: ultimoRelatorio } = await supabase
    .from("relatorio_mensal")
    .select("id")
    .eq("obra_id", id)
    .order("competencia", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ultimoRelatorio) {
    redirect(`/painel/${id}`);
  }

  const relatorioId = ultimoRelatorio.id as string;

  const { erro, dados } = await buscarDadosVisualizacao(id, relatorioId);
  if (erro || !dados) {
    redirect(`/painel/${id}`);
  }

  const { data: acoes } = await supabase
    .from("acao_apresentacao")
    .select("id, tela_chave, texto, imagem_caminho")
    .eq("relatorio_id", relatorioId)
    .order("criado_em", { ascending: true });

  // bucket "acoes" é privado -- não dá pra montar URL direto, cada imagem
  // precisa de signed URL própria (1h de validade, sobra pra uma apresentação).
  const acoesIniciais = await Promise.all(
    (acoes ?? []).map(async (a) => {
      let imagemUrl: string | null = null;
      if (a.imagem_caminho) {
        const { data: assinada } = await supabase.storage
          .from("acoes")
          .createSignedUrl(a.imagem_caminho as string, 3600);
        imagemUrl = assinada?.signedUrl ?? null;
      }
      return {
        id: a.id as string,
        telaChave: a.tela_chave as string,
        texto: a.texto as string,
        imagemUrl,
      };
    }),
  );

  return (
    <Apresentacao
      obraId={id}
      relatorioId={relatorioId}
      dadosCapa={dados}
      acoesIniciais={acoesIniciais}
    />
  );
}
