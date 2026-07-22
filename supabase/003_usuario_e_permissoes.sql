-- Tabela usuario (espelha auth.users) + permissões de admin (Mateus)
-- pra Cadastros e Acessos

create table if not exists public.usuario (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  contato text,
  criado_em timestamptz not null default now()
);

alter table public.usuario enable row level security;

create policy "mateus ve todos os usuarios"
  on public.usuario for select
  using (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');

create policy "usuario ve o proprio registro"
  on public.usuario for select
  using (id = auth.uid());

-- Preenche usuario automaticamente a cada novo cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuario (id, email, nome, contato)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'contato'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Preenche quem já existe (o Mateus)
insert into public.usuario (id, email, nome, contato)
select id, email, raw_user_meta_data ->> 'nome', raw_user_meta_data ->> 'contato'
from auth.users
on conflict (id) do nothing;

-- Permissões: só o Mateus cria/edita obra e gerencia acessos, por
-- enquanto (não temos papéis/roles ainda)
create policy "mateus insere obra"
  on public.obra for insert
  with check (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');

create policy "mateus atualiza obra"
  on public.obra for update
  using (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');

create policy "mateus vincula acesso"
  on public.obra_usuario for insert
  with check (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');

create policy "mateus remove acesso"
  on public.obra_usuario for delete
  using (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');
