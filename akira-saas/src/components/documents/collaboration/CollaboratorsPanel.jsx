import { useState, useEffect } from 'react'
import { Users, Trash2, Plus, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const COLORS = [
  '#e63946', '#f77f00', '#fcbf49', '#06a77d', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#06b6d4', '#a855f7',
]

export default function CollaboratorsPanel({ documentId, onShareChange }) {
  const [collaborators, setCollaborators] = useState([])
  const [cursorPositions, setCursorPositions] = useState({})
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [shareLink, setShareLink] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCollaborators()
    subscribeToPresence()
  }, [documentId])

  const loadCollaborators = async () => {
    const { data } = await supabase
      .from('document_collaborators')
      .select(`
        id,
        user_id,
        permission,
        profiles:user_id (id, full_name, email, avatar_url)
      `)
      .eq('document_id', documentId)

    if (data) {
      setCollaborators(data)
      const link = `${window.location.origin}/documents/${documentId}/invite?code=${Math.random().toString(36).substr(2, 9)}`
      setShareLink(link)
    }
  }

  const subscribeToPresence = () => {
    const subscription = supabase
      .channel(`doc-presence:${documentId}`)
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const presence = subscription.presenceState()
          const positions = {}
          Object.values(presence).forEach(users => {
            users.forEach(user => {
              positions[user.user_id] = {
                position: user.cursor_position,
                color: user.color,
                name: user.user_name,
              }
            })
          })
          setCursorPositions(positions)
        }
      )
      .subscribe()

    return subscription
  }

  const handleInvite = async () => {
    if (!inviteEmail) return

    setLoading(true)
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single()

      if (!profiles) {
        alert('Usuario no encontrado')
        return
      }

      await supabase
        .from('document_collaborators')
        .insert({
          document_id: documentId,
          user_id: profiles.id,
          permission: 'edit',
        })

      setInviteEmail('')
      setShowInvite(false)
      loadCollaborators()
      onShareChange?.()
    } catch (error) {
      console.error('Error inviting collaborator:', error)
      alert('Error al invitar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (collaboratorId) => {
    try {
      await supabase
        .from('document_collaborators')
        .delete()
        .eq('id', collaboratorId)

      loadCollaborators()
      onShareChange?.()
    } catch (error) {
      console.error('Error removing collaborator:', error)
    }
  }

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getColorForUser = (index) => COLORS[index % COLORS.length]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      background: 'var(--bg-0)',
      borderLeft: '1px solid var(--border)',
      width: '300px',
      maxHeight: '100vh',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Users size={16} />
          Colaboradores activos
        </h3>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: 'var(--text-3)',
        }}>
          {collaborators.length} colaboradores
        </p>
      </div>

      {/* Collaborators List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {collaborators.map((collab, idx) => {
            const profile = collab.profiles
            const isOnline = cursorPositions[collab.user_id]
            const color = getColorForUser(idx)

            return (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  background: 'var(--bg-1)',
                  borderRadius: '8px',
                  border: `1px solid var(--border)`,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    position: 'relative',
                  }}
                >
                  {profile?.full_name?.[0] || '?'}
                  {isOnline && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-0)',
                      }}
                    />
                  )}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '11px',
                    color: 'var(--text-3)',
                  }}>
                    {collab.permission}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(collab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Invite Section */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '12px',
      }}>
        {!showInvite ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowInvite(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={14} />
            Invitar usuario
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                padding: '8px 10px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-1)',
                fontSize: '12px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleInvite}
                disabled={!inviteEmail || loading}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'var(--brand)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Invitando...' : 'Invitar'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-1)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Link */}
      {shareLink && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
          }}>
            Enlace compartible
          </p>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 10px',
              background: 'var(--bg-2)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '11px',
              color: 'var(--text-3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            onClick={copyShareLink}
            title={shareLink}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {shareLink.substring(0, 30)}...
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyShareLink()
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-3)',
                padding: 0,
                display: 'flex',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
