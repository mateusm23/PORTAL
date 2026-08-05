-- Ações capturadas durante o modo "Apresentação" (/painel/[id]/dashboard):
-- durante a reunião com o cliente, dá pra registrar rápido um apontamento
-- ("corrigir tal coisa", "detalhar tal item") sem sair da tela cheia, com
-- print colado opcional. Sem update/delete de propósito -- ainda não existe
-- UI pra editar/apagar uma ação já registrada.
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

create table public.acao_apresentacao (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obra(id) on delete cascade,
  relatorio_id uuid not null references public.relatorio_mensal(id) on delete cascade,
  tela_chave text not null, -- validado no código contra a lista de páginas derivada de relatorioSecoesMeta.ts
  texto text not null,
  imagem_caminho text, -- caminho no bucket "acoes", não URL pronta (bucket é privado)
  criado_por uuid references public.usuario(id),
  criado_em timestamptz not null default now()
);

alter table public.acao_apresentacao enable row level security;

create policy "usuario cria acao da obra que acompanha"
  on public.acao_apresentacao for insert
  with check (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = acao_apresentacao.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "usuario ve acoes da obra que acompanha"
  on public.acao_apresentacao for select
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = acao_apresentacao.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin ve todas as acoes"
  on public.acao_apresentacao for select
  using (public.is_admin());

-- bucket privado (diferente do bucket "obras", que é público e serve só pra
-- fachada de obra) -- print colado numa apresentação pode ter dado sensível
-- de reunião, então fica com o mesmo cuidado que já motivou abandonar os
-- links públicos do Power BI (ver CONTEXTO_PROJETO.md, "Risco de segurança
-- real"). Convenção de caminho: {obra_id}/{relatorio_id}/{arquivo}.
insert into storage.buckets (id, name, public)
values ('acoes', 'acoes', false)
on conflict (id) do nothing;

create policy "usuario envia print de acao da obra que acompanha"
  on storage.objects for insert
  with check (
    bucket_id = 'acoes'
    and exists (
      select 1 from public.obra_usuario ou
      where ou.usuario_id = auth.uid()
      and ou.obra_id::text = (storage.foldername(name))[1]
    )
  );

create policy "usuario ve prints de acao da obra que acompanha"
  on storage.objects for select
  using (
    bucket_id = 'acoes'
    and exists (
      select 1 from public.obra_usuario ou
      where ou.usuario_id = auth.uid()
      and ou.obra_id::text = (storage.foldername(name))[1]
    )
  );
