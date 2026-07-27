# Migraciones de Supabase

A partir de ahora los cambios de esquema y RLS se versionan aquí en vez de
aplicarse solo desde el dashboard.

## ⚠️ Baseline pendiente

El esquema histórico de AKIRA (tablas `clients`, `invoices`, `projects`,
`portal_*`, `kb_*`, etc.) se creó directamente en el dashboard de Supabase y
**todavía no está capturado como migración**. Para tener una fuente de verdad
reproducible, ejecuta una vez (con el proyecto enlazado):

```bash
supabase link --project-ref <PROJECT_REF>
supabase db pull            # genera la migración baseline del esquema actual
```

Colócala con un timestamp anterior a las de abajo.

## Migraciones en este repo

| Archivo | Qué hace |
|---------|----------|
| `20260727000001_rls_fixes.sql` | Correcciones de RLS (antes en `scripts/rls-fixes.sql`): `is_org_admin`, políticas de `org_members` / `org_invitations` / `profiles` / `kb_document_views`. |
| `20260727000002_invoice_reminders.sql` | Columna `invoices.last_reminder_at` para la función `invoice-reminders`. |
| `20260727000003_stripe_events.sql` | Tabla `stripe_events` para idempotencia del webhook de Stripe. |

## Aplicar

```bash
supabase db push
```

Todas son idempotentes salvo el baseline.
