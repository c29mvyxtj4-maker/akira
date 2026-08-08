import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Settings, Users, LogOut, Plus, Home, MessageCircle, Video, Inbox, Search, Minus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'
import { useNavigate } from 'react-router-dom'

export default function TopMenu() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { org, workspaces, switchWorkspace, createWorkspace } = useOrg()
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const workspaceRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
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
    { icon: Home, tooltip: 'Inicio', route: '/' },
    { icon: MessageCircle, tooltip: 'Chat', route: '/brain' },
    { icon: Video, tooltip: 'Reuniones', route: '/calendar' },
    { icon: Inbox, tooltip: 'Bandeja', route: '/inbox' },
    { icon: Search, tooltip: 'Buscar', route: '#' },
  ]

  return (
    <div style={{
      background: 'var(--surface-0)',
      borderBottom: '1px solid var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      height: '56px',
      paddingLeft: '12px',
      paddingRight: '12px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 99,
    }}>
      {/* LEFT: Logo + Quick Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Logo/Home */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            border: '1px solid var(--surface-2)',
            background: 'transparent',
            color: 'var(--brand-500)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
          title="Inicio"
        >
          🏠
        </motion.button>

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
              border: '1px solid var(--surface-2)',
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
            title={item.tooltip}
          >
            <item.icon style={{ width: '16px', height: '16px' }} />
          </motion.button>
        ))}
      </div>

      {/* CENTER: Workspace Name */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-1)',
      }}>
        {org?.name || 'AKIRA'}
      </div>

      {/* RIGHT: Navigation Controls + Settings + Plus */}
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
            border: '1px solid var(--surface-2)',
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
            border: '1px solid var(--surface-2)',
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

        {/* Settings/Workspace Selector */}
        <div ref={workspaceRef} style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--surface-2)',
              background: showWorkspaceMenu ? 'var(--surface-1)' : 'transparent',
              color: 'var(--text-1)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {org?.name || 'Workspace'}
            </span>
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
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--surface-0)',
                  border: '1px solid var(--surface-2)',
                  borderRadius: '8px',
                  padding: '8px',
                  minWidth: '220px',
                  zIndex: 1001,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                {/* Upgrade Plan */}
                <motion.button
                  whileHover={{ backgroundColor: 'var(--surface-1)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--brand-500)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  📈 Mejorar tu plan
                </motion.button>

                <div style={{ height: '1px', background: 'var(--surface-2)', margin: '6px 0' }} />

                {/* Settings */}
                <motion.button
                  whileHover={{ backgroundColor: 'var(--surface-1)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
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
                    borderRadius: '4px',
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
                    borderRadius: '4px',
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

                <div style={{ height: '1px', background: 'var(--surface-2)', margin: '6px 0' }} />

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
                    <div style={{ height: '1px', background: 'var(--surface-2)', margin: '6px 0' }} />
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
                          borderRadius: '4px',
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
                    borderRadius: '4px',
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

                <div style={{ height: '1px', background: 'var(--surface-2)', margin: '6px 0' }} />

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
                    borderRadius: '4px',
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

        {/* Plus Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid var(--surface-2)',
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
            border: '1px solid var(--surface-2)',
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
            border: '1px solid var(--surface-2)',
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
