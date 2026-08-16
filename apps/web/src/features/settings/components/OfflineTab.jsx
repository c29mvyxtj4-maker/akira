import { usePrefs } from '@/shared/hooks/usePreferences'
import { Row, RowSection, Toggle } from './_shared'

/*
 * Sin conexiÃ³n (grupo Funciones) â€” comportamiento de AKIRA cuando no hay red.
 */
function OfflineTab() {
  var [prefs, setPref] = usePrefs({ offline_cache: true, offline_banner: true })
  function toggle(k) { return function () { setPref(k, !prefs[k]) } }
  return (
    <div>
      <RowSection title="Modo sin conexiÃ³n" description="CÃ³mo funciona AKIRA cuando pierdes la conexiÃ³n a internet.">
        <Row title="Guardar pÃ¡ginas para verlas sin conexiÃ³n" description="Mantiene una copia local de las pÃ¡ginas visitadas recientemente para poder consultarlas sin red.">
          <Toggle checked={prefs.offline_cache} onClick={toggle('offline_cache')} />
        </Row>
        <Row title="Avisar cuando estÃ©s sin conexiÃ³n" description="Muestra un aviso cuando se pierde la conexiÃ³n y tus cambios quedan pendientes de sincronizar." last>
          <Toggle checked={prefs.offline_banner} onClick={toggle('offline_banner')} />
        </Row>
      </RowSection>
    </div>
  )
}

export default OfflineTab

