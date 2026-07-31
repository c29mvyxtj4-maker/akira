import { usePrefs } from '@/hooks/usePreferences'
import { Row, RowSection, Toggle, RowSelect, MiniBtn } from './_shared'

/*
 * Notificaciones (grupo Cuenta) — push y por correo, estilo Notion. Cada opción
 * se persiste en localStorage y lleva su descripción. "Enviar notificación de
 * prueba" pide permiso al navegador y lanza una notificación local.
 */
function NotificationsTab() {
  var [prefs, setPref] = usePrefs({
    ntf_mentions:      true,
    ntf_meetings:      true,
    ntf_calendar:      true,
    ntf_sound:         'blip',
    eml_activity:      true,
    eml_always:        false,
    eml_page_updates:  true,
    eml_ws_summary:    true,
    eml_news:          false,
  })

  function toggle(key) { return function () { setPref(key, !prefs[key]) } }

  function sendTest() {
    if (!('Notification' in window)) { window.alert('Tu navegador no soporta notificaciones.'); return }
    function fire() {
      try { new Notification('AKIRA', { body: 'Notificación de prueba — todo funciona 🔔' }) }
      catch (_) { window.alert('Notificación de prueba enviada.') }
    }
    if (Notification.permission === 'granted') fire()
    else if (Notification.permission !== 'denied') Notification.requestPermission().then(function (p) { if (p === 'granted') fire() })
    else window.alert('Has bloqueado las notificaciones para este sitio.')
  }

  return (
    <div>
      <RowSection title="Notificaciones push" description="Avisos en tiempo real en este dispositivo.">
        <Row title="Comentarios y menciones" description="Cuando alguien te menciona o comenta en algo tuyo.">
          <Toggle checked={prefs.ntf_mentions} onClick={toggle('ntf_mentions')} />
        </Row>
        <Row title="Detección de reuniones" description="Avisa cuando detectamos que te has unido a una videollamada.">
          <Toggle checked={prefs.ntf_meetings} onClick={toggle('ntf_meetings')} />
        </Row>
        <Row title="Eventos del calendario" description="Recordatorios de los eventos de tu calendario.">
          <Toggle checked={prefs.ntf_calendar} onClick={toggle('ntf_calendar')} />
        </Row>
        <Row title="Sonido de notificación" description="Sonido que se reproduce al recibir un aviso.">
          <RowSelect value={prefs.ntf_sound} onChange={function (e) { setPref('ntf_sound', e.target.value) }}
            options={[{ value: 'blip', label: 'Blip' }, { value: 'ping', label: 'Ping' }, { value: 'none', label: 'Silencio' }]} />
        </Row>
        <Row title="Enviar notificación de prueba" description="Comprueba que las notificaciones funcionan en este dispositivo." last>
          <MiniBtn label="Enviar prueba" onClick={sendTest} />
        </Row>
      </RowSection>

      <RowSection title="Notificaciones por correo electrónico" description="Qué te enviamos a tu email.">
        <Row title="Actividad en mi espacio de trabajo" description="Menciones, invitaciones, cambios y comentarios relevantes.">
          <Toggle checked={prefs.eml_activity} onClick={toggle('eml_activity')} />
        </Row>
        <Row title="Enviar siempre notificaciones por correo" description="Recibe correos aunque estés usando AKIRA en ese momento.">
          <Toggle checked={prefs.eml_always} onClick={toggle('eml_always')} />
        </Row>
        <Row title="Actualizaciones de la página" description="Resúmenes de las páginas para las que activaste avisos.">
          <Toggle checked={prefs.eml_page_updates} onClick={toggle('eml_page_updates')} />
        </Row>
        <Row title="Resumen del espacio de trabajo" description="Un resumen periódico de lo que pasa en tu negocio.">
          <Toggle checked={prefs.eml_ws_summary} onClick={toggle('eml_ws_summary')} />
        </Row>
        <Row title="Correos sobre novedades y actualizaciones" description="Novedades de producto y consejos de AKIRA." last>
          <Toggle checked={prefs.eml_news} onClick={toggle('eml_news')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default NotificationsTab
