import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { getUserAccess, grantAccess, revokeAccess } from '@db/queries/resourceAccess.service'

function Toggle({ checked, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ position: 'relative', width: '32px', height: '18px', borderRadius: '9px', border: 'none', background: checked ? 'var(--brand)' : '#374151', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: '2px', left: checked ? '16px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  )
}

export default function ResourceAccessModal({ member, orgId, onClose }) {
  var [clients,  setClients]  = useState([])
  var [projects, setProjects] = useState([])
  var [access,   setAccess]   = useState([])
  var [loading,  setLoading]  = useState(true)
  var [tab,      setTab]      = useState('clients')

  useEffect(function() {
    Promise.all([
      supabase.from('clients').select('id, name, company').eq('archived', false).order('name'),
      supabase.from('projects').select('id, name').eq('archived', false).order('name'),
      getUserAccess(member.user_id),
    ]).then(function(results) {
      setClients(results[0].data || [])
      setProjects(results[1].data || [])
      setAccess(results[2])
    }).finally(function() { setLoading(false) })
  }, [member.user_id])

  function hasAccess(type, id) {
    return access.some(function(a) { return a.resource_type === type && a.resource_id === id })
  }

  function toggle(type, id) {
    if (hasAccess(type, id)) {
      revokeAccess(member.user_id, type, id)
        .then(function() { setAccess(function(prev) { return prev.filter(function(a) { return !(a.resource_type === type && a.resource_id === id) }) }) })
        .catch(function(e) { window.alert(e.message) })
    } else {
      grantAccess(orgId, member.user_id, type, id)
        .then(function(row) { setAccess(function(prev) { return prev.concat([row]) }) })
        .catch(function(e) { window.alert(e.message) })
    }
  }

  var memberName = (member.profiles && member.profiles.full_name) || 'este miembro'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={function(e) { e.stopPropagation() }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Gestionar accesos</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '4px' }}>
              {memberName} solo vera los clientes y proyectos que marques aqui
            </p>
          </div>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <div style={{ display: 'flex', gap: '1px', borderBottom: '1px solid var(--border)' }}>
            {[{ id: 'clients', label: 'Clientes (' + clients.length + ')' }, { id: 'projects', label: 'Proyectos (' + projects.length + ')' }].map(function(t) {
              return (
                <button key={t.id} type="button" onClick={function() { setTab(t.id) }}
                  style={{ flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--brand)' : 'var(--text-4)', borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent' }}
                >{t.label}</button>
              )
            })}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-4)' }}>Cargando...</div>
            ) : tab === 'clients' ? (
              clients.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-4)', textAlign: 'center', padding: '20px' }}>Sin clientes todavia</p>
              ) : clients.map(function(c) {
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{c.name}{c.company ? ' â€” ' + c.company : ''}</span>
                    <Toggle checked={hasAccess('client', c.id)} onClick={function() { toggle('client', c.id) }} />
                  </div>
                )
              })
            ) : (
              projects.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-4)', textAlign: 'center', padding: '20px' }}>Sin proyectos todavia</p>
              ) : projects.map(function(p) {
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{p.name}</span>
                    <Toggle checked={hasAccess('project', p.id)} onClick={function() { toggle('project', p.id) }} />
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >Listo</button>
          </div>
        </div>
      </div>
    </div>
  )
}

