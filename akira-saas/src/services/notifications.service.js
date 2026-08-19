import { supabase } from '@/lib/supabase'

export async function fetchNotifications(limit = 20) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function createNotification(title, message, type = 'info', userId = null) {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id

  if (!targetUserId) return null

  return supabase
    .from('notifications')
    .insert({
      user_id: targetUserId,
      title,
      message,
      type,
      read_at: null,
    })
    .select()
}

export async function markAsRead(notificationId) {
  return supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
}

export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
}

export async function deleteNotification(notificationId) {
  return supabase.from('notifications').delete().eq('id', notificationId)
}

export async function deleteAllNotifications() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return supabase.from('notifications').delete().eq('user_id', user.id)
}

export async function getUnreadCount() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', user.id)
    .is('read_at', null)

  return data?.length || 0
}

// Subscribe to real-time notifications
export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

// Unsubscribe from notifications
export async function unsubscribeFromNotifications(subscription) {
  if (subscription) {
    await subscription.unsubscribe()
  }
}
