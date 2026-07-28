import { useEffect, useState } from 'react'
import { getCompanySettings, updateCompanySettings } from '@/services/company.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function NotificationsTab() {
  var DEFAULTS = {
    notify_overdue_invoices: true, notify_stale_clients: true, notify_urgent_tasks: true,
    notify_invoice_paid: true, notify_new_portal_message: true, notify_project_deadline: true,
    notify_approval_response: true, notify_weekly_summary: false,
    stale_client_days: 7, project_deadline_days: 3,
  }
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
      notify_overdue_invoices:   cfg.notify_overdue_invoices,
      notify_stale_clients:      cfg.notify_stale_clients,
      notify_urgent_tasks:       cfg.notify_urgent_tasks,
      notify_invoice_paid:       cfg.notify_invoice_paid,
      notify_new_portal_message: cfg.notify_new_portal_message,
      notify_project_deadline:   cfg.notify_project_deadline,
      notify_approval_response:  cfg.notify_approval_response,
      notify_weekly_summary:     cfg.notify_weekly_summary,
      stale_client_days:         Number(cfg.stale_client_days) || 7,
      project_deadline_days:     Number(cfg.project_deadline_days) || 3,
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
          ['notify_overdue_invoices',   'Facturas vencidas', 'Cuando una factura pasa su fecha de vencimiento sin cobrar'],
          ['notify_invoice_paid',       'Facturas pagadas', 'Cuando un cliente paga una factura (por Stripe o manual)'],
          ['notify_stale_clients',      'Clientes sin contactar', 'Cuando un cliente activo lleva demasiado tiempo sin actividad'],
          ['notify_urgent_tasks',       'Tareas urgentes', 'Tareas marcadas como urgentes en tus proyectos'],
          ['notify_project_deadline',   'Proyectos por vencer', 'Cuando un proyecto se acerca a su fecha de entrega'],
          ['notify_new_portal_message', 'Mensajes del portal', 'Cuando un cliente te escribe desde su portal'],
          ['notify_approval_response',  'Respuestas de aprobación', 'Cuando un cliente aprueba, rechaza o pide revisión de una entrega'],
          ['notify_weekly_summary',     'Resumen semanal', 'Recibe cada lunes un email con el resumen de tu negocio'],
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

      {cfg.notify_project_deadline && (
        <Section title="Aviso de entrega" description="Con cuantos dias de antelacion avisarte de un proyecto por vencer">
          <Field label="Dias antes de la entrega">
            <input type="number" min="1" value={cfg.project_deadline_days} onChange={function(e) { setCfg(function(f) { return Object.assign({}, f, { project_deadline_days: e.target.value }) }) }} style={INP} onFocus={onFocus} onBlur={onBlur} />
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
