import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ACTION_LABELS, RESOURCE_LABELS, getAuditLog } from '@db/queries/audit.service'
import { INP, Section } from './_shared'

function AuditTab() {
  var [logs,     setLogs]     = useState([])
  var [loading,  setLoading]  = useState(true)
  var [resource, setResource] = useState('all')
  var [action,   setAction]   = useState('all')
  var [expanded, setExpanded] = useState(null)
  var [error,    setError]    = useState('')

  function load() {
    setLoading(true)
    setError('')
    getAuditLog({ resource: resource, action: action })
      .then(function(data) { setLogs(data) })
      .catch(function(e) { setError(e.message) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [resource, action])

  function fmtDateTime(d) {
    return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  return (
    <div>
      <Section title="Registro de actividad" description="Quien hizo que y cuando, en tu cuenta">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' }}>
          <select value={resource} onChange={function(e) { setResource(e.target.value) }} style={SEL}>
            <option value="all">Todos los tipos</option>
            {Object.entries(RESOURCE_LABELS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1]}</option> })}
          </select>
          <select value={action} onChange={function(e) { setAction(e.target.value) }} style={SEL}>
            <option value="all">Todas las acciones</option>
            {Object.entries(ACTION_LABELS).map(function(e) { return <option key={e[0]} value={e[0]}>{e[1].label}</option> })}
          </select>
        </div>
      </Section>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', fontSize: '13px', color: '#e63946', marginBottom: '16px' }}>
          <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
          Sin actividad registrada todavia con estos filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map(function(row) {
            var ac = ACTION_LABELS[row.action] || { label: row.action, color: '#94a3b8' }
            var resourceLabel = RESOURCE_LABELS[row.resource] || row.resource
            var isExpanded = expanded === row.id
            var userName = row.userName || 'Tu'

            return (
              <div key={row.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <button type="button"
                  onClick={function() { setExpanded(isExpanded ? null : row.id) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                      <strong>{userName}</strong>
                      {' '}
                      <span style={{ color: ac.color, fontWeight: 600 }}>{ac.label.toLowerCase()}</span>
                      {' '}
                      {resourceLabel.toLowerCase()}
                      {row.displayName && <span style={{ color: 'var(--text-3)' }}>: {row.displayName}</span>}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '2px' }}>{fmtDateTime(row.created_at)}</p>
                  </div>
                </button>

                {isExpanded && row.changes && row.changes.length > 0 && (
                  <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {row.changes.map(function(c, i) {
                      return (
                        <div key={i} style={{ fontSize: '11px', color: 'var(--text-4)', padding: '6px 10px', background: 'var(--bg-4)', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--text-2)' }}>{c.field}</strong>: {String(c.from)} â†’ {String(c.to)}
                        </div>
                      )
                    })}
                  </div>
                )}

                {isExpanded && (!row.changes || row.changes.length === 0) && row.action !== 'updated' && (
                  <div style={{ padding: '0 14px 12px', fontSize: '11px', color: 'var(--text-5)' }}>
                    Sin detalles adicionales para este tipo de accion.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


export default AuditTab

