import { supabase } from '@/lib/supabase'

// Obtener próximos eventos del calendario - COMPLETELY REWRITTEN
// Using start_at field only (not start_time which doesn't exist)
export async function getUpcomingEventsFixed() {
  try {
    const orgId = localStorage.getItem('akira-active-org')
    console.log('SIDEBAR SERVICE: Fetching events for org:', orgId)
    if (!orgId) {
      console.log('SIDEBAR SERVICE: No org ID, returning empty')
      return []
    }

    // Query with start_at field (correct field name)
    const { data, error } = await supabase
      .from('calendar_events')
      .select('id, title, start_at, org_id')
      .eq('org_id', orgId)
      .isNotNull('start_at')
      .order('start_at', { ascending: true })
      .limit(10)

    console.log('SIDEBAR SERVICE: Raw data returned:', { data, error })

    if (error) {
      console.error('SIDEBAR SERVICE: Query error:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.log('SIDEBAR SERVICE: No data returned')
      return []
    }

    const now = new Date()
    const futureEvents = data.filter(event => {
      const eventDate = new Date(event.start_at)
      const isFuture = eventDate > now
      console.log('SIDEBAR SERVICE: Checking event', event.id, '- date:', event.start_at, '- isFuture:', isFuture)
      return isFuture
    })

    console.log('SIDEBAR SERVICE: Returning', futureEvents.length, 'future events')
    return futureEvents.slice(0, 5)
  } catch (error) {
    console.error('SIDEBAR SERVICE: Exception:', error)
    return []
  }
}

// Obtener últimas 10 páginas abiertas
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

// Obtener movimientos de las últimas 24h
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
    if (!user) return []

    const { data, error } = await supabase
      .from('organization_members')
      .select('organizations(*)')
      .eq('user_id', user.id)

    if (error) throw error
    return data?.map(m => m.organizations) || []
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }
}
