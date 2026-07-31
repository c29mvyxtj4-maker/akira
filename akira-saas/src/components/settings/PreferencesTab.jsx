import { usePrefs } from '@/hooks/usePreferences'
import { Row, RowSection, Toggle, Kbd, RowSelect, MiniBtn } from './_shared'

/*
 * Preferencias (grupo Cuenta) — equivalente a la pantalla "Preferencias" de
 * Notion: atajos, apariencia, comportamiento al iniciar y privacidad. Todo se
 * persiste en localStorage vía usePrefs (opciones de cliente).
 */
function PreferencesTab() {
  var [prefs, setPref] = usePrefs({
    pref_search_shortcut: true,
    pref_bg_animation:    true,
    pref_reduce_motion:   false,
    pref_startup:         'inicio',
    pref_default_page:    'last',
    pref_visit_history:   true,
    pref_profile_visible: true,
  })

  function toggle(key) { return function () { setPref(key, !prefs[key]) } }

  return (
    <div>
      <RowSection title="Escritorio y atajos" description="Controla los atajos de teclado y el comportamiento de la app.">
        <Row title="Usar atajo de búsqueda" description="Abre la paleta de búsqueda de AKIRA con un atajo de teclado.">
          <Toggle checked={prefs.pref_search_shortcut} onClick={toggle('pref_search_shortcut')} />
        </Row>
        <Row title="Acceso directo de búsqueda" description="Combinación para abrir la paleta de comandos.">
          <Kbd>Ctrl / ⌘ + K</Kbd>
        </Row>
        <Row title="Preguntar a AKIRA" description="Combinación para abrir el asistente en la página actual." last>
          <Kbd>Ctrl / ⌘ + J</Kbd>
        </Row>
      </RowSection>

      <RowSection title="Apariencia" description="Personaliza cómo se ve y se mueve AKIRA.">
        <Row title="Fondo animado en Inicio" description="Muestra el fondo de seda animado (Silk) en la pantalla de inicio.">
          <Toggle checked={prefs.pref_bg_animation} onClick={toggle('pref_bg_animation')} />
        </Row>
        <Row title="Reducir movimiento" description="Minimiza animaciones y transiciones en toda la aplicación.">
          <Toggle checked={prefs.pref_reduce_motion} onClick={toggle('pref_reduce_motion')} />
        </Row>
        <Row title="Al iniciar" description="Elige qué pantalla se abre cuando entras en AKIRA." last>
          <RowSelect value={prefs.pref_startup} onChange={function (e) { setPref('pref_startup', e.target.value) }}
            options={[
              { value: 'inicio',    label: 'Inicio' },
              { value: 'dashboard', label: 'Panel' },
              { value: 'last',      label: 'Última página visitada' },
            ]} />
        </Row>
      </RowSection>

      <RowSection title="Privacidad" description="Controla qué información tuya es visible para tu equipo.">
        <Row title="Configuración de cookies" description="Gestiona qué cookies no esenciales permites en AKIRA.">
          <MiniBtn label="Gestionar" onClick={function () { window.alert('Solo usamos cookies esenciales para tu sesión.') }} />
        </Row>
        <Row title="Mostrar mi historial de visitas" description="Las personas con acceso podrán ver cuándo visitaste una página.">
          <Toggle checked={prefs.pref_visit_history} onClick={toggle('pref_visit_history')} />
        </Row>
        <Row title="Visibilidad del perfil" description="Los miembros de tu espacio verán tu nombre y foto de perfil." last>
          <Toggle checked={prefs.pref_profile_visible} onClick={toggle('pref_profile_visible')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default PreferencesTab
