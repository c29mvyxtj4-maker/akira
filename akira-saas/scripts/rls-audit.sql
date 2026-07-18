-- ============================================================================
--  AUDITORÍA DE RLS — AKIRA
--  Pégalo en Supabase → SQL Editor y ejecútalo. Es de SOLO LECTURA
--  (consulta catálogos del sistema); no modifica nada.
--
--  Contexto: la app confía la seguridad ENTERAMENTE a RLS. Por ejemplo,
--  getClients() no filtra por owner_id — asume que RLS lo hace. Por eso cada
--  tabla DEBE tener RLS activada y una política que limite por owner_id/user_id/org.
-- ============================================================================

-- 1) VISTA GENERAL — el veredicto por tabla (empieza por aquí)
--    Ordena primero lo peligroso: RLS desactivada o sin políticas.
select
  c.relname                              as tabla,
  c.relrowsecurity                       as rls_activada,
  count(p.policyname)                    as politicas,
  case
    when not c.relrowsecurity
      then '🔴 RLS DESACTIVADA — cualquier usuario logueado podría leer todo'
    when count(p.policyname) = 0
      then '🟠 RLS activa pero SIN políticas — bloquea todo (revisar intención)'
    else '🟢 OK — RLS + ' || count(p.policyname) || ' política(s)'
  end                                     as veredicto
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname
where n.nspname = 'public'
  and c.relkind = 'r'                    -- solo tablas
group by c.relname, c.relrowsecurity
order by c.relrowsecurity asc, politicas asc, tabla;


-- 2) DETALLE DE POLÍTICAS — qué permite exactamente cada una
--    Revisa que 'qual' limite por auth.uid() (owner_id = auth.uid(), etc.)
select
  tablename          as tabla,
  policyname         as politica,
  cmd                as operacion,     -- SELECT / INSERT / UPDATE / DELETE / ALL
  roles              as roles,
  qual               as condicion_lectura,      -- USING (...)
  with_check         as condicion_escritura     -- WITH CHECK (...)
from pg_policies
where schemaname = 'public'
order by tablename, cmd;


-- 3) COLUMNAS DE PROPIEDAD DISPONIBLES POR TABLA
--    Para saber por qué columna debería aislar cada política.
select table_name as tabla, column_name as columna
from information_schema.columns
where table_schema = 'public'
  and column_name in ('owner_id', 'user_id', 'org_id', 'organization_id', 'client_id')
order by table_name, column_name;


-- ============================================================================
--  PLANTILLA DE REMEDIACIÓN  (NO ejecutar sin adaptar)
--  Para cada tabla que salga 🔴 o 🟠 en la consulta 1, activa RLS y crea las
--  políticas usando SU columna de propiedad real (owner_id / user_id / org).
--  Ejemplo para una tabla aislada por owner_id:
-- ============================================================================
--
--  alter table public.NOMBRE_TABLA enable row level security;
--
--  create policy "propietario_lee"   on public.NOMBRE_TABLA
--    for select using (owner_id = auth.uid());
--  create policy "propietario_inserta" on public.NOMBRE_TABLA
--    for insert with check (owner_id = auth.uid());
--  create policy "propietario_edita"  on public.NOMBRE_TABLA
--    for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
--  create policy "propietario_borra"  on public.NOMBRE_TABLA
--    for delete using (owner_id = auth.uid());
--
--  Para tablas de organización, sustituye la condición por pertenencia:
--    using (org_id in (select org_id from org_members where user_id = auth.uid()))
-- ============================================================================
