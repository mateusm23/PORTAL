import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AcoesTriagem from "./AcoesTriagem";

export default async function AcoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // três queries em paralelo: dados da obra, todas as ações da obra (não só
  // de um relatório, ao contrário do Dashboard) e os relatórios da obra (só
  // pra resolver a competência de cada ação a partir do relatorio_id).
  const [{ data: obra }, { data: acoes }, { data: relatorios }] = await Promise.all([
    supabase.from("obra").select("nome").eq("id", id).single(),
    supabase
      .from("acao_apresentacao")
      .select("id, relatorio_id, tela_chave, texto, imagem_caminho, responsavel, prazo, concluido_em, criado_por, criado_em")
      .eq("obra_id", id)
      .order("criado_em", { ascending: true }),
    supabase.from("relatorio_mensal").select("id, competencia").eq("obra_id", id),
  ]);

  if (!obra) {
    notFound();
  }

  const linhas = acoes ?? [];
  const competenciaPorRelatorio = new Map((relatorios ?? []).map((r) => [r.id as string, r.competencia as string]));

  // nome de quem registrou cada ação -- resolvido à parte (não via select
  // embutido) pra manter o mesmo estilo de query simples já usado no resto
  // do app. Depende da policy "usuario ve nome de colegas da mesma obra"
  // (011_acao_apresentacao_triagem.sql) pra enxergar nomes de outros
  // usuários, não só o do próprio usuário logado.
  const idsCriadores = [...new Set(linhas.map((a) => a.criado_por as string | null).filter((v): v is string => !!v))];
  const { data: usuarios } = idsCriadores.length
    ? await supabase.from("usuario").select("id, nome, email").in("id", idsCriadores)
    : { data: [] };
  const nomePorUsuario = new Map(
    (usuarios ?? []).map((u) => [u.id as string, ((u.nome as string | null) || (u.email as string)) as string]),
  );

  // bucket "acoes" é privado -- cada imagem precisa de signed URL própria
  // (1h de validade), mesmo padrão de dashboard/page.tsx.
  const acoesIniciais = await Promise.all(
    linhas.map(async (a) => {
      let imagemUrl: string | null = null;
      if (a.imagem_caminho) {
        const { data: assinada } = await supabase.storage
          .from("acoes")
          .createSignedUrl(a.imagem_caminho as string, 3600);
        imagemUrl = assinada?.signedUrl ?? null;
      }
      return {
        id: a.id as string,
        relatorioId: a.relatorio_id as string,
        telaChave: a.tela_chave as string,
        texto: a.texto as string,
        imagemUrl,
        imagemCaminho: a.imagem_caminho as string | null,
        responsavel: (a.responsavel as string | null) || "",
        prazo: a.prazo as string | null,
        concluidoEm: a.concluido_em as string | null,
        criadoPor: (a.criado_por && nomePorUsuario.get(a.criado_por as string)) || "",
        criadoEm: a.criado_em as string,
        competenciaChave: competenciaPorRelatorio.get(a.relatorio_id as string) ?? "",
      };
    }),
  );

  return <AcoesTriagem obraId={id} obraNome={obra.nome as string} acoesIniciais={acoesIniciais} />;
}
