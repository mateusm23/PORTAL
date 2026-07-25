  -- Relatório Mensal: separado de Informações Gerais (que é estático e já
  -- vive em obra_campo_ativo/obra_info_fixa, ver 006_campos_obra.sql). Aqui é
  -- dinâmico, por competência (mês/ano), com cada seção finalizando por conta
  -- própria — não existe um "finalizar" único pro relatório inteiro.
  -- Rodar no SQL Editor do Supabase (projeto GESTAO-GERENCIADORA).

  -- relatorio_mensal: a "casca" do relatório de uma obra num mês. Sem coluna
  -- de estado — o relatório mais recente de cada obra é o único editável
  -- (comparado por competencia); os anteriores viram histórico automaticamente
  -- assim que um novo é criado. Não tem update nem delete de propósito.
  create table public.relatorio_mensal (
    id uuid primary key default gen_random_uuid(),
    obra_id uuid not null references public.obra(id) on delete cascade,
    competencia date not null, -- sempre o dia 1 do mês
    criado_por uuid references public.usuario(id),
    criado_em timestamptz not null default now(),
    unique (obra_id, competencia)
  );

  alter table public.relatorio_mensal enable row level security;

  create policy "usuario ve relatorios das obras que acompanha"
    on public.relatorio_mensal for select
    using (exists (
      select 1 from public.obra_usuario ou
      where ou.obra_id = relatorio_mensal.obra_id and ou.usuario_id = auth.uid()
    ));

  create policy "admin ve todos os relatorios"
    on public.relatorio_mensal for select
    using (public.is_admin());

  -- é o engenheiro (não só admin) que lança "Desenvolver novo Relatório"
  create policy "usuario cria relatorio da obra que acompanha"
    on public.relatorio_mensal for insert
    with check (exists (
      select 1 from public.obra_usuario ou
      where ou.obra_id = relatorio_mensal.obra_id and ou.usuario_id = auth.uid()
    ));

  -- relatorio_secao_status: progresso de cada seção do relatório (finalizada
  -- ou não) + timestamps pra futura análise de gargalo (qual seção demora
  -- mais). "editado" não é coluna — é derivado no código como
  -- `primeira_edicao_em !== null`. secao_chave é validado no código contra
  -- src/lib/relatorioSecoesCatalogo.ts, sem enum no banco, mesmo motivo de
  -- obra_campo_ativo.campo_chave (crescer sem precisar de migration nova).
  create table public.relatorio_secao_status (
    relatorio_id uuid not null references public.relatorio_mensal(id) on delete cascade,
    secao_chave text not null,
    finalizado boolean not null default false,
    primeira_edicao_em timestamptz,
    ultima_edicao_em timestamptz,
    finalizado_em timestamptz,
    atualizado_por uuid references public.usuario(id),
    primary key (relatorio_id, secao_chave)
  );

  alter table public.relatorio_secao_status enable row level security;

  create policy "usuario ve status de secoes das obras que acompanha"
    on public.relatorio_secao_status for select
    using (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_secao_status.relatorio_id and ou.usuario_id = auth.uid()
    ));

  create policy "admin ve todo status de secao"
    on public.relatorio_secao_status for select
    using (public.is_admin());

  -- só no relatório MAIS RECENTE da obra -- é isso que trava o mês anterior
  -- assim que o próximo é criado, sem depender só da UI esconder o botão
  create policy "usuario cria status de secao do relatorio mais recente"
    on public.relatorio_secao_status for insert
    with check (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_secao_status.relatorio_id
        and ou.usuario_id = auth.uid()
        and rm.competencia = (select max(competencia) from public.relatorio_mensal where obra_id = rm.obra_id)
    ));

  create policy "usuario atualiza status de secao do relatorio mais recente"
    on public.relatorio_secao_status for update
    using (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_secao_status.relatorio_id
        and ou.usuario_id = auth.uid()
        and rm.competencia = (select max(competencia) from public.relatorio_mensal where obra_id = rm.obra_id)
    ));

  -- relatorio_informacoes_capa: campos de verdade da seção "Informações da
  -- Capa" (única seção do relatório com formulário pronto até agora).
  create table public.relatorio_informacoes_capa (
    relatorio_id uuid primary key references public.relatorio_mensal(id) on delete cascade,
    cliente_contratante text,
    responsavel_tecnico text,
    registro_profissional text,
    logotipo_url text,
    atualizado_por uuid references public.usuario(id),
    atualizado_em timestamptz not null default now()
  );

  alter table public.relatorio_informacoes_capa enable row level security;

  create policy "usuario ve informacoes da capa das obras que acompanha"
    on public.relatorio_informacoes_capa for select
    using (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_informacoes_capa.relatorio_id and ou.usuario_id = auth.uid()
    ));

  create policy "admin ve todas as informacoes da capa"
    on public.relatorio_informacoes_capa for select
    using (public.is_admin());

  create policy "usuario cria informacoes da capa do relatorio mais recente"
    on public.relatorio_informacoes_capa for insert
    with check (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_informacoes_capa.relatorio_id
        and ou.usuario_id = auth.uid()
        and rm.competencia = (select max(competencia) from public.relatorio_mensal where obra_id = rm.obra_id)
    ));

  create policy "usuario atualiza informacoes da capa do relatorio mais recente"
    on public.relatorio_informacoes_capa for update
    using (exists (
      select 1 from public.relatorio_mensal rm
      join public.obra_usuario ou on ou.obra_id = rm.obra_id
      where rm.id = relatorio_informacoes_capa.relatorio_id
        and ou.usuario_id = auth.uid()
        and rm.competencia = (select max(competencia) from public.relatorio_mensal where obra_id = rm.obra_id)
    ));

  -- logotipo do cliente reaproveita o bucket "obras" já existente, caminho
  -- {obra_id}/relatorios/{competencia}/logotipo-cliente.<ext> — como o
  -- primeiro segmento do caminho continua sendo {obra_id}, as políticas de
  -- storage já criadas em 006_campos_obra.sql ("usuario envia/substitui foto
  -- da obra que acompanha") já cobrem esse caso, sem precisar de política nova.
