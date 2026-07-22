-- Expande obra: terceiro escopo (administracao), terceiro tipo
-- (multipropriedade), e colunas estado/cidade. Depois, substitui as
-- 2 obras de exemplo pelas 20 obras reais.

alter table public.obra drop constraint if exists obra_tipo_check;
alter table public.obra add constraint obra_tipo_check
  check (tipo in ('incorporacao_vertical', 'urbanismo', 'multipropriedade'));

alter table public.obra drop constraint if exists obra_escopo_check;
alter table public.obra add constraint obra_escopo_check
  check (escopo in ('construcao', 'gerenciamento', 'administracao'));

alter table public.obra add column if not exists estado text;
alter table public.obra add column if not exists cidade text;

-- Remove as 2 obras de exemplo (dados incompletos/incorretos --
-- Guaya, por exemplo, tinha o tipo errado)
delete from public.obra where nome in ('Guaya Residencial Clube', 'Blend');

insert into public.obra (nome, tipo, escopo, estado, cidade) values
  ('Aura Novita', 'incorporacao_vertical', 'construcao', 'SC', 'Chapecó'),
  ('Golden Dolphin', 'multipropriedade', 'construcao', 'BA', 'Porto Seguro'),
  ('Botanica', 'incorporacao_vertical', 'gerenciamento', 'SP', 'Indaiatuba'),
  ('Liverpool', 'incorporacao_vertical', 'gerenciamento', 'SP', 'Sorocaba'),
  ('Londres', 'incorporacao_vertical', 'gerenciamento', 'SP', 'Sorocaba'),
  ('Maison', 'incorporacao_vertical', 'gerenciamento', 'SP', 'Sorocaba'),
  ('Be Bonifacio', 'incorporacao_vertical', 'gerenciamento', 'PR', 'Maringá'),
  ('Be Garden', 'incorporacao_vertical', 'gerenciamento', 'PR', 'Maringá'),
  ('Blend', 'incorporacao_vertical', 'gerenciamento', 'PR', 'Cascavel'),
  ('Inside', 'incorporacao_vertical', 'gerenciamento', 'PR', 'Cascavel'),
  ('Guaya', 'urbanismo', 'gerenciamento', 'SP', 'Lorena'),
  ('Santa Ines', 'urbanismo', 'gerenciamento', 'MA', 'Santa Inês'),
  ('Vila Mercedes', 'urbanismo', 'gerenciamento', 'MT', 'Varzea Grande'),
  ('Cond. É o Amor', 'urbanismo', 'gerenciamento', 'PR', 'Cascavel'),
  ('Marista 144 Spot', 'incorporacao_vertical', 'administracao', 'GO', 'Goiânia'),
  ('Louvre', 'incorporacao_vertical', 'gerenciamento', 'GO', 'Goiânia'),
  ('Gallery', 'incorporacao_vertical', 'gerenciamento', 'GO', 'Goiânia'),
  ('Link', 'incorporacao_vertical', 'gerenciamento', 'GO', 'Aparecida de Goiânia'),
  ('Mood', 'incorporacao_vertical', 'gerenciamento', 'GO', 'Aparecida de Goiânia'),
  ('Ed. Paulistano', 'incorporacao_vertical', 'gerenciamento', 'SP', 'São Paulo');

insert into public.obra_usuario (obra_id, usuario_id)
select o.id, u.id
from public.obra o, auth.users u
where u.email = 'mateusnunesmonteiro@gmail.com'
  and not exists (
    select 1 from public.obra_usuario ou
    where ou.obra_id = o.id and ou.usuario_id = u.id
  );
