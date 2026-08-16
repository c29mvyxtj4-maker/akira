import { usePrefs } from '@/shared/hooks/usePreferences'
import { Row, RowSection, Toggle, RowSelect, MiniBtn } from './_shared'

/*
 * Notificaciones (grupo Cuenta) â€” push y por correo, estilo Notion. Cada opciÃ³n
 * se persiste en localStorage y lleva su descripciÃ³n. "Enviar notificaciÃ³n de
 * prueba" pide permiso al navegador y lanza una notificaciÃ³n local.
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
      try { new Notification('AKIRA', { body: 'NotificaciÃ³n de prueba â€” todo funciona ðŸ””' }) }
      catch (_) { window.alert('NotificaciÃ³n de prueba enviada.') }
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
        <Row title="DetecciÃ³n de reuniones" description="Avisa cuando detectamos que te has unido a una videollamada.">
          <Toggle checked={prefs.ntf_meetings} onClick={toggle('ntf_meetings')} />
        </Row>
        <Row title="Eventos del calendario" description="Recordatorios de los eventos de tu calendario.">
          <Toggle checked={prefs.ntf_calendar} onClick={toggle('ntf_calendar')} />
        </Row>
        <Row title="Sonido de notificaciÃ³n" description="Sonido que se reproduce al recibir un aviso.">
          <RowSelect value={prefs.ntf_sound} onChange={function (e) { setPref('ntf_sound', e.target.value) }}
            options={[{ value: 'blip', label: 'Blip' }, { value: 'ping', label: 'Ping' }, { value: 'none', label: 'Silencio' }]} />
        </Row>
        <Row title="Enviar notificaciÃ³n de prueba" description="Comprueba que las notificaciones funcionan en este dispositivo." last>
          <MiniBtn label="Enviar prueba" onClick={sendTest} />
        </Row>
      </RowSection>

      <RowSection title="Notificaciones por correo electrÃ³nico" description="QuÃ© te enviamos a tu email.">
        <Row title="Actividad en mi espacio de trabajo" description="Menciones, invitaciones, cambios y comentarios relevantes.">
          <Toggle checked={prefs.eml_activity} onClick={toggle('eml_activity')} />
        </Row>
        <Row title="Enviar siempre notificaciones por correo" description="Recibe correos aunque estÃ©s usando AKIRA en ese momento.">
          <Toggle checked={prefs.eml_always} onClick={toggle('eml_always')} />
        </Row>
        <Row title="Actualizaciones de la pÃ¡gina" description="ResÃºmenes de las pÃ¡ginas para las que activaste avisos.">
          <Toggle checked={prefs.eml_page_updates} onClick={toggle('eml_page_updates')} />
        </Row>
        <Row title="Resumen del espacio de trabajo" description="Un resumen periÃ³dico de lo que pasa en tu negocio.">
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

