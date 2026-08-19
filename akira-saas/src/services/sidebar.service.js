import { supabase } from '@/lib/supabase'

// ALL EVENT FETCHING MOVED TO SIDEBAR.COMPONENT TO BYPASS CACHE ISSUES
// DO NOT USE THIS FUNCTION - USE INLINE CODE IN SIDEBAR.JSX
export async function getUpcomingEventsFixed() {
  return []
}

// Obtener Àºltimas 10 páginas abiertas
export async function getRecentPages() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('page_visits')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent pages:', error)
    return []
  }
}

// Obtener movimientos de las Àºltimas 24h
export async function getActivity24h() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', user.org_id)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching 24h activity:', error)
    return []
  }
}

// Obtener favoritos
export async function getFavorites() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

// Agregar/remover favorito
export async function toggleFavorite(type, itemId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Verificar si ya es favorito
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', type)
      .eq('item_id', itemId)
      .single()

    if (existing) {
      // Remover favorito
      await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id)
      return false
    } else {
      // Agregar favorito
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          item_type: type,
          item_id: itemId,
        })
      return true
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return false
  }
}

// Obtener workspaces del usuario
export async function getUserWorkspaces() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[getUserWorkspaces] Auth user:', user?.id, user?.email)
    if (!user) {
      console.warn('[getUserWorkspaces] No authenticated user')
      return []
    }

    // Obtener company_settings para este usuario (owner_id = user.id)
    const { data: companySettings, error: csError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()

    console.log('[getUserWorkspaces] Company settings query:', { companySettings, csError })

    if (csError && csError.code !== '42703') {  // 42703 = column does not exist, try anyway
      console.error('[getUserWorkspaces] Company settings error:', csError)
      return []
    }

    if (!companySettings) {
      console.warn('[getUserWorkspaces] No company_settings found for user', user.id)
      return []
    }

    // Try to find org_id in company_settings (could be org_id, org_id_explicit, etc)
    const org_id = companySettings.org_id || companySettings.org_id_explicit
    if (!org_id) {
      console.warn('[getUserWorkspaces] No org_id found in company_settings:', Object.keys(companySettings))
      return []
    }

    console.log('[getUserWorkspaces] Found org_id:', org_id)

    // Obtener la organización
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', org_id)
      .single()

    console.log('[getUserWorkspaces] Organization query result:', { org, orgError })

    if (orgError) {
      console.error('[getUserWorkspaces] Error fetching organization:', orgError)
      return []
    }

    console.log('[getUserWorkspaces] Returning org:', org)
    return org ? [org] : []
  } catch (error) {
    console.error('[getUserWorkspaces] Exception:', error)
    return []
  }
}

// Obtener todos los clientes (para mostrar en recientes por orden de apertura)
export async function getRecentClients() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('archived', false)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

// Obtener todos los proyectos (para mostrar en recientes por orden de apertura)
export async function getRecentProjects() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('archived', false)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

