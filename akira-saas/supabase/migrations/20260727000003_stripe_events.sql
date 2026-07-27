-- ============================================================================
--  Migración: tabla de idempotencia para eventos de Stripe
--  El webhook registra cada event.id procesado para no actuar dos veces
--  (Stripe reintenta y puede reenviar el mismo evento).
-- ============================================================================

create table if not exists public.stripe_events (
  id           text primary key,          -- Stripe event.id (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

-- Solo el service_role (webhook) escribe aquí. Activamos RLS y NO creamos
-- políticas para clientes: nadie con anon/authenticated puede leer ni escribir.
alter table public.stripe_events enable row level security;
