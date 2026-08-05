-- Tela de triagem de Ações (/painel/[id]/acoes): depois da reunião, o time
-- revisa cada rascunho registrado no Dashboard/Apresentação e preenche
-- responsável/prazo, marca como concluída. Status continua CALCULADO (não
-- vira coluna própria), a partir de concluido_em/prazo -- mesmo raciocínio
-- de relatorio_mensal não ter coluna de estado.
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

alter table public.acao_apresentacao
  add column responsavel text,
  add column prazo date,
  add column concluido_em date; -- date (não timestamptz): nunca exibido com
  -- hora, e mantém a formatação de data (split manual de string) livre do
  -- bug de new Date("AAAA-MM-DD") parsear como UTC meia-noite e virar o dia
  -- anterior em horário local (Brasil, UTC-3).

create policy "usuario atualiza acao da obra que acompanha"
  on public.acao_apresentacao for update
  using (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = acao_apresentacao.obra_id and ou.usuario_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = acao_apresentacao.obra_id and ou.usuario_id = auth.uid()
  ));

create policy "admin atualiza qualquer acao"
  on public.acao_apresentacao for update
  using (public.is_admin());

-- Lacuna descoberta ao montar a tela: acao_apresentacao.criado_por aponta
-- pra usuario, mas a RLS de usuario só deixa cada um ver o PRÓPRIO registro
-- (003_usuario_e_permissoes.sql) -- então "registrada por {nome}" ficava em
-- branco pra qualquer colega que não fosse quem criou a ação. Uma policy
-- direta (exists contra obra_usuario do colega) não funciona: obra_usuario
-- também só expõe os vínculos do PRÓPRIO usuário via RLS, então a subquery
-- filtraria o colega antes da policy avaliar. Precisa de security definer,
-- mesmo padrão de is_admin() (ver comentário em 005_papel_admin.sql).
create or replace function public.mesma_obra(outro_usuario_id uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.obra_usuario ou1
    join public.obra_usuario ou2 on ou1.obra_id = ou2.obra_id
    where ou1.usuario_id = outro_usuario_id
      and ou2.usuario_id = uid
  );
$$;

create policy "usuario ve nome de colegas da mesma obra"
  on public.usuario for select
  using (public.mesma_obra(id));
