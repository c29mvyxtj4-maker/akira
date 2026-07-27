import { useEffect, useState } from 'react'
import { getWorkspace, updateWorkspace } from '@/services/settings.service'
import { Field, INP, SaveBtn, Section, onBlur, onFocus } from './_shared'

function WorkspaceTab() {
  var [ws,      setWs]      = useState({ business_name: '', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)

  useEffect(function() {
    getWorkspace()
      .then(function(data) { setWs(Object.assign({ business_name: '', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es' }, data)) })
      .catch(function(e) { console.error(e) })
      .finally(function() { setLoading(false) })
  }, [])

  function set(k) { return function(e) { setWs(function(f) { return Object.assign({}, f, { [k]: e.target.value }) }) } }

  function handleSave() {
    setSaving(true)
    updateWorkspace({ business_name: ws.business_name, currency: ws.currency, timezone: ws.timezone, language: ws.language })
      .then(function() { setSaved(true); setTimeout(function() { setSaved(false) }, 2500) })
      .catch(function(e) { window.alert('Error: ' + e.message) })
      .finally(function() { setSaving(false) })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  return (
    <div>
      <Section title="Negocio" description="Informacion general de tu empresa">
        <Field label="Nombre del negocio">
          <input value={ws.business_name || ''} onChange={set('business_name')} placeholder="Tu empresa S.L." style={INP} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </Section>

      <Section title="Preferencias regionales" description="Moneda, zona horaria e idioma">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <Field label="Moneda">
            <select value={ws.currency || 'EUR'} onChange={set('currency')} style={SEL}>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dolar</option>
              <option value="GBP">GBP — Libra</option>
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="COP">COP — Peso colombiano</option>
              <option value="ARS">ARS — Peso argentino</option>
            </select>
          </Field>
          <Field label="Zona horaria">
            <select value={ws.timezone || 'Europe/Madrid'} onChange={set('timezone')} style={SEL}>
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/Mexico_City">America/Mexico City</option>
              <option value="America/Bogota">America/Bogota</option>
              <option value="America/Buenos_Aires">America/Buenos Aires</option>
              <option value="America/New_York">America/New York</option>
              <option value="America/Los_Angeles">America/Los Angeles</option>
            </select>
          </Field>
          <Field label="Idioma">
            <select value={ws.language || 'es'} onChange={set('language')} style={SEL}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}


export default WorkspaceTab
