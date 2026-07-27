import { useEffect, useState } from 'react'
import { getCompanySettings, updateCompanySettings } from '@/services/company.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function NotificationsTab() {
  var DEFAULTS = { notify_overdue_invoices: true, notify_stale_clients: true, notify_urgent_tasks: true, stale_client_days: 7 }
  var [cfg,     setCfg]     = useState(DEFAULTS)
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getCompanySettings()
      .then(function(data) { setCfg(Object.assign({}, DEFAULTS, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function toggle(key) {
    return function() { setCfg(function(f) { return Object.assign({}, f, { [key]: !f[key] }) }) }
  }

  function handleSave() {
    setSaving(true)
    updateCompanySettings({
      notify_overdue_invoices: cfg.notify_overdue_invoices,
      notify_stale_clients:    cfg.notify_stale_clients,
      notify_urgent_tasks:     cfg.notify_urgent_tasks,
      stale_client_days:       Number(cfg.stale_client_days) || 7,
    })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  function Toggle({ checked, onClick }) {
    return (
      <button type="button" onClick={onClick}
        style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', border: 'none', background: checked ? 'var(--brand)' : '#374151', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    )
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  return (
    <div>
      <Section title="Que quieres que te avise la campana" description="Activa o desactiva cada tipo de aviso">
        {[
          ['notify_overdue_invoices', 'Facturas vencidas', 'Cuando una factura pasa su fecha de vencimiento sin cobrar'],
          ['notify_stale_clients',    'Clientes sin contactar', 'Cuando un cliente activo lleva demasiado tiempo sin actividad'],
          ['notify_urgent_tasks',     'Tareas urgentes', 'Tareas marcadas como urgentes en tus proyectos'],
        ].map(function(row) {
          return (
            <div key={row[0]} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{row[1]}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{row[2]}</p>
              </div>
              <Toggle checked={cfg[row[0]]} onClick={toggle(row[0])} />
            </div>
          )
        })}
      </Section>

      {cfg.notify_stale_clients && (
        <Section title="Sensibilidad del aviso" description="A partir de cuantos dias sin actividad se considera un cliente frio">
          <Field label="Dias sin contacto">
            <input type="number" min="1" value={cfg.stale_client_days} onChange={function(e) { setCfg(function(f) { return Object.assign({}, f, { stale_client_days: e.target.value }) }) }} style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </Section>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}


export default NotificationsTab
