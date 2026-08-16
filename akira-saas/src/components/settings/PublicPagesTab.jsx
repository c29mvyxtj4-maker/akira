import { usePrefs } from '@/shared/hooks/usePreferences'
import { Row, RowSection, Toggle, MiniBtn } from './_shared'

/*
 * PÃ¡ginas pÃºblicas (grupo Funciones) â€” equivalente a "PÃ¡ginas pÃºblicas" de
 * Notion. AKIRA ya expone el portal del cliente; el resto se marca honesto.
 */
function StatCard({ value, label, sub }) {
  return (
    <div style={{ flex: 1, minWidth: '150px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
      <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-2)', marginTop: '8px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{sub}</p>
    </div>
  )
}

function PublicPagesTab() {
  var [prefs, setPref] = usePrefs({ pub_portal_enabled: true, pub_banner: true })

  return (
    <div>
      <RowSection title="Contenido pÃºblico" description="Gestiona lo que compartes fuera de tu espacio de trabajo.">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px 0' }}>
          <StatCard value="1" label="Portal del cliente" sub="Activo" />
          <StatCard value="0" label="Formularios pÃºblicos" sub="Ninguno todavÃ­a" />
          <StatCard value="0" label="Enlaces compartidos" sub="Ninguno todavÃ­a" />
        </div>
      </RowSection>

      <RowSection title="Portal del cliente" description="El espacio donde tus clientes ven facturas, entregas y mensajes.">
        <Row title="Portal del cliente activado" description="Cada cliente accede a su portal privado con las facturas que le asignas.">
          <Toggle checked={prefs.pub_portal_enabled} onClick={function () { setPref('pub_portal_enabled', !prefs.pub_portal_enabled) }} />
        </Row>
        <Row title="Banner de Â«pÃ¡gina publicadaÂ»" description="Muestra un aviso en las pÃ¡ginas que compartes pÃºblicamente." last>
          <Toggle checked={prefs.pub_banner} onClick={function () { setPref('pub_banner', !prefs.pub_banner) }} />
        </Row>
      </RowSection>

      <RowSection title="Dominios" description="Publica tu portal y pÃ¡ginas en tu propio dominio.">
        <Row title="Dominio personalizado" description="Usa tu-empresa.com en vez del subdominio por defecto." last badge="PrÃ³ximamente">
          <MiniBtn label="Configurar" disabled />
        </Row>
      </RowSection>
    </div>
  )
}

export default PublicPagesTab

