/**
 * Monitorización de errores (Sentry) — opcional y sin bloquear.
 *
 * Solo se activa si defines VITE_SENTRY_DSN en el .env (y en Vercel).
 * Sin DSN, todo esto es un no-op: la app funciona igual y no envía nada.
 *
 * Para activarlo:
 *   1. Crea un proyecto en https://sentry.io (React).
 *   2. Copia el DSN y añádelo como VITE_SENTRY_DSN (local y en Vercel → Env Vars).
 */
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

export const sentryEnabled = Boolean(dsn)

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Muestra de trazas de rendimiento (ajústalo según volumen).
    tracesSampleRate: 0.1,
    // No enviar en desarrollo salvo que lo quieras explícitamente.
    enabled: import.meta.env.PROD,
  })
}

/**
 * Captura un error en Sentry si está configurado; si no, no hace nada.
 * @param {unknown} error
 * @param {Record<string, unknown>} [context] Datos extra para depurar.
 */
export function captureError(error, context) {
  if (sentryEnabled) {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  }
}
