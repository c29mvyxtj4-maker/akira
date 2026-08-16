/*
 * Espacio de trabajo (workspace/org) activo. La id se guarda en localStorage
 * por OrgContext. Los servicios/hooks la leen desde aquí para filtrar los datos
 * por workspace.
 *
 * Patrón DEFENSIVO: si no hay workspace activo conocido, devuelve null y quien
 * llama NO aplica el filtro (se comporta como antes, con RLS por owner). Así el
 * aislamiento nunca puede dejar la app vacía por un fallo de temporización.
 */
var LS_KEY = 'akira-active-org'

export function getActiveOrgId() {
  try {
    var v = localStorage.getItem(LS_KEY)
    return v || null
  } catch (_) {
    return null
  }
}

// Aplica el filtro de workspace a una query de supabase, sólo si se conoce.
export function scopeToOrg(query) {
  var orgId = getActiveOrgId()
  return orgId ? query.eq('org_id', orgId) : query
}
