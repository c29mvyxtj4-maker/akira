/**
 * Team Collaboration Service
 *
 * Multi-user workspaces, roles & permissions, real-time updates
 * Activity tracking, mentions, comments, notifications
 */

import { supabase } from '@/lib/supabase'

// ========================================
// WORKSPACE MANAGEMENT
// ========================================

/**
 * Create workspace (team)
 */
export async function createWorkspace(name, plan = 'professional') {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{
      name,
      plan,
      owner_id: userId,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Add owner as workspace member
  await addWorkspaceMember(data.id, userId, 'owner')

  return data
}

/**
 * Get user's workspaces
 */
export async function getUserWorkspaces() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspaces(*)')
    .eq('user_id', userId)

  if (error) throw error

  return data?.map(m => m.workspaces) || []
}

/**
 * Get current workspace (from localStorage or default)
 */
export async function getCurrentWorkspace() {
  const workspaceId = localStorage.getItem('current_workspace_id')
  if (!workspaceId) return null

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (error) throw error
  return data
}

/**
 * Set current workspace
 */
export function setCurrentWorkspace(workspaceId) {
  localStorage.setItem('current_workspace_id', workspaceId)
}

// ========================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ========================================

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
}

export const PERMISSIONS = {
  [ROLES.OWNER]: {
    workspace: ['read', 'update', 'delete', 'invite', 'manage_roles'],
    clients: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    invoices: ['create', 'read', 'update', 'delete', 'send'],
    time_entries: ['create', 'read', 'update', 'delete'],
    users: ['invite', 'remove', 'update_role'],
    reports: ['create', 'read', 'delete'],
  },
  [ROLES.ADMIN]: {
    workspace: ['read', 'update'],
    clients: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    invoices: ['create', 'read', 'update', 'delete', 'send'],
    time_entries: ['create', 'read', 'update', 'delete'],
    users: ['invite'],
    reports: ['create', 'read'],
  },
  [ROLES.MANAGER]: {
    workspace: ['read'],
    clients: ['create', 'read', 'update'],
    projects: ['create', 'read', 'update'],
    invoices: ['create', 'read'],
    time_entries: ['create', 'read', 'update'],
    users: [],
    reports: ['read'],
  },
  [ROLES.MEMBER]: {
    workspace: ['read'],
    clients: ['read'],
    projects: ['read', 'update'],
    invoices: ['read'],
    time_entries: ['create', 'read', 'update'],
    users: [],
    reports: ['read'],
  },
  [ROLES.VIEWER]: {
    workspace: ['read'],
    clients: ['read'],
    projects: ['read'],
    invoices: ['read'],
    time_entries: ['read'],
    users: [],
    reports: ['read'],
  },
}

/**
 * Check if user has permission
 */
export async function checkPermission(resource, action) {
  const { userId } = await supabase.auth.getUser()
  const workspace = await getCurrentWorkspace()

  if (!workspace) throw new Error('No workspace selected')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', userId)
    .single()

  if (!member) throw new Error('Not a member of this workspace')

  const rolePerms = PERMISSIONS[member.role]
  return rolePerms?.[resource]?.includes(action) || false
}

/**
 * Add member to workspace
 */
export async function addWorkspaceMember(workspaceId, userId, role = 'member') {
  const { error } = await supabase
    .from('workspace_members')
    .insert([{
      workspace_id: workspaceId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    }])

  if (error) throw error
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers(workspaceId) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, users(email, name)')
    .eq('workspace_id', workspaceId)

  if (error) throw error
  return data || []
}

/**
 * Update member role
 */
export async function updateMemberRole(workspaceId, userId, newRole) {
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) throw error
}

// ========================================
// REAL-TIME COLLABORATION
// ========================================

/**
 * Subscribe to workspace changes
 */
export function subscribeToWorkspaceUpdates(workspaceId, callback) {
  return supabase
    .channel(`workspace:${workspaceId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'clients',
      filter: `workspace_id=eq.${workspaceId}`
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `workspace_id=eq.${workspaceId}`
    }, callback)
    .subscribe()
}

/**
 * Publish real-time activity
 */
export async function publishActivity(workspaceId, activityType, data) {
  const { userId } = await supabase.auth.getUser()

  await supabase
    .from('activity_feed')
    .insert([{
      workspace_id: workspaceId,
      user_id: userId,
      activity_type: activityType,
      data: JSON.stringify(data),
      created_at: new Date().toISOString(),
    }])

  // Broadcast via Realtime
  supabase.channel(`activity:${workspaceId}`).send({
    type: 'broadcast',
    event: 'activity',
    payload: { type: activityType, data }
  })
}

/**
 * Get activity feed
 */
export async function getActivityFeed(workspaceId, limit = 50) {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('*, users(name, email)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ========================================
// COMMENTS & MENTIONS
// ========================================

/**
 * Add comment to resource
 */
export async function addComment(resourceType, resourceId, text, mentions = []) {
  const { userId } = await supabase.auth.getUser()
  const workspace = await getCurrentWorkspace()

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      workspace_id: workspace.id,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId,
      text,
      mentions: JSON.stringify(mentions),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Send notifications to mentioned users
  for (const mentionedUserId of mentions) {
    await createNotification(
      mentionedUserId,
      'mention',
      `You were mentioned in ${resourceType}`,
      resourceId
    )
  }

  return data
}

/**
 * Get comments for resource
 */
export async function getComments(resourceType, resourceId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(name, email)')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ========================================
// NOTIFICATIONS
// ========================================

/**
 * Create notification
 */
export async function createNotification(userId, type, message, resourceId) {
  await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      message,
      resource_id: resourceId,
      is_read: false,
      created_at: new Date().toISOString(),
    }])
}

/**
 * Get user notifications
 */
export async function getNotifications(unreadOnly = false) {
  const { userId } = await supabase.auth.getUser()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
}

/**
 * Subscribe to new notifications
 */
export function subscribeToNotifications(callback) {
  const { userId } = supabase.auth.getUser()

  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

// ========================================
// AUDIT LOGS
// ========================================

/**
 * Log action for compliance
 */
export async function logAuditEvent(workspaceId, action, resource, details) {
  const { userId } = await supabase.auth.getUser()

  await supabase
    .from('audit_logs')
    .insert([{
      workspace_id: workspaceId,
      user_id: userId,
      action,
      resource,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      ip_address: 'CLIENT', // In production, get from server
    }])
}

/**
 * Get audit logs
 */
export async function getAuditLogs(workspaceId, limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, users(name, email)')
    .eq('workspace_id', workspaceId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
