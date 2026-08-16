import { usePrefs } from '@/shared/hooks/usePreferences'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { Row, RowSection, Toggle, Kbd, RowSelect, MiniBtn } from './_shared'

/*
 * Preferencias (grupo Cuenta) â€” apariencia, idioma y hora, app de escritorio y
 * privacidad. Cada opciÃ³n se persiste en localStorage (usePrefs) y lleva una
 * breve descripciÃ³n debajo. El tema se aplica de verdad (clase .light en la raÃ­z).
 */
function PreferencesTab() {
  var { language, changeLanguage } = useLanguage()
  var [prefs, setPref] = usePrefs({
    pref_theme:           'system',
    pref_high_contrast:   false,
    pref_bg_animation:    true,
    pref_reduce_motion:   false,
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

  // El tema / contraste / reducir-movimiento se aplican globalmente en
  // lib/applyPrefs.js (reacciona al evento 'akira-prefs-change' que emite usePrefs).
  function toggle(key) { return function () { setPref(key, !prefs[key]) } }
  function onSel(key) { return function (e) { setPref(key, e.target.value) } }
  function onLanguageChange(e) { changeLanguage(e.target.value) }

  return (
    <div>
      <RowSection title="Apariencia" description="CÃ³mo se ve y se mueve AKIRA.">
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
        <Row title="Reducir movimiento" description="Minimiza animaciones y transiciones en toda la aplicaciÃ³n." last>
          <Toggle checked={prefs.pref_reduce_motion} onClick={toggle('pref_reduce_motion')} />
        </Row>
      </RowSection>

      <RowSection title="Idioma y hora" description="Idioma, formatos y zona horaria.">
        <Row title="Idioma de la aplicaciÃ³n" description="Idioma de la interfaz de AKIRA.">
          <RowSelect value={language} onChange={onLanguageChange}
            options={[{ value: 'es', label: 'EspaÃ±ol' }, { value: 'ca', label: 'CatalÃ ' }, { value: 'en', label: 'English' }]} />
        </Row>
        <Row title="Formato de nÃºmero" description="CÃ³mo se muestran los miles y decimales (1.000,00 vs 1,000.00).">
          <RowSelect value={prefs.pref_number_format} onChange={onSel('pref_number_format')}
            options={[{ value: 'es-ES', label: '1.234,56' }, { value: 'en-US', label: '1,234.56' }]} />
        </Row>
        <Row title="Mostrar siempre los controles de direcciÃ³n de texto" description="Ãštil si escribes en idiomas de derecha a izquierda.">
          <Toggle checked={prefs.pref_text_direction} onClick={toggle('pref_text_direction')} />
        </Row>
        <Row title="Idiomas del corrector ortogrÃ¡fico" description="Idioma con el que se revisa la ortografÃ­a al escribir.">
          <RowSelect value={prefs.pref_spellcheck} onChange={onSel('pref_spellcheck')}
            options={[{ value: 'es', label: 'EspaÃ±ol' }, { value: 'en', label: 'InglÃ©s' }, { value: 'es,en', label: 'EspaÃ±ol + InglÃ©s' }, { value: 'off', label: 'Desactivado' }]} />
        </Row>
        <Row title="Comenzar la semana el lunes" description="Afecta a la vista del calendario y a los resÃºmenes semanales.">
          <Toggle checked={prefs.pref_week_monday} onClick={toggle('pref_week_monday')} />
        </Row>
        <Row title="Formato de fecha" description="Orden de dÃ­a, mes y aÃ±o.">
          <RowSelect value={prefs.pref_date_format} onChange={onSel('pref_date_format')}
            options={[{ value: 'dmy', label: 'DD/MM/AAAA' }, { value: 'mdy', label: 'MM/DD/AAAA' }, { value: 'ymd', label: 'AAAA-MM-DD' }]} />
        </Row>
        <Row title="Establecer automÃ¡ticamente la zona horaria segÃºn ubicaciÃ³n" description="Usa la zona horaria de tu dispositivo.">
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

      <RowSection title="AplicaciÃ³n de escritorio" description="Atajos y comportamiento al abrir AKIRA.">
        <Row title="Usar atajo de bÃºsqueda" description="Abre la paleta de bÃºsqueda con un atajo de teclado.">
          <Toggle checked={prefs.pref_search_shortcut} onClick={toggle('pref_search_shortcut')} />
        </Row>
        <Row title="Acceso directo del atajo de bÃºsqueda" description="CombinaciÃ³n para abrir la paleta de comandos.">
          <Kbd>Ctrl / âŒ˜ + K</Kbd>
        </Row>
        <Row title="Acceso directo a AKIRA IA" description="CombinaciÃ³n para abrir el asistente en la pÃ¡gina actual.">
          <Kbd>Ctrl / âŒ˜ + J</Kbd>
        </Row>
        <Row title="Al iniciar" description="QuÃ© pantalla se abre cuando entras en AKIRA." last>
          <RowSelect value={prefs.pref_startup} onChange={onSel('pref_startup')}
            options={[{ value: 'inicio', label: 'Inicio' }, { value: 'dashboard', label: 'Panel' }, { value: 'last', label: 'Ãšltima pÃ¡gina visitada' }]} />
        </Row>
      </RowSection>

      <RowSection title="Privacidad" description="QuÃ© informaciÃ³n tuya es visible y quÃ© cookies permites.">
        <Row title="ConfiguraciÃ³n de cookies" description="Gestiona quÃ© cookies no esenciales permites en AKIRA.">
          <MiniBtn label="Gestionar" onClick={function () { window.alert('AKIRA usa solo cookies esenciales para tu sesiÃ³n. No hay cookies publicitarias.') }} />
        </Row>
        <Row title="Mostrar mi historial de visitas" description="Las personas con acceso podrÃ¡n ver cuÃ¡ndo visitaste una pÃ¡gina.">
          <Toggle checked={prefs.pref_visit_history} onClick={toggle('pref_visit_history')} />
        </Row>
        <Row title="Visibilidad del perfil" description="Los miembros de tu espacio verÃ¡n tu nombre y foto de perfil." last>
          <Toggle checked={prefs.pref_profile_visible} onClick={toggle('pref_profile_visible')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default PreferencesTab

