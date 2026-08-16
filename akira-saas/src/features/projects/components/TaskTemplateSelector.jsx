import { Zap, Plus } from 'lucide-react'

export default function TaskTemplateSelector({ onApplyTemplate, disabled = false }) {
  var templates = [
    { id: 'design', name: 'Flujo de Diseño', color: '#8b5cf6', taskCount: 6 },
    { id: 'development', name: 'Flujo de Desarrollo', color: '#3b82f6', taskCount: 8 },
    { id: 'marketing', name: 'Flujo de Marketing', color: '#ec4899', taskCount: 9 },
    { id: 'ecommerce', name: 'Flujo de E-commerce', color: '#10b981', taskCount: 8 },
    { id: 'content', name: 'Flujo de Contenido', color: '#f59e0b', taskCount: 8 },
    { id: 'saas', name: 'Flujo SaaS (Onboarding)', color: '#06b6d4', taskCount: 8 },
    { id: 'audiovisual', name: 'Flujo Audiovisual', color: '#ef4444', taskCount: 12 },
    { id: 'graphicDesign', name: 'Flujo Diseño Gráfico', color: '#8b5cf6', taskCount: 9 },
    { id: 'communityManagement', name: 'Flujo Community Management', color: '#06b6d4', taskCount: 9 },
    { id: 'clientAcquisition', name: 'Flujo Conseguir Clientes', color: '#10b981', taskCount: 10 },
    { id: 'consulting', name: 'Flujo Consultoría/Auditoría', color: '#f59e0b', taskCount: 10 },
    { id: 'eventProduction', name: 'Flujo Producción de Eventos', color: '#ec4899', taskCount: 10 },
    { id: 'branding', name: 'Flujo Branding Completo', color: '#8b5cf6', taskCount: 10 },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Zap size={14} style={{ color: '#e63946' }} />
        <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Templates de tareas</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {templates.map(function(template) {
          return (
            <button
              key={template.id}
              onClick={function() { onApplyTemplate(template.id) }}
              disabled={disabled}
              type="button"
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: template.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{template.name}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                <Plus size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {template.taskCount} tareas
              </p>
            </button>
          )
        })}
      </div>

      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
        Selecciona un template para cargar tareas preestablecidas
      </p>
    </div>
  )
}
