import { motion } from 'framer-motion'
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/shared/components/ui/Button'

/**
 * Display operative with status and quick actions
 */
export default function OperativeCard({
  operative,
  status = 'ready',
  onExecute,
  onConfigure,
  loading = false,
}) {
  const statusConfig = {
    ready: { icon: CheckCircle, color: '#22c55e', label: 'Ready' },
    running: { icon: Clock, color: '#f59e0b', label: 'Running' },
    error: { icon: AlertCircle, color: '#ef4444', label: 'Error' },
  }

  const config = statusConfig[status] || statusConfig.ready
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
            marginBottom: '4px',
          }}>
            {operative.name}
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-4)',
            margin: 0,
          }}>
            {operative.description}
          </p>
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '4px',
          background: `${config.color}15`,
        }}>
          <StatusIcon style={{ width: '14px', height: '14px', color: config.color }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: config.color }}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255,255,255,0.01)',
        borderRadius: 'var(--radius-md)',
        fontSize: '12px',
      }}>
        <div>
          <p style={{ color: 'var(--text-4)', margin: '0 0 4px 0' }}>Trigger</p>
          <p style={{ color: 'var(--text-2)', margin: 0, fontWeight: 600 }}>
            {operative.trigger || 'Manual'}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--text-4)', margin: '0 0 4px 0' }}>Est. Time</p>
          <p style={{ color: 'var(--text-2)', margin: 0, fontWeight: 600 }}>
            {operative.estimatedDuration || '5 min'}
          </p>
        </div>
      </div>

      {/* Steps Preview */}
      {operative.steps && operative.steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: 0 }}>
            Steps: {operative.steps.length}
          </p>
          {operative.steps.slice(0, 2).map((step, i) => (
            <div key={i} style={{
              fontSize: '11px',
              color: 'var(--text-3)',
              display: 'flex',
              gap: '6px',
            }}>
              <span>–†’</span>
              <span>{step}</span>
            </div>
          ))}
          {operative.steps.length > 2 && (
            <p style={{ fontSize: '10px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
              +{operative.steps.length - 2} more steps
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant="primary"
          size="sm"
          icon={<Play className="w-3.5 h-3.5" />}
          onClick={onExecute}
          disabled={loading || status === 'running'}
          style={{ flex: 1 }}
        >
          {loading ? 'Running...' : 'Execute'}
        </Button>
        {onConfigure && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfigure}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Configure
          </Button>
        )}
      </div>

      {/* Success Rate */}
      {operative.successRate !== undefined && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-4)',
          padding: '8px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          Success Rate: <span style={{ color: '#22c55e', fontWeight: 600 }}>
            {operative.successRate}%
          </span>
        </div>
      )}
    </motion.div>
  )
}

