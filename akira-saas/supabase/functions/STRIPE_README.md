# Cobros con Stripe — create-checkout + stripe-webhook

Flujo: en una factura, botón **"Cobrar"** → genera un enlace de Stripe Checkout →
se lo pasas al cliente (se copia al portapapeles y se abre) → cuando paga, el
**webhook** marca la factura como `paid` automáticamente.

## Pasos para ponerlo en marcha (tú)

### 1. Secretos (terminal, en `akira-saas/`)
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...        # modo test primero
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...      # lo obtienes en el paso 3
```

### 2. Despliega las funciones
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt   # ⚠️ Stripe no envía JWT
```

### 3. Registra el webhook en Stripe
- Stripe Dashboard → *Developers → Webhooks → Add endpoint*.
- URL: `https://<PROJECT_REF>.functions.supabase.co/stripe-webhook`
- Evento: **`checkout.session.completed`**.
- Copia el *Signing secret* (`whsec_...`) y ponlo como `STRIPE_WEBHOOK_SECRET`
  (paso 1), luego **redeploy** de `stripe-webhook`.

### 4. Prueba (modo test)
- En AKIRA, abre una factura no pagada → **Cobrar** → se abre Checkout.
- Paga con la tarjeta de prueba `4242 4242 4242 4242` (cualquier fecha futura / CVC).
- La factura debe pasar a **Pagada** sola (vía webhook). Si no, revisa los logs:
  `supabase functions logs stripe-webhook`.

### 5. Pasar a producción
- Cambia las claves `sk_test_...` → `sk_live_...` y crea el webhook en modo *live*.

## Notas
- Moneda fija: EUR. Cámbiala en `create-checkout/index.ts` (`currency`).
- El importe se toma de `invoices.total`.
- (Opcional) Si quieres guardar la fecha de pago, añade la columna
  `alter table invoices add column if not exists paid_at timestamptz;`
  y actualízala también en `stripe-webhook`.
