-- Desacopla "editável" de "é o relatório mais recente" (regra antiga, ver
-- 007_relatorio_mensal.sql). Antes, um relatorio_mensal só era editável
-- enquanto fosse o de maior competencia da obra -- sem coluna de estado
-- nenhuma. Isso impedia voltar depois e preencher um mês que ficou pra
-- trás (obra parada, mês esquecido), porque o relatório retroativo nasceria
-- automaticamente travado (já existiria algo mais novo).
--
-- Agora "editável" vira estado explícito: um relatório fica aberto até
-- alguém fechar o mês manualmente (qualquer usuário vinculado à obra);
-- depois de fechado, só admin reabre. Pode existir mais de um relatório
-- aberto ao mesmo tempo na mesma obra.
-- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

alter table public.relatorio_mensal
  add column travado_em timestamptz,
  add column travado_por uuid references public.usuario(id),
  add column reaberto_em timestamptz,
  add column reaberto_por uuid references public.usuario(id);

-- usuário vinculado à obra fecha um relatório que ainda está aberto --
-- using trava a linha OLD (só pega relatório destravado), with check trava
-- a linha NEW (só permite ir pra travado) -- não dá pra usar essa policy
-- pra reabrir.
create policy "usuario fecha relatorio que acompanha"
  on public.relatorio_mensal for update
  using (
    travado_em is null
    and exists (select 1 from public.obra_usuario ou where ou.obra_id = relatorio_mensal.obra_id and ou.usuario_id = auth.uid())
  )
  with check (travado_em is not null);

-- só admin reabre um relatório já travado -- mesma lógica invertida
create policy "admin reabre relatorio"
  on public.relatorio_mensal for update
  using (travado_em is not null and public.is_admin())
  with check (travado_em is null);

-- relatorio_secao_status: troca "sou o relatório mais recente" por "não
-- estou travado" nas 2 policies de escrita (as de select não mudam).
drop policy "usuario cria status de secao do relatorio mais recente" on public.relatorio_secao_status;
create policy "usuario cria status de secao de relatorio aberto"
  on public.relatorio_secao_status for insert
  with check (exists (
    select 1 from public.relatorio_mensal rm
    join public.obra_usuario ou on ou.obra_id = rm.obra_id
    where rm.id = relatorio_secao_status.relatorio_id
      and ou.usuario_id = auth.uid()
      and rm.travado_em is null
  ));

drop policy "usuario atualiza status de secao do relatorio mais recente" on public.relatorio_secao_status;
create policy "usuario atualiza status de secao de relatorio aberto"
  on public.relatorio_secao_status for update
  using (exists (
    select 1 from public.relatorio_mensal rm
    join public.obra_usuario ou on ou.obra_id = rm.obra_id
    where rm.id = relatorio_secao_status.relatorio_id
      and ou.usuario_id = auth.uid()
      and rm.travado_em is null
  ));

-- relatorio_informacoes_capa: mesma troca.
drop policy "usuario cria informacoes da capa do relatorio mais recente" on public.relatorio_informacoes_capa;
create policy "usuario cria informacoes da capa de relatorio aberto"
  on public.relatorio_informacoes_capa for insert
  with check (exists (
    select 1 from public.relatorio_mensal rm
    join public.obra_usuario ou on ou.obra_id = rm.obra_id
    where rm.id = relatorio_informacoes_capa.relatorio_id
      and ou.usuario_id = auth.uid()
      and rm.travado_em is null
  ));

drop policy "usuario atualiza informacoes da capa do relatorio mais recente" on public.relatorio_informacoes_capa;
create policy "usuario atualiza informacoes da capa de relatorio aberto"
  on public.relatorio_informacoes_capa for update
  using (exists (
    select 1 from public.relatorio_mensal rm
    join public.obra_usuario ou on ou.obra_id = rm.obra_id
    where rm.id = relatorio_informacoes_capa.relatorio_id
      and ou.usuario_id = auth.uid()
      and rm.travado_em is null
  ));
