import { CreditCard, Sparkles, Calendar, Mail, MessageSquare, Github, Users, HardDrive, Briefcase, LayoutGrid } from 'lucide-react'
import { Row, RowSection, MiniBtn } from './_shared'

/*
 * Conexiones (grupo Funciones) — equivalente a "Conexiones" de Notion: catálogo
 * de integraciones. Reflejamos honestamente el estado real: Stripe y Gemini ya
 * están integrados en AKIRA; el resto se marca como "Próximamente".
 */
var CONNECTED = [
  { icon: CreditCard, name: 'Stripe',        desc: 'Cobra tus facturas y presupuestos con el botón «Cobrar».' },
  { icon: Sparkles,   name: 'Google Gemini', desc: 'Impulsa el asistente «Preguntar a AKIRA» y las acciones de IA.' },
]

var SOON = [
  { icon: Calendar,     name: 'Google Calendar', desc: 'Sincroniza tus eventos con el calendario de AKIRA.' },
  { icon: Mail,         name: 'Gmail',           desc: 'Envía facturas y presupuestos desde tu propio correo.' },
  { icon: MessageSquare,name: 'Slack',           desc: 'Recibe avisos de facturas, tareas y menciones en Slack.' },
  { icon: Github,       name: 'GitHub',          desc: 'Vincula repositorios a tus proyectos.' },
  { icon: Users,        name: 'Microsoft Teams', desc: 'Notificaciones y anuncios en tus canales de Teams.' },
  { icon: HardDrive,    name: 'Google Drive',    desc: 'Adjunta documentos de Drive a clientes y proyectos.' },
  { icon: Briefcase,    name: 'Salesforce',      desc: 'Importa cuentas y oportunidades como clientes.' },
  { icon: LayoutGrid,   name: 'Notion',          desc: 'Importa páginas y bases de datos a tu base de conocimiento.' },
]

function Logo({ icon: Icon }) {
  return (
    <span style={{ width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon style={{ width: '17px', height: '17px', color: 'var(--text-2)' }} />
    </span>
  )
}

function ConnectionsTab() {
  return (
    <div>
      <RowSection title="Conexiones activas" description="Aplicaciones que ya funcionan dentro de AKIRA.">
        {CONNECTED.map(function (c, i) {
          return (
            <Row key={c.name}
              title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}><Logo icon={c.icon} /> {c.name}</span>}
              description={c.desc} last={i === CONNECTED.length - 1}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '999px', padding: '3px 10px' }}>Conectado</span>
            </Row>
          )
        })}
      </RowSection>

      <RowSection title="Descubre conexiones" description="Explora las integraciones disponibles para tu espacio de trabajo.">
        {SOON.map(function (c, i) {
          return (
            <Row key={c.name}
              title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}><Logo icon={c.icon} /> {c.name}</span>}
              description={c.desc} last={i === SOON.length - 1} badge="Próximamente">
              <MiniBtn label="Conectar" disabled />
            </Row>
          )
        })}
      </RowSection>
    </div>
  )
}

export default ConnectionsTab
