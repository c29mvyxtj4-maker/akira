/**
 * Documents Service
 * Handles all database operations for the Notion-like document system
 * Including documents, blocks, permissions, comments, versions, and more
 */

import { supabase } from '@/lib/supabase'

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function fetchDocuments(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('documents')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url),
      folder:document_folders(id, name)
    `)
    .order('updated_at', { ascending: false })

  // Apply filters
  if (filters.folderId) {
    query = query.eq('folder_id', filters.folderId)
  }
  if (filters.isArchived !== undefined) {
    query = query.eq('is_archived', filters.isArchived)
  }
  if (filters.isPinned) {
    query = query.eq('is_pinned', true)
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.filter('tags', 'cs', `{${filters.tags.join(',')}}`)
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function fetchDocument(documentId) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url, email),
      folder:document_folders(id, name)
    `)
    .eq('id', documentId)
    .single()

  if (error) throw error
  return data
}

export async function createDocument(documentData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...documentData,
      created_by: user.id,
      org_id: documentData.org_id,
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await logActivity(data.id, user.id, 'create', { title: data.title })

  return data
}

export async function updateDocument(documentId, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'update', { updates })

  return data
}

export async function deleteDocument(documentId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error

  await logActivity(documentId, user.id, 'delete', {})
}

export async function archiveDocument(documentId) {
  return updateDocument(documentId, { is_archived: true })
}

export async function unarchiveDocument(documentId) {
  return updateDocument(documentId, { is_archived: false })
}

export async function pinDocument(documentId) {
  return updateDocument(documentId, { is_pinned: true })
}

export async function unpinDocument(documentId) {
  return updateDocument(documentId, { is_pinned: false })
}

// ============================================================================
// DOCUMENT BLOCKS
// ============================================================================

export async function fetchBlocks(documentId) {
  const { data, error } = await supabase
    .from('document_blocks')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url),
      updated_by_profile:profiles!updated_by(id, full_name, avatar_url)
    `)
    .eq('document_id', documentId)
    .eq('is_deleted', false)
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createBlock(documentId, blockData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_blocks')
    .insert({
      ...blockData,
      document_id: documentId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'create_block', { block_id: data.id, type: data.type })

  return data
}

export async function updateBlock(blockId, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_blocks')
    .update({
      ...updates,
      updated_by: user.id,
    })
    .eq('id', blockId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteBlock(blockId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Soft delete
  const { data, error } = await supabase
    .from('document_blocks')
    .update({ is_deleted: true, updated_by: user.id })
    .eq('id', blockId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function reorderBlocks(documentId, blocks) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates = blocks.map((block, index) => ({
    id: block.id,
    position: index,
  }))

  const { error } = await supabase
    .from('document_blocks')
    .upsert(updates, { onConflict: 'id' })

  if (error) throw error

  await logActivity(documentId, user.id, 'reorder_blocks', { count: blocks.length })

  return true
}

// ============================================================================
// DOCUMENT PERMISSIONS
// ============================================================================

export async function fetchPermissions(documentId) {
  const { data, error } = await supabase
    .from('document_permissions')
    .select(`
      *,
      user:profiles!user_id(id, full_name, email, avatar_url),
      granted_by_profile:profiles!granted_by(id, full_name)
    `)
    .eq('document_id', documentId)

  if (error) throw error
  return data || []
}

export async function grantPermission(documentId, userId, role) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_permissions')
    .upsert({
      document_id: documentId,
      user_id: userId,
      role,
      granted_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'add_permission', { user_id: userId, role })

  return data
}

export async function revokePermission(documentId, userId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('document_permissions')
    .delete()
    .eq('document_id', documentId)
    .eq('user_id', userId)

  if (error) throw error

  await logActivity(documentId, user.id, 'remove_permission', { user_id: userId })

  return true
}

export async function updatePermission(documentId, userId, role) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_permissions')
    .update({ role })
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'update_permission', { user_id: userId, role })

  return data
}

// ============================================================================
// DOCUMENT COLLABORATORS
// ============================================================================

export async function updateCollaboratorStatus(documentId, cursor = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_collaborators')
    .upsert({
      document_id: documentId,
      user_id: user.id,
      is_online: true,
      cursor_block_id: cursor.blockId,
      cursor_offset: cursor.offset,
      last_edited_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchCollaborators(documentId) {
  const { data, error } = await supabase
    .from('document_collaborators')
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url, email)
    `)
    .eq('document_id', documentId)
    .eq('is_online', true)

  if (error) throw error
  return data || []
}

