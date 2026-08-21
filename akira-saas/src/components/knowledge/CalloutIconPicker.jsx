import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb, Info, Zap, Heart, Star, Bookmark, Bell, Flag, Target } from 'lucide-react'

const CALLOUT_ICONS = [
  { name: 'info', label: 'Info', icon: Info, color: '#3b82f6' },
  { name: 'warning', label: 'Advertencia', icon: AlertTriangle, color: '#f59e0b' },
  { name: 'danger', label: 'Peligro', icon: AlertCircle, color: '#ef4444' },
  { name: 'success', label: 'Éxito', icon: CheckCircle, color: '#22c55e' },
  { name: 'tip', label: 'Consejo', icon: Lightbulb, color: '#a855f7' },
  { name: 'important', label: 'Importante', icon: Zap, color: '#ec4899' },
  { name: 'note', label: 'Nota', icon: Bookmark, color: '#06b6d4' },
  { name: 'idea', label: 'Idea', icon: Star, color: '#f97316' },
  { name: 'quote', label: 'Cita', icon: Heart, color: '#e879f9' },
]

export function CalloutIconPicker({ value, onChange, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      background: 'rgba(13, 13, 19, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      minWidth: '320px',
    }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
        Seleccionar icono
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '16px',
      }}>
        {CALLOUT_ICONS.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              onChange(item.name)
              onClose()
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '10px',
              background: value === item.name ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: value === item.name ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: item.color,
              fontSize: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = value === item.name ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: 'none',
          borderRadius: '6px',
          color: '#cbd5e1',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Cerrar
      </button>
    </div>
  )
}
