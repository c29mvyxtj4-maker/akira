import { supabase } from '@/lib/supabase'

// Tier a usar cuando una org no tiene 'plan' asignado (no debería pasar, ya
// que la columna tiene DEFAULT 'starter', pero por si acaso).
var FALLBACK_TIER = 'starter'

export async function getOrgPlan(orgId) {
  if (!orgId) return FALLBACK_TIER
  var res = await supabase.from('organizations').select('plan').eq('id', orgId).single()
  if (res.error) throw res.error
  return (res.data && res.data.plan) || FALLBACK_TIER
}

export async function getFeatureLimits(tier) {
  var res = await supabase.from('feature_limits').select('*').eq('tier', tier || FALLBACK_TIER)
  if (res.error) throw res.error
  return res.data || []
}

export async function getFeatureLimit(tier, featureName) {
  var res = await supabase
    .from('feature_limits')
    .select('*')
    .eq('tier', tier || FALLBACK_TIER)
    .eq('feature_name', featureName)
    .maybeSingle()
  if (res.error) throw res.error
  return res.data || null
}

export async function getUsageCount(orgId, featureName) {
  if (!orgId) return 0
  var res = await supabase
    .from('feature_usage')
    .select('usage_count')
    .eq('org_id', orgId)
    .eq('feature_name', featureName)
    .maybeSingle()
  if (res.error) throw res.error
  return (res.data && res.data.usage_count) || 0
}

export async function setUsageCount(orgId, featureName, count) {
  var res = await supabase.from('feature_usage').upsert({
    org_id:          orgId,
    feature_name:    featureName,
    usage_count:     count,
    last_checked_at: new Date().toISOString(),
    updated_at:      new Date().toISOString(),
  }, { onConflict: 'org_id,feature_name' }).select().single()
  if (res.error) throw res.error
  return res.data
}

// Resuelve si una org puede usar `featureName`. Si `currentUsage` se pasa,
// también valida contra el limit_value numerico de la tier (p.ej. max_projects).
// Devuelve { allowed, enabled, limit, tier, feature }.
export async function checkFeatureAccess(orgId, featureName, currentUsage) {
  var tier  = await getOrgPlan(orgId)
  var limit = await getFeatureLimit(tier, featureName)

  // Sin fila de config para esta feature/tier: no bloqueamos (fail-open),
  // ya que solo las features listadas en feature_limits están gateadas.
  if (!limit) return { allowed: true, enabled: true, limit: null, tier: tier, feature: featureName }

  if (!limit.enabled) {
    return { allowed: false, enabled: false, limit: limit.limit_value, tier: tier, feature: featureName }
  }

  if (limit.limit_value != null && typeof currentUsage === 'number' && currentUsage >= limit.limit_value) {
    return { allowed: false, enabled: true, limit: limit.limit_value, tier: tier, feature: featureName }
  }

  return { allowed: true, enabled: true, limit: limit.limit_value, tier: tier, feature: featureName }
}
