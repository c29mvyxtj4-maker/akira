import { Section } from './_shared'

function IntegrationCard({ name, description, status, icon }) {
  var CFG = {
    connected:    { label: 'Conectado',     color: '#22c55e' },
    not_connected: { label: 'No configurado', color: '#f59e0b' },
    coming_soon:  { label: 'Proximamente',  color: '#64748b' },
  }
  var s = CFG[status] || CFG.coming_soon

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{name}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>{description}</p>
      </div>
      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: s.color + '20', color: s.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {s.label}
      </span>
    </div>
  )
}

function IntegrationsTab() {
  var geminiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY

  return (
    <div>
      <Section title="Inteligencia artificial" description="El motor que hace funcionar a Akira Brain">
        <IntegrationCard
          name="Google Gemini"
          description={geminiConfigured ? 'Clave configurada. Si Akira Brain no responde, puede ser un tema de cuota de tu cuenta de Google, no de la conexion en si.' : 'Falta la clave VITE_GEMINI_API_KEY en tu archivo .env'}
          status={geminiConfigured ? 'connected' : 'not_connected'}
          icon="✨"
        />
      </Section>

      <Section title="Correo" description="Como se envian los recordatorios y las plantillas de email">
        <IntegrationCard
          name="Cliente de correo del dispositivo"
          description="Los recordatorios y plantillas abren tu app de correo (Gmail, Mail...) ya redactados, para que revises y envies tu mismo. No se manda nada de forma automatica."
          status="connected"
          icon="✉️"
        />
      </Section>

      <Section title="Cobros" description="Para cobrar directamente desde una factura">
        <IntegrationCard
          name="Stripe"
          description="Añadir un boton de pago directo en tus facturas. Todavia no esta conectado."
          status="coming_soon"
          icon="💳"
        />
      </Section>

      <Section title="Base de datos" description="Donde vive toda la informacion de tu negocio">
        <IntegrationCard
          name="Supabase"
          description="Base de datos, autenticacion, archivos y tiempo real. Es el corazon de AKIRA."
          status="connected"
          icon="🗄️"
        />
      </Section>
    </div>
  )
}


export default IntegrationsTab
