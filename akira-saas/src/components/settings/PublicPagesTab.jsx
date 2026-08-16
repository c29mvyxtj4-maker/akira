import { usePrefs } from '@/shared/hooks/usePreferences'
import { Row, RowSection, Toggle, MiniBtn } from './_shared'

/*
 * Páginas pÀºblicas (grupo Funciones) –” equivalente a "Páginas pÀºblicas" de
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
      <RowSection title="Contenido pÀºblico" description="Gestiona lo que compartes fuera de tu espacio de trabajo.">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px 0' }}>
          <StatCard value="1" label="Portal del cliente" sub="Activo" />
          <StatCard value="0" label="Formularios pÀºblicos" sub="Ninguno todavía" />
          <StatCard value="0" label="Enlaces compartidos" sub="Ninguno todavía" />
        </div>
      </RowSection>

      <RowSection title="Portal del cliente" description="El espacio donde tus clientes ven facturas, entregas y mensajes.">
        <Row title="Portal del cliente activado" description="Cada cliente accede a su portal privado con las facturas que le asignas.">
          <Toggle checked={prefs.pub_portal_enabled} onClick={function () { setPref('pub_portal_enabled', !prefs.pub_portal_enabled) }} />
        </Row>
        <Row title="Banner de «página publicada»" description="Muestra un aviso en las páginas que compartes pÀºblicamente." last>
          <Toggle checked={prefs.pub_banner} onClick={function () { setPref('pub_banner', !prefs.pub_banner) }} />
        </Row>
      </RowSection>

      <RowSection title="Dominios" description="Publica tu portal y páginas en tu propio dominio.">
        <Row title="Dominio personalizado" description="Usa tu-empresa.com en vez del subdominio por defecto." last badge="Próximamente">
          <MiniBtn label="Configurar" disabled />
        </Row>
      </RowSection>
    </div>
  )
}

export default PublicPagesTab

