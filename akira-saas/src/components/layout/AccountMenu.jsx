import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Mail, LogOut, Check, Plus } from 'lucide-react'

/*
 * Menú de cuenta/espacio (estilo Notion) que sale al pulsar el avatar. Va en
 * posición FIJA anclada bajo el avatar (si fuera absolute, el contenedor de
 * pastillas con overflow-x lo recortaría). Incluye cambiador de workspaces.
 */
function Item({ icon: Icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: danger ? 'var(--brand)' : 'var(--text-2)', fontSize: '13px', fontWeight: 500, transition: 'background 0.1s' }}
      onMouseEnter={function (e) { e.currentTarget.style.background = 'var(--bg-3)' }}
      onMouseLeave={function (e) { e.currentTarget.style.background = 'transparent' }}>
      <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} /> {label}
    </button>
  )
}

export default function AccountMenu({ anchor, orgName, plan, memberCount, initial, email, workspaces, activeOrgId, onSwitch, onCreateWorkspace, onSettings, onInvite, onSignOut, onClose }) {
  var top = anchor ? anchor.top : 60
  var left = anchor ? anchor.left : 16
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400 }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        style={{ position: 'fixed', top: top + 'px', left: left + 'px', zIndex: 401, width: '280px', maxHeight: 'calc(100dvh - ' + (top + 20) + 'px)', overflowY: 'auto', transformOrigin: 'top left', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-modal)', padding: '6px' }}
        onClick={function (e) { e.stopPropagation() }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 8px 10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'var(--gradient-brand)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgName || 'Mi espacio'}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>Plan {plan || 'gratuito'} · {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}</p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
        <Item icon={SettingsIcon} label="Configuración" onClick={onSettings} />
        <Item icon={Mail} label="Invitar a miembros" onClick={onInvite} />

        {email && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-5)', padding: '4px 10px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
          </>
        )}

        {/* Espacios de trabajo */}
        {(workspaces || []).map(function (w) {
          var active = w.id === activeOrgId
          return (
            <button key={w.id} type="button" onClick={function () { onSwitch(w.id) }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--text-1)', fontSize: '13px', fontWeight: 600, transition: 'background 0.1s' }}
              onMouseEnter={function (e) { e.currentTarget.style.background = 'var(--bg-3)' }}
              onMouseLeave={function (e) { e.currentTarget.style.background = 'transparent' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: active ? 'var(--gradient-brand)' : 'var(--bg-4)', color: active ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{(w.name || '?')[0].toUpperCase()}</span>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
              {active && <Check style={{ width: '15px', height: '15px', color: 'var(--brand)', flexShrink: 0 }} />}
            </button>
          )
        })}
        <Item icon={Plus} label="Nuevo espacio de trabajo" onClick={onCreateWorkspace} />

        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
        <Item icon={LogOut} label="Cerrar sesión" onClick={onSignOut} danger />
      </motion.div>
    </>
  )
}
