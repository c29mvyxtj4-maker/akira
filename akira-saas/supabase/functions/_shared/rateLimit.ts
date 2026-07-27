// ============================================================================
//  Rate limiter compartido para las Edge Functions.
//
//  Ventana deslizante en memoria: cuenta las peticiones de una `key` (userId o
//  IP) en los últimos `windowMs` y bloquea si superan `limit`.
//
//  ⚠️ Limitación: la memoria es por instancia. Supabase puede escalar a varias
//  instancias, así que esto frena abuso básico pero no es un límite global
//  estricto. Para límites duros usa una tabla en Postgres o un KV externo.
// ============================================================================

const buckets = new Map<string, number[]>()

export interface RateLimitResult {
  limited: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(key: string, limit = 10, windowMs = 60_000): RateLimitResult {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  hits.push(now)
  buckets.set(key, hits)

  // Limpieza oportunista para que el Map no crezca sin control.
  if (buckets.size > 5000) {
    for (const [k, arr] of buckets) {
      if (arr.every((t) => now - t >= windowMs)) buckets.delete(k)
    }
  }

  const limited = hits.length > limit
  const retryAfterSec = limited ? Math.ceil((windowMs - (now - hits[0])) / 1000) : 0
  return { limited, remaining: Math.max(0, limit - hits.length), retryAfterSec }
}

// Deriva una clave de IP a partir de las cabeceras habituales de proxy.
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? 'unknown'
}
