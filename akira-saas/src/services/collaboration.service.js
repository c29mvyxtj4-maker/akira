import { supabase } from '@/lib/supabase'

// Subscribe to document changes
export function subscribeToDocumentChanges(documentId, callback) {
  return supabase
    .channel(`doc-changes:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'document_changes',
        filter: `document_id=eq.${documentId}`,
      },
      callback
    )
    .subscribe()
}

// Broadcast cursor position
export function broadcastCursorPosition(documentId, position, userId, userName, color) {
  return supabase
    .channel(`doc-presence:${documentId}`)
    .track({
      user_id: userId,
      user_name: userName,
      cursor_position: position,
      color: color,
      timestamp: new Date().toISOString(),
    })
}

// Subscribe to cursor positions
export function subscribeToCursorPositions(documentId, callback) {
  return supabase
    .channel(`doc-presence:${documentId}`)
    .on('presence', { event: 'sync' }, callback)
    .subscribe()
}

// Save document change
export async function saveDocumentChange(documentId, userId, changeType, oldValue, newValue, metadata) {
  return supabase
    .from('document_changes')
    .insert({
      document_id: documentId,
      user_id: userId,
      change_type: changeType,
      old_value: oldValue,
      new_value: newValue,
      metadata: metadata,
      created_at: new Date().toISOString(),
    })
    .select()
}

// Get document change history
export async function getDocumentChangeHistory(documentId, limit = 100) {
  return supabase
    .from('document_changes')
    .select(`
      *,
      profiles:user_id (full_name, email, avatar_url)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

// Add collaborator
export async function addCollaborator(documentId, userEmail, permission = 'view') {
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  return supabase
    .from('document_collaborators')
    .insert({
      document_id: documentId,
      user_id: user.id,
      permission: permission,
    })
    .select()
}

// Remove collaborator
export async function removeCollaborator(collaboratorId) {
  return supabase
    .from('document_collaborators')
    .delete()
    .eq('id', collaboratorId)
}

// Get collaborators
export async function getCollaborators(documentId) {
  return supabase
    .from('document_collaborators')
    .select(`
      *,
      profiles:user_id (full_name, email, avatar_url)
    `)
    .eq('document_id', documentId)
}

// Update collaborator permission
export async function updateCollaboratorPermission(collaboratorId, permission) {
  return supabase
    .from('document_collaborators')
    .update({ permission })
    .eq('id', collaboratorId)
}

// Merge conflicting changes (simple CRDT-like approach)
export function mergeChanges(localChanges, remoteChanges) {
  const allChanges = [...localChanges, ...remoteChanges]

  // Sort by timestamp
  allChanges.sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at)
  )

  // Deduplicate identical changes
  const merged = []
  const seen = new Set()

  allChanges.forEach(change => {
    const key = `${change.user_id}:${change.change_type}:${change.created_at}`
    if (!seen.has(key)) {
      merged.push(change)
      seen.add(key)
    }
  })

  return merged
}

// Resolve concurrent edits (Last-Write-Wins)
export function resolveConcurrentEdits(userChange, remoteChange) {
  const userTime = new Date(userChange.created_at).getTime()
  const remoteTime = new Date(remoteChange.created_at).getTime()

  if (userTime > remoteTime) {
    return userChange
  } else if (remoteTime > userTime) {
    return remoteChange
  } else {
    // Same timestamp, use user_id to break tie
    return userChange.user_id > remoteChange.user_id ? userChange : remoteChange
  }
}
