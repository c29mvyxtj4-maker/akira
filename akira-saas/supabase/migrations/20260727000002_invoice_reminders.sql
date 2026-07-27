-- ============================================================================
--  Migración: soporte para recordatorios de facturas (invoice-reminders fn)
--  Añade la columna last_reminder_at que la Edge Function usa para no spamear.
--  Idempotente.
-- ============================================================================

alter table public.invoices
  add column if not exists last_reminder_at timestamptz;
