# invoice-reminders — recordatorios de facturas por email (Resend)

Envía un recordatorio a los clientes con facturas **vencidas** (`status = 'sent'`
y `due_date` pasada). No hace spam: como mucho un recordatorio cada 7 días por
factura (columna `last_reminder_at`).

## Pasos para ponerla en marcha (tú, ~10 min)

### 1. Añade la columna de control (SQL Editor de Supabase)
```sql
alter table public.invoices
  add column if not exists last_reminder_at timestamptz;
```

### 2. Configura los secretos (terminal, en `akira-saas/`)
```bash
# La clave de Resend (NO la pegues en el chat)
supabase secrets set RESEND_API_KEY=re_tu_clave

# Remitente: usa tu dominio verificado en Resend.
# Para probar sin dominio propio, vale "AKIRA <onboarding@resend.dev>".
supabase secrets set RESEND_FROM="AKIRA <facturas@tudominio.com>"

# Un secreto aleatorio para que solo el cron pueda dispararla
supabase secrets set CRON_SECRET=$(openssl rand -hex 16)
```

### 3. Despliega la función
```bash
supabase functions deploy invoice-reminders
```

### 4. Pruébala una vez (manual)
```bash
# Sustituye <PROJECT_REF> y <CRON_SECRET> por los tuyos.
curl -i -X POST \
  "https://<PROJECT_REF>.functions.supabase.co/invoice-reminders" \
  -H "x-cron-secret: <CRON_SECRET>"
```
Devuelve un JSON: `{ candidates, sent, skipped, failures }`. Pégame ese JSON y
verificamos juntos que funciona.

### 5. Prográmala (diaria, 9:00) — SQL Editor
Requiere las extensiones `pg_cron` y `pg_net` (actívalas en Database → Extensions).
```sql
select cron.schedule(
  'invoice-reminders-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/invoice-reminders',
    headers := jsonb_build_object('x-cron-secret', '<CRON_SECRET>')
  );
  $$
);
```

## Ajustes
- Frecuencia entre recordatorios: constante `DAYS_BETWEEN_REMINDERS` en `index.ts`.
- Plantilla del email: función `buildEmail` en `index.ts`.
