import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { getWorkspace, updateWorkspace } from '@/services/settings.service'
import { useOrg } from '@/shared/context/OrgContext'
import { usePrefs } from '@/shared/hooks/usePreferences'
import { Field, INP, SaveBtn, Section, RowSection, Row, Toggle, RowSelect, MiniBtn, onBlur, onFocus } from './_shared'

/*
 * General (grupo Espacio de trabajo) –” datos del negocio + configuración del
 * espacio, exportación, estadísticas, personas, zona de riesgo e ID. Los datos
 * de negocio se guardan en Supabase; el resto son preferencias del espacio.
 */
function WorkspaceTab() {
  var org = useOrg()
  var [ws,      setWs]      = useState({ business_name: '', currency: 'EUR', timezone: 'Europe/Madrid', language: 'es' })
  var [loading, setLoading] = useState(true)
  var [saving,  setSaving]  = useState(false)
  var [saved,   setSaved]   = useState(false)
  var [copied,  setCopied]  = useState(false)
  var [prefs, setPref] = usePrefs({
    ws_landing: 'inicio', ws_stats: true,
    ws_people_activity: true, ws_people_hovercard: true,
  })

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

  function copyId() {
    if (!org.org) return
    try { navigator.clipboard.writeText(org.org.id) } catch (_) { /* noop */ }
    setCopied(true); setTimeout(function () { setCopied(false) }, 1800)
  }

  function deleteWorkspace() {
    var name = org.org ? org.org.name : 'este espacio'
    if (!window.confirm('¿Eliminar "' + name + '"? Esta acción es delicada. Por seguridad se procesa manualmente; se abrirá tu correo con la solicitud.')) return
    window.location.href = 'mailto:marcroson7@gmail.com?subject=' + encodeURIComponent('Eliminar espacio de trabajo AKIRA') + '&body=' + encodeURIComponent('Quiero eliminar el espacio de trabajo ' + (org.org ? org.org.id : '') + '.')
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>

  var SEL = Object.assign({}, INP, { cursor: 'pointer' })

  return (
    <div>
      <RowSection title="Configuración del espacio de trabajo" description="Identidad y comportamiento de tu espacio.">
        <div style={{ padding: '14px 0' }}>
          <Field label="Nombre del espacio de trabajo" hint="El nombre visible de tu negocio dentro de AKIRA.">
            <input value={ws.business_name || ''} onChange={set('business_name')} placeholder="Tu empresa S.L." style={INP} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        <Row title="Icono" description="Una imagen o emoji que representa tu espacio en la barra y las notificaciones.">
          <span style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {(ws.business_name || (org.org && org.org.name) || 'A')[0].toUpperCase()}
          </span>
        </Row>
        <Row title="Página de destino personalizada" description="La primera página que ve un miembro nuevo al entrar al espacio." last>
          <RowSelect value={prefs.ws_landing} onChange={function (e) { setPref('ws_landing', e.target.value) }}
            options={[{ value: 'inicio', label: 'Inicio' }, { value: 'dashboard', label: 'Panel' }, { value: 'projects', label: 'Proyectos' }, { value: 'clients', label: 'Clientes' }]} />
        </Row>
      </RowSection>

      <Section title="Preferencias regionales" description="Moneda, zona horaria e idioma del negocio">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <Field label="Moneda">
            <select value={ws.currency || 'EUR'} onChange={set('currency')} style={SEL}>
              <option value="EUR">EUR –” Euro</option>
              <option value="USD">USD –” Dolar</option>
              <option value="GBP">GBP –” Libra</option>
              <option value="MXN">MXN –” Peso mexicano</option>
              <option value="COP">COP –” Peso colombiano</option>
              <option value="ARS">ARS –” Peso argentino</option>
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
            </select>
          </Field>
          <Field label="Idioma">
            <select value={ws.language || 'es'} onChange={set('language')} style={SEL}>
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
        </div>
      </Section>

      <RowSection title="Exportar" description="Descarga el contenido de tu espacio de trabajo.">
        <Row title="Contenido del espacio de trabajo" description="Descarga clientes, proyectos, facturas y más en Ajustes –†’ Importar y exportar.">
          <MiniBtn label="Ver exportación" onClick={function () { window.alert('Ve a Ajustes –†’ Importar y exportar para descargar tus datos.') }} />
        </Row>
        <Row title="Miembros" description="Exporta la lista de personas de tu espacio de trabajo." last>
          <MiniBtn label="Exportar CSV" onClick={function () { window.alert('Disponible en el panel de Personas.') }} />
        </Row>
      </RowSection>

      <RowSection title="Estadísticas" description="Métricas de uso del espacio.">
        <Row title="Guardar y mostrar estadísticas de visitas" description="Cuenta cuántas veces se visita cada página del espacio." last>
          <Toggle checked={prefs.ws_stats} onClick={function () { setPref('ws_stats', !prefs.ws_stats) }} />
        </Row>
      </RowSection>

      <RowSection title="Personas" description="Cómo se muestran las personas del espacio.">
        <Row title="Directorio personal" description="Un listado de todas las personas del espacio de trabajo.">
          <MiniBtn label="Abrir" onClick={function () { window.alert('Gestiona las personas en el apartado Personas.') }} />
        </Row>
        <Row title="Mostrar la actividad reciente en los perfiles" description="Muestra la Àºltima actividad de cada persona en su perfil.">
          <Toggle checked={prefs.ws_people_activity} onClick={function () { setPref('ws_people_activity', !prefs.ws_people_activity) }} />
        </Row>
        <Row title="Tarjeta al pasar el cursor" description="Muestra una tarjeta con datos de la persona al pasar el ratón por su nombre." last>
          <Toggle checked={prefs.ws_people_hovercard} onClick={function () { setPref('ws_people_hovercard', !prefs.ws_people_hovercard) }} />
        </Row>
      </RowSection>

      <RowSection title="Zona de riesgo" description="Acciones delicadas sobre el espacio de trabajo.">
        <Row title="Eliminar espacio de trabajo" description="Elimina este espacio y todo su contenido de forma permanente." last>
          <MiniBtn label="Eliminar" danger onClick={deleteWorkspace} />
        </Row>
      </RowSection>

      <RowSection title="ID del espacio de trabajo" description="Identificador Àºnico del espacio (Àºtil para soporte).">
        <Row title="ID del espacio de trabajo" description={org.org ? org.org.id : '–”'} last>
          <MiniBtn label={copied ? 'Copiado' : 'Copiar'} icon={copied ? Check : Copy} onClick={copyId} />
        </Row>
      </RowSection>
    </div>
  )
}

export default WorkspaceTab


