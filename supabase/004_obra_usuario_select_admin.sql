-- Corrige lacuna real: obra_usuario só tinha a política "usuario ve
-- seus proprios vinculos" (usuario_id = auth.uid()). Isso impedia o
-- admin de enxergar os vínculos de QUALQUER outro usuário, fazendo a
-- tela de Acessos (Usuários x Obras) mostrar "sem acesso" pra todo
-- mundo que não fosse o próprio Mateus, mesmo quando já tinha acesso.
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

create policy "mateus ve todos os vinculos"
  on public.obra_usuario for select
  using (auth.jwt() ->> 'email' = 'mateusnunesmonteiro@gmail.com');
