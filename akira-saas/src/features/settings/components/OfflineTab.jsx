import { usePrefs } from '@/hooks/usePreferences'
import { Row, RowSection, Toggle } from './_shared'

/*
 * Sin conexión (grupo Funciones) — comportamiento de AKIRA cuando no hay red.
 */
function OfflineTab() {
  var [prefs, setPref] = usePrefs({ offline_cache: true, offline_banner: true })
  function toggle(k) { return function () { setPref(k, !prefs[k]) } }
  return (
    <div>
      <RowSection title="Modo sin conexión" description="Cómo funciona AKIRA cuando pierdes la conexión a internet.">
        <Row title="Guardar páginas para verlas sin conexión" description="Mantiene una copia local de las páginas visitadas recientemente para poder consultarlas sin red.">
          <Toggle checked={prefs.offline_cache} onClick={toggle('offline_cache')} />
        </Row>
        <Row title="Avisar cuando estés sin conexión" description="Muestra un aviso cuando se pierde la conexión y tus cambios quedan pendientes de sincronizar." last>
          <Toggle checked={prefs.offline_banner} onClick={toggle('offline_banner')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default OfflineTab
