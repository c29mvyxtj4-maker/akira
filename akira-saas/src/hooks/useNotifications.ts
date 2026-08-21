import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchNotifications, subscribeToNotifications } from '@/services/notifications.service'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await fetchNotifications(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n: any) => !n.read_at).length || 0)

      // Subscribe to real-time updates
      subscribeToNotifications(user.id, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          )
          if (!payload.old.read_at && payload.new.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev =>
            prev.filter(n => n.id !== payload.old.id)
          )
        }
      })
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    reload: loadNotifications,
  }
}
