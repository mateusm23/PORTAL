-- Substitui o admin fixo por email (hardcoded nas políticas) por uma
-- coluna de verdade, que pode ser promovida/rebaixada pelo próprio
-- app na tela de Acessos. Rodar no SQL Editor do Supabase (projeto
-- GESTAO-GERENCIADORA).

alter table public.usuario add column if not exists is_admin boolean not null default false;

update public.usuario set is_admin = true
where email = 'mateusnunesmonteiro@gmail.com';

-- security definer: evita recursão de RLS ao checar is_admin dentro
-- das próprias políticas da tabela usuario (mesmo padrão de
-- handle_new_user() em 003_usuario_e_permissoes.sql)
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select u.is_admin from public.usuario u where u.id = uid), false);
$$;

-- troca as políticas antigas (email fixo) pelas novas (is_admin)

drop policy if exists "mateus ve todos os usuarios" on public.usuario;
create policy "admin ve todos os usuarios"
  on public.usuario for select
  using (public.is_admin());

drop policy if exists "mateus insere obra" on public.obra;
create policy "admin insere obra"
  on public.obra for insert
  with check (public.is_admin());

drop policy if exists "mateus atualiza obra" on public.obra;
create policy "admin atualiza obra"
  on public.obra for update
  using (public.is_admin());

drop policy if exists "mateus vincula acesso" on public.obra_usuario;
create policy "admin vincula acesso"
  on public.obra_usuario for insert
  with check (public.is_admin());

drop policy if exists "mateus remove acesso" on public.obra_usuario;
create policy "admin remove acesso"
  on public.obra_usuario for delete
  using (public.is_admin());

drop policy if exists "mateus ve todos os vinculos" on public.obra_usuario;
create policy "admin ve todos os vinculos"
  on public.obra_usuario for select
  using (public.is_admin());

-- nova: admin pode promover/rebaixar outros usuários (is_admin) e
-- editar nome/contato de qualquer um
create policy "admin atualiza usuario"
  on public.usuario for update
  using (public.is_admin())
  with check (public.is_admin());
