<div align="center">

# AKIRA

**Plataforma SaaS de gestión de negocio para agencias y freelancers**

Clientes · Proyectos · Finanzas · Facturación · Portal de cliente · IA

[![CI](https://github.com/c29mvyxtj4-maker/akira/actions/workflows/ci.yml/badge.svg)](https://github.com/c29mvyxtj4-maker/akira/actions/workflows/ci.yml)

</div>

---

## ¿Qué es AKIRA?

AKIRA es una aplicación SaaS multi-tenant para gestionar toda la operativa de una
agencia o negocio de servicios: clientes, proyectos (tablero Kanban), finanzas,
facturas y presupuestos con PDF, seguimiento de tiempo, base de conocimiento,
un **portal de cliente** con pagos por Stripe y un asistente de **IA** (Gemini).

## ✨ Características

- **Clientes y CRM** — fichas, timeline, portal de acceso para cada cliente.
- **Proyectos** — tablero Kanban, progreso, plantillas de proyecto.
- **Finanzas** — categorías, previsiones, informes trimestrales en PDF.
- **Facturas y presupuestos** — generación de PDF, numeración, IVA.
- **Cobros con Stripe** — botón "Cobrar" y pago de facturas desde el portal.
- **Portal de cliente** — acceso sin contraseña (magic link), mensajes, archivos, aprobaciones.
- **Suscripciones** — seguimiento de servicios recurrentes.
- **Time tracking** — registro de horas por proyecto.
- **Base de conocimiento** — editor enriquecido (TipTap) con adjuntos.
- **IA (AKIRA Brain)** — asistente conversacional y acciones asistidas (Gemini).
- **Equipo / organizaciones** — invitaciones, roles y RLS multi-tenant.
- **Móvil (iOS)** — app nativa vía Capacitor + PWA.

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · Vite 8 (rolldown/oxc) · TailwindCSS 3 · Framer Motion |
| Backend | Supabase (PostgreSQL · Auth · Realtime · RLS · Edge Functions) |
| Pagos | Stripe (Checkout + Webhooks) |
| Email | Resend (recordatorios de factura) |
| IA | Google Generative AI (Gemini) |
| Editor | TipTap 3 |
| PDF | jsPDF + AutoTable |
| Móvil | Capacitor 8 (iOS) · PWA |
| Monitorización | Sentry |
| Tests | Vitest + jsdom |

## 🚀 Puesta en marcha

> La aplicación vive en el subdirectorio [`akira-saas/`](akira-saas/).

```bash
cd akira-saas
npm install
```

Crea un archivo `.env` en `akira-saas/` (ver `.env.example` si existe):

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Arranca el servidor de desarrollo (puerto **3000**):

```bash
npm run dev
```

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:watch` | Tests en modo watch |

## 📂 Estructura

```
akira-saas/
├── src/
│   ├── pages/            # Páginas (Dashboard, Clients, Finance, Settings…)
│   ├── components/       # UI, layout, charts y componentes por dominio
│   │   └── settings/     # Pestañas de configuración (una por archivo)
│   ├── services/         # Capa de acceso a datos (Supabase)
│   ├── context/          # Auth / Org / App context
│   ├── hooks/            # Hooks reutilizables
│   ├── lib/              # Cliente de Supabase
│   └── utils/            # PDF, CSV, helpers
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── create-checkout/    # Crea sesión de Stripe Checkout
│   │   ├── stripe-webhook/     # Confirma pagos (idempotente)
│   │   ├── invoice-reminders/  # Recordatorios por email (Resend)
│   │   └── _shared/            # Utilidades compartidas (rate limit)
│   └── migrations/       # Esquema y RLS versionados
└── ios/                  # App Capacitor
```

## 🔐 Backend y Edge Functions

Los pagos y tareas de servidor viven en **Supabase Edge Functions**:

- **`create-checkout`** — genera el enlace de Stripe Checkout (CORS restringido + rate limiting por usuario).
- **`stripe-webhook`** — marca facturas como pagadas/reembolsadas/en disputa; idempotente vía tabla `stripe_events`.
- **`invoice-reminders`** — envía recordatorios de facturas vencidas (protegido por `CRON_SECRET` + rate limiting por IP).

Consulta [`akira-saas/supabase/functions/STRIPE_README.md`](akira-saas/supabase/functions/STRIPE_README.md)
para el despliegue de Stripe y [`akira-saas/supabase/migrations/README.md`](akira-saas/supabase/migrations/README.md)
para las migraciones.

```bash
cd akira-saas
supabase db push                                   # aplica migraciones (esquema + RLS)
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy invoice-reminders
```

## ✅ Tests

```bash
cd akira-saas && npm test
```

La CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) ejecuta lint, build y tests en cada push y PR.

## 🛡️ Seguridad

- **Nunca** se commitea `.env` / `.env.local` (están en `.gitignore`).
- Aislamiento multi-tenant mediante **RLS** de Postgres (`owner_id` / `org_id`).
- Portal de cliente **sin contraseñas** (magic link OTP).
- HTML de la IA **sanitizado** con DOMPurify antes de renderizar.
- Webhook de Stripe **verificado por firma** e idempotente.

## 📦 Despliegue

El frontend se despliega en **Vercel** (config en `akira-saas/vercel.json`). El
backend (base de datos y funciones) se gestiona desde **Supabase**.

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.
