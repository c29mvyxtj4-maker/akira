import { supabase } from '@/lib/supabase'

// WORKSPACES
export async function getWorkspaces() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[Notion] Error fetching workspaces:', error.message)
    return []
  }

  return data || []
}

export async function createWorkspace(name, icon = '📦') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user authenticated')

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ org_id: user.id, name, icon }])
    .select()

  if (error) {
    console.error('[Notion] Error creating workspace:', error)
    throw error
  }
  return data?.[0]
}

// TEAMSPACES
export async function getTeamspaces(workspaceId) {
  const { data, error } = await supabase
    .from('teamspaces')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[Notion] Error fetching teamspaces:', error.message)
    return []
  }

  return data || []
}

export async function createTeamspace(workspaceId, name) {
  const { data, error } = await supabase
    .from('teamspaces')
    .insert([{ workspace_id: workspaceId, name }])
    .select()

  if (error) throw error
  return data?.[0]
}

// PAGES
export async function getPages(teamspaceId, parentId = null) {
  const { data, error } = await supabase
    .from('notion_pages')
    .select('*')
    .eq('teamspace_id', teamspaceId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.warn('[Notion] Error fetching pages:', error.message)
    return []
  }

  // Filtrar por parentId en JS para evitar problemas de RLS
  if (parentId) {
    return data?.filter(p => p.parent_id === parentId) || []
  }

  return data || []
}

export async function getPage(pageId) {
  const { data, error } = await supabase
    .from('notion_pages')
    .select('*')
    .eq('id', pageId)
    .single()

  if (error) {
    console.warn('[Notion] Error fetching page:', error.message)
    return null
  }

  return data
}

export async function createPage(teamspaceId, title = 'Untitled', icon = '📄') {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('notion_pages')
    .insert([{
      teamspace_id: teamspaceId,
      title,
      icon,
      created_by: user.id,
    }])
    .select()

  if (error) throw error
  return data?.[0]
}

export async function updatePage(pageId, updates) {
  const { data, error } = await supabase
    .from('notion_pages')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', pageId)
    .select()

  if (error) throw error
  return data?.[0]
}

// BLOCKS
export async function getBlocks(pageId) {
  const { data, error } = await supabase
    .from('notion_blocks')
    .select('*')
    .eq('page_id', pageId)
    .order('"order"', { ascending: true })

  if (error) {
    console.warn('[Notion] Error fetching blocks:', error.message)
    return []
  }

  return data || []
}

export async function createBlock(pageId, type, content = {}, order = 0, parentBlockId = null) {
  const { data, error } = await supabase
    .from('notion_blocks')
    .insert([{
      page_id: pageId,
      type,
      content,
      order,
      parent_block_id: parentBlockId,
    }])
    .select()

  if (error) throw error
  return data?.[0]
}

export async function updateBlock(blockId, updates) {
  const { data, error } = await supabase
    .from('notion_blocks')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', blockId)
    .select()

  if (error) throw error
  return data?.[0]
}

export async function deleteBlock(blockId) {
  const { error } = await supabase
    .from('notion_blocks')
    .delete()
    .eq('id', blockId)

  if (error) throw error
}

export async function reorderBlocks(pageId, blockIds) {
  const updates = blockIds.map((id, index) => ({
    id,
    order: index,
  }))

  for (const update of updates) {
    await updateBlock(update.id, { order: update.order })
  }
}
