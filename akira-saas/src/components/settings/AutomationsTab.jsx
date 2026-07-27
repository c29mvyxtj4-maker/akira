import { useEffect, useState } from 'react'
import { getCompanySettings, updateCompanySettings } from '@/services/company.service'
import { SaveBtn, Section } from './_shared'

function AutomationsTab() {
  var DEFAULTS = { auto_finance_on_paid: true, auto_followup_new_client: true, auto_review_on_completed: true }
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
      auto_finance_on_paid:     cfg.auto_finance_on_paid,
      auto_followup_new_client: cfg.auto_followup_new_client,
      auto_review_on_completed: cfg.auto_review_on_completed,
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
      <Section title="Automatizaciones activas" description="La base de datos las ejecuta sola, sin que necesites tener la app abierta">
        {[
          ['auto_finance_on_paid', 'Factura pagada → ingreso en Finanzas', 'Al marcar una factura como pagada, se registra automaticamente el ingreso'],
          ['auto_followup_new_client', 'Cliente nuevo → seguimiento a 7 dias', 'Se crea un evento de calendario recordandote contactarlo'],
          ['auto_review_on_completed', 'Proyecto completado → pedir reseña a 3 dias', 'Se crea un evento de calendario para pedirle feedback al cliente'],
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

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}


export default AutomationsTab
