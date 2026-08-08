import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Settings, Users, LogOut, Plus, RotateCcw, RotateCw, Eye, Clock, HelpCircle, Edit3, FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'

export default function TopMenu() {
  const { profile, signOut } = useAuth()
  const { org, workspaces, switchWorkspace, createWorkspace } = useOrg()
  const [openMenu, setOpenMenu] = useState(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const workspaceRef = useRef(null)

  const menuItems = {
    archivo: [
      { label: 'Nuevo', icon: FileText, action: () => {} },
      { label: 'Abrir', icon: FileText, action: () => {} },
      { label: 'Guardar', icon: FileText, action: () => {} },
      { label: 'Exportar', icon: FileText, action: () => {} },
    ],
    editar: [
      { label: 'Deshacer', icon: RotateCcw, action: () => {} },
      { label: 'Rehacer', icon: RotateCw, action: () => {} },
      { label: 'Cortar', icon: Edit3, action: () => {} },
      { label: 'Copiar', icon: Edit3, action: () => {} },
      { label: 'Pegar', icon: Edit3, action: () => {} },
    ],
    ver: [
      { label: 'Zoom completo', icon: Eye, action: () => {} },
      { label: 'Zoom en', icon: Eye, action: () => {} },
      { label: 'Zoom fuera', icon: Eye, action: () => {} },
      { label: 'Actualizar', icon: RotateCcw, action: () => {} },
    ],
    historial: [
      { label: 'Mostrar historial', icon: Clock, action: () => {} },
      { label: 'Restaurar versión anterior', icon: Clock, action: () => {} },
    ],
    ventana: [
      { label: 'Lado a lado', icon: Eye, action: () => {} },
      { label: 'Pantalla completa', icon: Eye, action: () => {} },
    ],
    ayuda: [
      { label: 'Documentación', icon: HelpCircle, action: () => {} },
      { label: 'Reportar problema', icon: HelpCircle, action: () => {} },
      { label: 'Acerca de AKIRA', icon: HelpCircle, action: () => {} },
    ],
  }

  const menuLabels = {
    archivo: 'Archivo',
    editar: 'Editar',
    ver: 'Ver',
    historial: 'Historial',
    ventana: 'Ventana',
    ayuda: 'Ayuda',
  }

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

  return (
    <div style={{
      background: 'var(--surface-0)',
      borderBottom: '1px solid var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      height: '56px',
      paddingLeft: '16px',
      paddingRight: '16px',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 99,
    }}>
      {/* Menu Items */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Object.keys(menuItems).map((key) => (
          <div key={key} style={{ position: 'relative' }}>
            <motion.button
              whileHover={{ backgroundColor: 'var(--surface-1)' }}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: openMenu === key ? 'var(--surface-1)' : 'transparent',
                color: 'var(--text-1)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              {menuLabels[key]}
            </motion.button>

            <AnimatePresence>
              {openMenu === key && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    background: 'var(--surface-0)',
                    border: '1px solid var(--surface-2)',
                    borderRadius: '8px',
                    padding: '6px',
                    minWidth: '180px',
                    zIndex: 1000,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  {menuItems[key].map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ backgroundColor: 'var(--surface-1)' }}
                      onClick={() => {
                        item.action()
                        setOpenMenu(null)
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
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                      }}
                    >
                      <item.icon style={{ width: '16px', height: '16px' }} />
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Workspace Selector */}
      <div ref={workspaceRef} style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ backgroundColor: 'var(--surface-1)' }}
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--surface-2)',
            background: 'var(--surface-1)',
            color: 'var(--text-1)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: 'var(--brand-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
          }}>
            {org?.name?.charAt(0) || 'A'}
          </div>
          <span>{org?.name || 'Workspace'}</span>
          <ChevronDown style={{ width: '14px', height: '14px' }} />
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
    </div>
  )
}
