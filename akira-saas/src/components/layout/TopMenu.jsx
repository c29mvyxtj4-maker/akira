import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Settings, Users, LogOut, Plus, Home, MessageSquare, Video, Inbox, Search, Minus, X, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'
import { useNavigate } from 'react-router-dom'

export default function TopMenu() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { org, workspaces, switchWorkspace, createWorkspace } = useOrg()
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const avatarRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowWorkspaceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
  }

  const navItems = [
    { Icon: Home, tooltip: 'Inicio', route: '/' },
    { Icon: MessageSquare, tooltip: 'Chat', route: '/brain' },
    { Icon: Video, tooltip: 'Reuniones', route: '/calendar' },
    { Icon: Inbox, tooltip: 'Bandeja', route: '/inbox' },
    { Icon: Search, tooltip: 'Buscar', route: '#' },
  ]

  const name = profile?.full_name || 'Usuario'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div style={{
      background: 'var(--surface-0)',
      borderBottom: '1px solid var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      height: '56px',
      paddingLeft: '8px',
      paddingRight: '12px',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 99,
    }}>
      {/* LEFT: Avatar with Workspace Menu */}
      <div ref={avatarRef} style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--brand-500)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          title="Workspace"
        >
          {initial}
        </motion.button>

        <AnimatePresence>
          {showWorkspaceMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: 'var(--surface-1)',
                border: '1px solid var(--surface-2)',
                borderRadius: '12px',
                padding: '12px 8px',
                minWidth: '240px',
                zIndex: 1001,
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              }}
            >
              {/* Header with Avatar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 8px 12px 8px',
                borderBottom: '1px solid var(--surface-2)',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--brand-500)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                    {org?.name || 'Workspace'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    Plan gratuito · 1 miembro
                  </div>
                </div>
              </div>

              {/* Upgrade Plan */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--brand-500)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                ℹ️ Mejorar tu plan
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                Configuración
              </motion.button>

              {/* Invite */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <Users style={{ width: '16px', height: '16px' }} />
                Invitar a miembros
              </motion.button>

              {/* Add Account */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                👤 Añadir cuenta
              </motion.button>

              <div style={{ height: '1px', background: 'var(--surface-2)', margin: '8px 0' }} />

              {/* Email */}
              <div style={{
                padding: '8px 10px',
                fontSize: '12px',
                color: 'var(--text-3)',
              }}>
                {profile?.email || 'usuario@email.com'}
              </div>

              {/* Workspaces */}
              {workspaces && workspaces.length > 0 && (
                <>
                  <div style={{ height: '1px', background: 'var(--surface-2)', margin: '8px 0' }} />
                  {workspaces.map((ws) => (
                    <motion.button
                      key={ws.id}
                      whileHover={{ backgroundColor: 'var(--surface-1)' }}
                      onClick={() => {
                        switchWorkspace(ws.id)
                        setShowWorkspaceMenu(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: org?.id === ws.id ? 'var(--surface-1)' : 'transparent',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        fontWeight: org?.id === ws.id ? 600 : 400,
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        background: 'var(--brand-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}>
                        {ws.name?.charAt(0) || 'A'}
                      </div>
                      {ws.name}
                      {org?.id === ws.id && ' ✓'}
                    </motion.button>
                  ))}
                </>
              )}

              {/* New Workspace */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                onClick={() => {
                  const name = window.prompt('Nombre del nuevo espacio de trabajo')
                  if (name && name.trim()) {
                    createWorkspace(name.trim()).catch(e => alert('Error: ' + e.message))
                  }
                  setShowWorkspaceMenu(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--brand-500)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  fontWeight: 500,
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Nuevo espacio de trabajo
              </motion.button>

              <div style={{ height: '1px', background: 'var(--surface-2)', margin: '8px 0' }} />

              {/* Logout */}
              <motion.button
                whileHover={{ backgroundColor: 'var(--surface-1)' }}
                onClick={() => {
                  setShowWorkspaceMenu(false)
                  handleLogout()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
                Cerrar sesión
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Nav Items */}
      {navItems.map((item, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => item.route !== '#' && navigate(item.route)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title={item.tooltip}
        >
          <item.Icon style={{ width: '16px', height: '16px' }} />
        </motion.button>
      ))}

      {/* CENTER: Workspace Name */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-1)',
      }}>
        ⚙️ {org?.name || 'AKIRA'}
      </div>

      {/* RIGHT: Navigation Controls + Plus + Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Back/Forward Buttons */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title="Atrás"
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.forward()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title="Adelante"
        >
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </motion.button>

        {/* Plus Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title="Agregar"
        >
          <Plus style={{ width: '16px', height: '16px' }} />
        </motion.button>

        {/* Window Controls */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title="Minimizar"
        >
          <Minus style={{ width: '16px', height: '16px' }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.color = 'var(--text-1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
          title="Cerrar"
        >
          <X style={{ width: '16px', height: '16px' }} />
        </motion.button>
      </div>
    </div>
  )
}
