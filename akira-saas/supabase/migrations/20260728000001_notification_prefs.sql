-- ============================================================================
--  Migración: nuevas preferencias de notificación en company_settings
--  Añaden más tipos de aviso a la campana / email. Idempotente.
-- ============================================================================

alter table public.company_settings
  add column if not exists notify_invoice_paid       boolean not null default true,
  add column if not exists notify_new_portal_message boolean not null default true,
  add column if not exists notify_project_deadline   boolean not null default true,
  add column if not exists notify_approval_response  boolean not null default true,
  add column if not exists notify_weekly_summary     boolean not null default false,
  add column if not exists project_deadline_days     integer not null default 3;
