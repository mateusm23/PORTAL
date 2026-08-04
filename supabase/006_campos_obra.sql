-- Catálogo de campos configuráveis por obra (seção "Informações Gerais")
-- + bloco fixo de foto/endereço (presente em toda obra, fora do catálogo).
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

-- Corrige lacuna real descoberta ao construir esta tela: obra.select só
-- permitia "usuario ve obras que acompanha" (via obra_usuario), sem uma
-- política admin-wide, o próprio Mateus não conseguiria ENXERGAR uma obra
-- nova criada por ele mesmo (criarObra não vincula o criador via
-- obra_usuario). Mesma classe de bug já corrigido antes em obra_usuario
-- (migration 004) e usuario (migration 003).
create policy "admin ve todas as obras"
  on public.obra for select
  using (public.is_admin());

-- obra_campo_ativo: o admin decide QUAIS campos existem pra cada obra
-- (insert/delete); o engenheiro (qualquer usuário vinculado à obra) só
-- atualiza o VALOR (update). campo_chave é validado no código, contra
-- o catálogo em src/lib/obraCampoCatalogo.ts, não é um enum no banco
-- de propósito, pra crescer sem precisar de migration a cada campo novo.
create table if not exists public.obra_campo_ativo (
  obra_id uuid not null references public.obra(id) on delete cascade,
  campo_chave text not null,
  valor text,
  atualizado_em timestamptz not null default now(),
  primary key (obra_id, campo_chave)
);

alter table public.obra_campo_ativo enable row level security;

create policy "usuario ve campos das obras que acompanha"
  on public.obra_campo_ativo for select
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_campo_ativo.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin habilita campo"
  on public.obra_campo_ativo for insert
  with check (public.is_admin());

create policy "admin desabilita campo"
  on public.obra_campo_ativo for delete
  using (public.is_admin());

create policy "usuario preenche valor do campo da obra que acompanha"
  on public.obra_campo_ativo for update
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_campo_ativo.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin ve todos os campos ativos"
  on public.obra_campo_ativo for select
  using (public.is_admin());

-- obra_info_fixa: foto + endereço, sempre presentes, fora do catálogo
-- configurável. Separado da tabela obra (cuja escrita é admin-only) porque
-- aqui quem escreve é o engenheiro vinculado à obra, não só o admin.
create table if not exists public.obra_info_fixa (
  obra_id uuid primary key references public.obra(id) on delete cascade,
  foto_url text,
  endereco text,
  atualizado_em timestamptz not null default now()
);

alter table public.obra_info_fixa enable row level security;

create policy "usuario ve info fixa das obras que acompanha"
  on public.obra_info_fixa for select
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_info_fixa.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "usuario cria info fixa da obra que acompanha"
  on public.obra_info_fixa for insert
  with check (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_info_fixa.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "usuario atualiza info fixa da obra que acompanha"
  on public.obra_info_fixa for update
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_info_fixa.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin ve toda info fixa"
  on public.obra_info_fixa for select
  using (public.is_admin());

-- bucket de fotos de obra, público pra leitura -- são só fotos de fachada/
-- capa, não é dado sensível), escrita restrita a quem acompanha a obra.
-- Convenção de caminho: {obra_id}/capa.<ext>
insert into storage.buckets (id, name, public)
values ('obras', 'obras', true)
on conflict (id) do nothing;

create policy "leitura publica de fotos de obra"
  on storage.objects for select
  using (bucket_id = 'obras');

create policy "usuario envia foto da obra que acompanha"
  on storage.objects for insert
  with check (
    bucket_id = 'obras'
    and exists (
      select 1 from public.obra_usuario ou
      where ou.usuario_id = auth.uid()
      and ou.obra_id::text = (storage.foldername(name))[1]
    )
  );

create policy "usuario substitui foto da obra que acompanha"
  on storage.objects for update
  using (
    bucket_id = 'obras'
    and exists (
      select 1 from public.obra_usuario ou
      where ou.usuario_id = auth.uid()
      and ou.obra_id::text = (storage.foldername(name))[1]
    )
  );
