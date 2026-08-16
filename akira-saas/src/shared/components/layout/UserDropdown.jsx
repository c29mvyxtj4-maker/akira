import { motion } from 'framer-motion'
import { ChevronDown, Settings, UserPlus, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { useOrg } from '@/shared/context/OrgContext'

export default function UserDropdown({ isOpen, onClose, onOpenSettings, buttonRef, switchWorkspace }) {
  const { user } = useAuth()
  const { org, workspaces: contextWorkspaces } = useOrg()

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: buttonRef.current?.getBoundingClientRect().bottom + 8,
        left: buttonRef.current?.getBoundingClientRect().left,
        width: '280px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
      onMouseLeave={onClose}
    >
      {/* Header Info */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
          }}>
            {org?.name?.[0]?.toUpperCase() || 'W'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-1)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {org?.name || 'Workspace'}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-3)',
            }}>
              Plan gratuito · 1 miembro
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{
        padding: '8px',
      }}>
        {/* Configuración */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            if (onOpenSettings) onOpenSettings()
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-1)',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Settings size={16} />
          Configuración
        </motion.button>

        {/* Invitar a miembros */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            alert('Invitar a miembros - Funcionalidad en desarrollo')
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-1)',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <UserPlus size={16} />
          Invitar a miembros
        </motion.button>

        {/* Añadir cuenta */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            alert('Añadir cuenta - Funcionalidad en desarrollo')
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-1)',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Plus size={16} />
          Añadir cuenta
        </motion.button>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '8px 0',
      }} />

      {/* Email and Workspaces */}
      <div style={{
        padding: '8px',
      }}>
        {/* Email */}
        <div style={{
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--text-3)',
          wordBreak: 'break-all',
        }}>
          {user?.email || 'Sin email'}
        </div>

        {/* Workspaces List */}
        {contextWorkspaces && contextWorkspaces.length > 0 ? contextWorkspaces.map((ws) => (
          <motion.button
            key={ws.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              switchWorkspace(ws.id)
              onClose()
            }}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-1)',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '6px',
              transition: 'all var(--dur-fast)',
              marginBottom: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
            }}>
              {(ws.name || ws.id)[0].toUpperCase()}
            </div>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ws.name || 'Sin nombre'}
            </span>
          </motion.button>
        )) : (
          <div style={{
            padding: '8px 12px',
            fontSize: '12px',
            color: 'var(--text-3)',
          }}>
            Sin espacios de trabajo
          </div>
        )}

        {/* Nuevo espacio de trabajo */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            alert('Crear nuevo espacio de trabajo')
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--brand)',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'all var(--dur-fast)',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Plus size={16} />
          Nuevo espacio de trabajo
        </motion.button>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '8px 0',
      }} />

      {/* Cerrar sesión */}
      <div style={{
        padding: '8px',
      }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            alert('Cerrando sesión...')
            onClose()
          }}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-1)',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </motion.button>
      </div>
    </motion.div>
  )
}

