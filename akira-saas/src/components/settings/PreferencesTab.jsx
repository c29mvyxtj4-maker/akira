import { useEffect } from 'react'
import { usePrefs } from '@/hooks/usePreferences'
import { Row, RowSection, Toggle, Kbd, RowSelect, MiniBtn } from './_shared'

/*
 * Preferencias (grupo Cuenta) — apariencia, idioma y hora, app de escritorio y
 * privacidad. Cada opción se persiste en localStorage (usePrefs) y lleva una
 * breve descripción debajo. El tema se aplica de verdad (clase .light en la raíz).
 */
function PreferencesTab() {
  var [prefs, setPref] = usePrefs({
    pref_theme:           'system',
    pref_high_contrast:   false,
    pref_bg_animation:    true,
    pref_reduce_motion:   false,
    pref_language:        'es',
    pref_number_format:   'es-ES',
    pref_text_direction:  false,
    pref_spellcheck:      'es',
    pref_week_monday:     true,
    pref_date_format:     'dmy',
    pref_tz_auto:         true,
    pref_timezone:        'Europe/Madrid',
    pref_search_shortcut: true,
    pref_startup:         'inicio',
    pref_visit_history:   true,
    pref_profile_visible: true,
  })

  function toggle(key) { return function () { setPref(key, !prefs[key]) } }
  function onSel(key) { return function (e) { setPref(key, e.target.value) } }

  // Aplica el tema de verdad (clase .light) según preferencia o sistema.
  useEffect(function () {
    var root = document.documentElement
    var wantLight = prefs.pref_theme === 'light' ||
      (prefs.pref_theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
    root.classList.toggle('light', !!wantLight)
    root.classList.toggle('high-contrast', !!prefs.pref_high_contrast)
  }, [prefs.pref_theme, prefs.pref_high_contrast])

  return (
    <div>
      <RowSection title="Apariencia" description="Cómo se ve y se mueve AKIRA.">
        <Row title="Tema" description="Claro, oscuro o el mismo que tu dispositivo.">
          <RowSelect value={prefs.pref_theme} onChange={onSel('pref_theme')}
            options={[{ value: 'system', label: 'Como el dispositivo' }, { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]} />
        </Row>
        <Row title="Contraste alto" description="Aumenta el contraste de textos y bordes para mejorar la legibilidad.">
          <Toggle checked={prefs.pref_high_contrast} onClick={toggle('pref_high_contrast')} />
        </Row>
        <Row title="Fondo animado en Inicio" description="Muestra el fondo de seda animado (Silk) en la pantalla de inicio.">
          <Toggle checked={prefs.pref_bg_animation} onClick={toggle('pref_bg_animation')} />
        </Row>
        <Row title="Reducir movimiento" description="Minimiza animaciones y transiciones en toda la aplicación." last>
          <Toggle checked={prefs.pref_reduce_motion} onClick={toggle('pref_reduce_motion')} />
        </Row>
      </RowSection>

      <RowSection title="Idioma y hora" description="Idioma, formatos y zona horaria.">
        <Row title="Idioma de la aplicación" description="Idioma de la interfaz de AKIRA.">
          <RowSelect value={prefs.pref_language} onChange={onSel('pref_language')}
            options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]} />
        </Row>
        <Row title="Formato de número" description="Cómo se muestran los miles y decimales (1.000,00 vs 1,000.00).">
          <RowSelect value={prefs.pref_number_format} onChange={onSel('pref_number_format')}
            options={[{ value: 'es-ES', label: '1.234,56' }, { value: 'en-US', label: '1,234.56' }]} />
        </Row>
        <Row title="Mostrar siempre los controles de dirección de texto" description="Útil si escribes en idiomas de derecha a izquierda.">
          <Toggle checked={prefs.pref_text_direction} onClick={toggle('pref_text_direction')} />
        </Row>
        <Row title="Idiomas del corrector ortográfico" description="Idioma con el que se revisa la ortografía al escribir.">
          <RowSelect value={prefs.pref_spellcheck} onChange={onSel('pref_spellcheck')}
            options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' }, { value: 'es,en', label: 'Español + Inglés' }, { value: 'off', label: 'Desactivado' }]} />
        </Row>
        <Row title="Comenzar la semana el lunes" description="Afecta a la vista del calendario y a los resúmenes semanales.">
          <Toggle checked={prefs.pref_week_monday} onClick={toggle('pref_week_monday')} />
        </Row>
        <Row title="Formato de fecha" description="Orden de día, mes y año.">
          <RowSelect value={prefs.pref_date_format} onChange={onSel('pref_date_format')}
            options={[{ value: 'dmy', label: 'DD/MM/AAAA' }, { value: 'mdy', label: 'MM/DD/AAAA' }, { value: 'ymd', label: 'AAAA-MM-DD' }]} />
        </Row>
        <Row title="Establecer automáticamente la zona horaria según ubicación" description="Usa la zona horaria de tu dispositivo.">
          <Toggle checked={prefs.pref_tz_auto} onClick={toggle('pref_tz_auto')} />
        </Row>
        <Row title="Zona horaria" description="Se usa para eventos, recordatorios y fechas." last>
          <RowSelect value={prefs.pref_timezone} onChange={onSel('pref_timezone')}
            options={[
              { value: 'Europe/Madrid', label: 'Europe/Madrid' },
              { value: 'Europe/London', label: 'Europe/London' },
              { value: 'America/Mexico_City', label: 'America/Mexico City' },
              { value: 'America/Bogota', label: 'America/Bogota' },
              { value: 'America/Buenos_Aires', label: 'America/Buenos Aires' },
              { value: 'America/New_York', label: 'America/New York' },
            ]} />
        </Row>
      </RowSection>

      <RowSection title="Aplicación de escritorio" description="Atajos y comportamiento al abrir AKIRA.">
        <Row title="Usar atajo de búsqueda" description="Abre la paleta de búsqueda con un atajo de teclado.">
          <Toggle checked={prefs.pref_search_shortcut} onClick={toggle('pref_search_shortcut')} />
        </Row>
        <Row title="Acceso directo del atajo de búsqueda" description="Combinación para abrir la paleta de comandos.">
          <Kbd>Ctrl / ⌘ + K</Kbd>
        </Row>
        <Row title="Acceso directo a AKIRA IA" description="Combinación para abrir el asistente en la página actual.">
          <Kbd>Ctrl / ⌘ + J</Kbd>
        </Row>
        <Row title="Al iniciar" description="Qué pantalla se abre cuando entras en AKIRA." last>
          <RowSelect value={prefs.pref_startup} onChange={onSel('pref_startup')}
            options={[{ value: 'inicio', label: 'Inicio' }, { value: 'dashboard', label: 'Panel' }, { value: 'last', label: 'Última página visitada' }]} />
        </Row>
      </RowSection>

      <RowSection title="Privacidad" description="Qué información tuya es visible y qué cookies permites.">
        <Row title="Configuración de cookies" description="Gestiona qué cookies no esenciales permites en AKIRA.">
          <MiniBtn label="Gestionar" onClick={function () { window.alert('AKIRA usa solo cookies esenciales para tu sesión. No hay cookies publicitarias.') }} />
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
