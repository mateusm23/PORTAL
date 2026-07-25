-- Tela admin do preview 11 (Configurações · Seções e Campos da Obra):
-- estende o padrão de obra_campo_ativo (006_campos_obra.sql) pras seções do
-- RELATÓRIO MENSAL — admin decide quais campos existem por obra, em cada
-- seção (Informações Gerais continua em obra_campo_ativo, sem mudança).
--
-- Diferença chave: aqui não tem "valor" nenhum, é só existência (liga/desliga)
-- — o valor de verdade mora em relatorio_informacoes_capa, por competência.
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

create table public.obra_secao_campo_ativo (
  obra_id uuid not null references public.obra(id) on delete cascade,
  secao_chave text not null,
  campo_chave text not null,
  atualizado_em timestamptz not null default now(),
  primary key (obra_id, secao_chave, campo_chave)
);

alter table public.obra_secao_campo_ativo enable row level security;

create policy "usuario ve campos de secao das obras que acompanha"
  on public.obra_secao_campo_ativo for select
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = obra_secao_campo_ativo.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin ve todos os campos de secao ativos"
  on public.obra_secao_campo_ativo for select
  using (public.is_admin());

create policy "admin habilita campo de secao"
  on public.obra_secao_campo_ativo for insert
  with check (public.is_admin());

create policy "admin desabilita campo de secao"
  on public.obra_secao_campo_ativo for delete
  using (public.is_admin());