export async function markOffline(documentId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('document_collaborators')
    .update({ is_online: false })
    .eq('document_id', documentId)
    .eq('user_id', user.id)

  if (error) throw error
  return true
}

// ============================================================================
// DOCUMENT COMMENTS
// ============================================================================

export async function fetchComments(documentId) {
  const { data, error } = await supabase
    .from('document_comments')
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url, email),
      resolved_by_profile:profiles!resolved_by(id, full_name),
      replies:document_comment_replies(*)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createComment(documentId, blockId, text) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_comments')
    .insert({
      document_id: documentId,
      block_id: blockId,
      user_id: user.id,
      text,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'comment', { block_id: blockId })

  return data
}

export async function updateComment(commentId, text) {
  const { data, error } = await supabase
    .from('document_comments')
    .update({ text })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('document_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
  return true
}

export async function resolveComment(commentId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_comments')
    .update({
      resolved: true,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addCommentReply(commentId, text) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_comment_replies')
    .insert({
      comment_id: commentId,
      user_id: user.id,
      text,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// DOCUMENT VERSIONS
// ============================================================================

export async function fetchVersions(documentId) {
  const { data, error } = await supabase
    .from('document_versions')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createVersion(documentId, blocks, changeDescription = '') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      blocks_snapshot: blocks,
      created_by: user.id,
      change_description: changeDescription,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function restoreVersion(documentId, versionNumber) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: version, error: versionError } = await supabase
    .from('document_versions')
    .select('blocks_snapshot')
    .eq('document_id', documentId)
    .eq('version_number', versionNumber)
    .single()

  if (versionError) throw versionError

  await supabase
    .from('document_blocks')
    .delete()
    .eq('document_id', documentId)

  const { error: insertError } = await supabase
    .from('document_blocks')
    .insert(
      version.blocks_snapshot.map((block) => ({
        ...block,
        created_by: user.id,
        updated_by: user.id,
      }))
    )

  if (insertError) throw insertError

  await logActivity(documentId, user.id, 'restore_version', { version_number: versionNumber })

  return true
}

// ============================================================================
// DOCUMENT FOLDERS
// ============================================================================

export async function fetchFolders(orgId) {
  const { data, error } = await supabase
    .from('document_folders')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq('org_id', orgId)
    .eq('is_archived', false)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createFolder(orgId, folderData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('document_folders')
    .insert({
      ...folderData,
      org_id: orgId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFolder(folderId, updates) {
  const { data, error } = await supabase
    .from('document_folders')
    .update(updates)
    .eq('id', folderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFolder(folderId) {
  const { error } = await supabase
    .from('document_folders')
    .delete()
    .eq('id', folderId)

  if (error) throw error
  return true
}

// ============================================================================
// DOCUMENT SHARES
// ============================================================================

export async function fetchShares(documentId) {
  const { data, error } = await supabase
    .from('document_shares')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq('document_id', documentId)

  if (error) throw error
  return data || []
}

export async function createShare(documentId, shareData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const token = Math.random().toString(36).substring(2, 34)

  const { data, error } = await supabase
    .from('document_shares')
    .insert({
      ...shareData,
      document_id: documentId,
      share_token: token,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity(documentId, user.id, 'create_share', { share_type: shareData.share_type })

  return data
}

export async function deleteShare(shareId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('document_shares')
    .delete()
    .eq('id', shareId)

  if (error) throw error
  return true
}

// ============================================================================
// DOCUMENT ACTIVITIES
// ============================================================================

export async function fetchActivities(documentId) {
  const { data, error } = await supabase
    .from('document_activities')
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url, email)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function logActivity(documentId, userId, action, details = {}) {
  try {
    await supabase
      .from('document_activities')
      .insert({
        document_id: documentId,
        user_id: userId,
        action,
        details,
      })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// ============================================================================
// SEARCH
// ============================================================================

export async function searchDocuments(query, orgId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,content_preview.ilike.%${query}%`)
    .limit(20)

  if (error) throw error
  return data || []
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToDocument(documentId, callback) {
  return supabase
    .channel(`document:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'document_blocks',
        filter: `document_id=eq.${documentId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToCollaborators(documentId, callback) {
  return supabase
    .channel(`collaborators:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'document_collaborators',
        filter: `document_id=eq.${documentId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToComments(documentId, callback) {
  return supabase
    .channel(`comments:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'document_comments',
        filter: `document_id=eq.${documentId}`,
      },
      callback
    )
    .subscribe()
}
