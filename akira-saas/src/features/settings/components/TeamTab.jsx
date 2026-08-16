import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cancelInvitation, createInvitation, getInvitations, removeMember, sendInvitationEmail, updateMemberRole } from '@/services/org.service'
import { useOrg } from '@/shared/context/OrgContext'
import ResourceAccessModal from './ResourceAccessModal'
import { INP, Section, Toast, onBlur, onFocus } from './_shared'

function TeamTab() {
  var { org, members, myRole, refreshOrg } = useOrg()
  var [managingAccess, setManagingAccess] = useState(null) // â† NUEVO
  var [invitations, setInvitations] = useState([])
  var [loading,     setLoading]     = useState(true)
  var [email,       setEmail]       = useState('')
  var [role,        setRole]        = useState('member')
  var [inviting,    setInviting]    = useState(false)
  var [toast,       setToast]       = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    if (!org) return
    setLoading(true)
    getInvitations(org.id)
      .then(function(data) { setInvitations(data) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [org])

  function handleInvite() {
    if (!email.trim() || !org) return
    setInviting(true)
    createInvitation(org.id, email.trim(), role)
      .then(function(inv) {
        var inviteUrl = window.location.origin + '/join?token=' + inv.token
        return sendInvitationEmail(email.trim(), org.name, inviteUrl)
          .then(function() {
            setInvitations(function(prev) { return [inv].concat(prev) })
            setEmail('')
            showMsg('Invitacion enviada a ' + email)
          })
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setInviting(false) })
  }

  function handleRemove(memberId, memberName) {
    if (!window.confirm('Eliminar a ' + memberName + ' del equipo?')) return
    removeMember(memberId)
      .then(function() { refreshOrg(); showMsg('Miembro eliminado') })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleRoleChange(memberId, newRole) {
    updateMemberRole(memberId, newRole)
      .then(function() { refreshOrg(); showMsg('Rol actualizado') })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleCancelInvite(id) {
    cancelInvitation(id)
      .then(function() {
        setInvitations(function(prev) { return prev.filter(function(i) { return i.id !== id }) })
        showMsg('Invitacion cancelada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  var ROLE_LABELS = { owner: 'Propietario', admin: 'Admin', member: 'Miembro', viewer: 'Lector' }
  var ROLE_COLORS = { owner: '#e63946', admin: '#a855f7', member: '#3b82f6', viewer: '#64748b' }

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  if (!org) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Workspace" description="Informacion de tu organizacion">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}>
            {org.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>{org.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '2px' }}>
              {members.length} miembro{members.length !== 1 ? 's' : ''} Â· Plan {org.plan}
            </p>
          </div>
        </div>
      </Section>

      {(myRole === 'owner' || myRole === 'admin') && (
        <Section title="Invitar al equipo" description="Envia un enlace de acceso por email">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              value={email}
              onChange={function(e) { setEmail(e.target.value) }}
              placeholder="email@empresa.com"
              type="email"
              style={Object.assign({}, INP, { flex: 1, minWidth: '200px' })}
              onKeyDown={function(e) { if (e.key === 'Enter') handleInvite() }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <select value={role} onChange={function(e) { setRole(e.target.value) }}
              style={Object.assign({}, SEL, { width: '130px', flexShrink: 0 })}
            >
              <option value="admin">Admin</option>
              <option value="member">Miembro</option>
              <option value="viewer">Lector</option>
            </select>
            <button type="button" onClick={handleInvite} disabled={inviting || !email.trim()}
              style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: inviting || !email.trim() ? 'not-allowed' : 'pointer', opacity: inviting || !email.trim() ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {inviting ? 'Enviando...' : 'Invitar'}
            </button>
          </div>
        </Section>
      )}

      <Section title={'Miembros (' + members.length + ')'} description="Personas con acceso a tu workspace">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(function(m) {
            var profile   = m.profiles || {}
            var name      = profile.full_name || 'Usuario'
            var roleColor = ROLE_COLORS[m.role] || '#64748b'
            var isOwner   = m.role === 'owner'
            var canManage = (myRole === 'owner' || myRole === 'admin') && !isOwner

            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                    {name}
                    {isOwner && <span style={{ fontSize: '10px', color: 'var(--text-5)', marginLeft: '6px' }}>(propietario)</span>}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                    {m.joined_at ? 'Desde ' + new Date(m.joined_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : 'Pendiente'}
                  </p>
                </div>
                {m.role === 'viewer' && (myRole === 'owner' || myRole === 'admin') && (
                  <button type="button" onClick={function() { setManagingAccess(m) }}
                    style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-4)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Gestionar accesos</button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {canManage ? (
                    <select value={m.role} onChange={function(e) { handleRoleChange(m.id, e.target.value) }}
                      style={{ background: 'var(--bg-4)', border: '1px solid var(--border)', color: roleColor, borderRadius: '6px', fontSize: '11px', padding: '4px 8px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Miembro</option>
                      <option value="viewer">Lector</option>
                    </select>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: roleColor + '20', color: roleColor }}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  )}
                  {canManage && (
                    <button type="button" onClick={function() { handleRemove(m.id, name) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px', transition: 'color 0.1s' }}
                      onMouseEnter={function(e) { e.currentTarget.style.color = '#e63946' }}
                      onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(230,57,70,0.5)' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {invitations.length > 0 && (
        <Section title={'Invitaciones pendientes (' + invitations.length + ')'} description="Esperando que acepten la invitacion">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invitations.map(function(inv) {
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    âœ‰ï¸
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.email}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                      Rol: {inv.role} Â· Expira: {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <button type="button" onClick={function() { handleCancelInvite(inv.id) }}
                    style={{ padding: '4px 10px', borderRadius: '6px', background: 'none', border: '1px solid rgba(230,57,70,0.2)', color: 'var(--brand)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Cancelar</button>
                </div>
              )
            })}
          </div>
        </Section>
      )}
      {managingAccess && (
        <ResourceAccessModal member={managingAccess} orgId={org.id} onClose={function() { setManagingAccess(null) }} />
      )}
    </div>
  )
}


export default TeamTab

