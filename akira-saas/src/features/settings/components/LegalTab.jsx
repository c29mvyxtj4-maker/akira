import { Shield, FileText, Scale } from 'lucide-react'
import { Row, RowSection, MiniBtn } from './_shared'

/*
 * Legal (grupo Cuenta) — accesos a la información legal (privacidad, términos,
 * aviso legal) y resumen de cumplimiento RGPD. Abre la página /legal.
 */
function open(hash) { window.open('/legal', '_blank', 'noopener') }

function LegalTab() {
  return (
    <div>
      <RowSection title="Documentos legales" description="La información legal de AKIRA, conforme al RGPD y la LSSI.">
        <Row title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Shield style={{ width: '15px', height: '15px', color: 'var(--brand)' }} /> Política de Privacidad</span>}
          description="Qué datos tratamos, con qué fin y qué derechos tienes.">
          <MiniBtn label="Abrir" onClick={open} />
        </Row>
        <Row title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FileText style={{ width: '15px', height: '15px', color: 'var(--brand)' }} /> Términos del Servicio</span>}
          description="Las condiciones de uso de AKIRA.">
          <MiniBtn label="Abrir" onClick={open} />
        </Row>
        <Row title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Scale style={{ width: '15px', height: '15px', color: 'var(--brand)' }} /> Aviso Legal</span>}
          description="Identificación del titular conforme a la LSSI-CE." last>
          <MiniBtn label="Abrir" onClick={open} />
        </Row>
      </RowSection>

      <RowSection title="Tus derechos (RGPD)" description="Puedes ejercerlos en cualquier momento.">
        <Row title="Exportar mis datos" description="Descarga una copia completa de tu información (derecho de portabilidad).">
          <MiniBtn label="Ir a exportar" onClick={function () { window.alert('Ve a Ajustes → Importar y exportar.') }} />
        </Row>
        <Row title="Eliminar mis datos" description="Solicita la supresión de tu cuenta y datos (derecho al olvido)." last>
          <MiniBtn label="Solicitar" danger onClick={function () { window.location.href = 'mailto:marcroson7@gmail.com?subject=' + encodeURIComponent('Derechos RGPD') }} />
        </Row>
      </RowSection>
    </div>
  )
}

export default LegalTab
