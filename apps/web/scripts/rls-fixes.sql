-- ============================================================================
--  CORRECCIONES DE RLS — AKIRA
--  Ejecutar en Supabase → SQL Editor. Corrige las 4 políticas con fallo
--  detectadas en la auditoría. Es idempotente (se puede ejecutar varias veces).
--
--  IMPORTANTE: las tablas de negocio (clients, invoices, projects, finance_*,
--  time_entries, portal, kb…) YA estaban bien. Esto solo arregla:
--    - org_members / org_invitations : bug "m.org_id = m.org_id"
--    - profiles                       : insert con with_check = true
--    - kb_document_views              : all con with_check = true
-- ============================================================================

-- ── Helper: ¿es el usuario actual owner/admin de ESTA organización? ──────────
-- SECURITY DEFINER evita la recursión infinita al consultar org_members desde
-- una política de la propia tabla org_members.
create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- ── org_members : atar la comprobación a la organización de la fila ──────────
alter policy "members: admin can insert" on public.org_members
  with check (public.is_org_admin(org_id));

alter policy "members: admin can update" on public.org_members
  using (public.is_org_admin(org_id));

-- ── org_invitations : mismo arreglo ─────────────────────────────────────────
alter policy "invitations: admin can insert" on public.org_invitations
  with check (public.is_org_admin(org_id));

alter policy "invitations: admin can update" on public.org_invitations
  using (public.is_org_admin(org_id));

-- ── profiles : un usuario solo puede insertar SU propio perfil ──────────────
-- (En Supabase profiles.id = auth.users.id. Verifica el nombre de la PK si falla.)
alter policy "profiles: service can insert" on public.profiles
  with check (id = auth.uid());

-- ── kb_document_views : que la escritura respete el mismo alcance que la lectura
alter policy "kb_document_views: own" on public.kb_document_views
  with check (
    auth.uid() = viewer_id
    or exists (
      select 1 from public.kb_documents d
      where d.id = kb_document_views.document_id
        and d.owner_id = auth.uid()
    )
  );

-- ── Comprobación posterior: no deberían quedar filas "sospechosas" salvo
--    las seguras conocidas (audit_log/portal con with_check heredado). ────────
-- (Reejecuta la consulta de auditoría de políticas para confirmar.)
