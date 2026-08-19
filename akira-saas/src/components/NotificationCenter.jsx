import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/shared/lib/supabase'

const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  warning: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read_at).length)
      }
    }

    loadNotifications()

    // Subscribe to real-time notifications
    let subscription = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      subscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev])
            setUnreadCount((prev) => prev + 1)
            playNotificationSound()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const deleteNotification = async (notificationId) => {
    await supabase.from('notifications').delete().eq('id', notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('read_at', null)

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    )
    setUnreadCount(0)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#e63946',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              width: '350px',
              maxHeight: '500px',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f1f4' }}>
                Notificaciones
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3b82f6',
                      fontSize: '12px',
                      padding: '4px 8px',
                    }}
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => {
                  const NotifIcon = NOTIFICATION_TYPES[notification.type]?.icon || Info
                  const notifColor = NOTIFICATION_TYPES[notification.type]?.color || '#3b82f6'
                  const notifBg = NOTIFICATION_TYPES[notification.type]?.bg || 'rgba(59, 130, 246, 0.1)'
                  const isRead = !!notification.read_at

                  return (
                    <div
                      key={notification.id}
                      style={{
                        padding: '12px',
                        background: isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                      onClick={() => !isRead && markAsRead(notification.id)}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: notifBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <NotifIcon size={16} style={{ color: notifColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#f1f1f4' }}>
                          {notification.title}
                        </p>
                        <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                          {notification.message}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.4)',
                          padding: '4px',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
