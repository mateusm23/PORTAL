-- Tabela núcleo: obra + controle de acesso por usuário
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA)

create table if not exists public.obra (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('incorporacao_vertical', 'urbanismo')),
  escopo text not null check (escopo in ('construcao', 'gerenciamento')),
  status text not null default 'ativa' check (status in ('ativa', 'concluida', 'pausada')),
  criado_em timestamptz not null default now()
);

create table if not exists public.obra_usuario (
  obra_id uuid not null references public.obra(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  primary key (obra_id, usuario_id)
);

alter table public.obra enable row level security;
alter table public.obra_usuario enable row level security;

create policy "usuario ve obras que acompanha"
  on public.obra for select
  using (
    exists (
      select 1 from public.obra_usuario ou
      where ou.obra_id = obra.id and ou.usuario_id = auth.uid()
    )
  );

create policy "usuario ve seus proprios vinculos"
  on public.obra_usuario for select
  using (usuario_id = auth.uid());

-- Semente: obras reais + acesso liberado pro Mateus
insert into public.obra (nome, tipo, escopo) values
  ('Guaya Residencial Clube', 'incorporacao_vertical', 'gerenciamento'),
  ('Blend', 'incorporacao_vertical', 'gerenciamento');

insert into public.obra_usuario (obra_id, usuario_id)
select o.id, u.id
from public.obra o, auth.users u
where u.email = 'mateusnunesmonteiro@gmail.com';
