import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * PageHeader — Header contextual mejorado
 *
 * Props:
 *   title: string
 *   description: string (opcional)
 *   icon: ReactNode (opcional)
 *   breadcrumb: Array<{ label, href? }> (opcional)
 *   actions: Array<ReactNode> | ReactNode (opcional)
 */
export default function PageHeader({
  title,
  description,
  icon,
  breadcrumb,
  actions = [],
}) {
  const navigate = useNavigate()
  const actionArray = Array.isArray(actions) ? actions : actions ? [actions] : []

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: 'var(--space-4) var(--space-4)',
        background: 'var(--bg-1)',
      }}
    >
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-3)',
        }}>
          {breadcrumb.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {item.href ? (
                <button
                  onClick={() => navigate(item.href)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{item.label}</span>
              )}
              {idx < breadcrumb.length - 1 && <span>/</span>}
            </div>
          ))}
        </div>
      )}

      {/* Title + Description */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        marginBottom: actionArray.length > 0 ? 'var(--space-3)' : 0,
      }}>
        {icon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-dim)',
            color: 'var(--brand)',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
            marginBottom: description ? 'var(--space-1)' : 0,
          }}>
            {title}
          </h1>
          {description && (
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-3)',
              margin: 0,
            }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions row */}
      {actionArray.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}>
          {actionArray.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {action}
            </motion.div>
          ))}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver atrás"
            title="Volver atrás"
            style={{
              width: '36px',
              height: '36px',
              flexShrink: 0,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-3)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--dur-fast)',
              marginLeft: 'auto',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-3)'}
          >
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      )}
    </motion.div>
  )
}