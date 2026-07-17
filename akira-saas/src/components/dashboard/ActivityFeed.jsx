import { motion } from 'framer-motion'
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, FolderKanban } from 'lucide-react'
import { useApp } from '@/context/AppContext'

function formatRelative(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0)  return `hace ${days}d`
  if (hrs > 0)   return `hace ${hrs}h`
  if (min > 0)   return `hace ${min}m`
  return 'ahora'
}

export default function ActivityFeed() {
  const { data, lastSync } = useApp()
  const { clients, projects } = data

  // Construir feed de actividad reciente a partir de created_at y updated_at
  const events = [
    ...clients.slice(0, 5).map(c => ({
      id:    c.id,
      type:  'client',
      label: `Cliente ${c.status === 'lead' ? 'lead añadido' : 'actualizado'}`,
      name:  c.name,
      date:  c.updated_at || c.created_at,
      icon:  Users,
      color: 'text-brand-400',
      bg:    'bg-brand-500/10',
    })),
    ...projects.filter(p => p.status === 'completed').slice(0, 3).map(p => ({
      id:    p.id,
      type:  'project_done',
      label: 'Proyecto completado',
      name:  p.name,
      date:  p.updated_at,
      icon:  CheckCircle2,
      color: 'text-status-success',
      bg:    'bg-status-success/10',
    })),
    ...projects.filter(p => ['pending', 'active'].includes(p.status) && p.due_date).slice(0, 3).map(p => ({
      id:    p.id + '_active',
      type:  'project_active',
      label: 'Proyecto en curso',
      name:  p.name,
      date:  p.created_at,
      icon:  FolderKanban,
      color: 'text-status-info',
      bg:    'bg-status-info/10',
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  if (events.length === 0) {
    return (
      <div className="surface-card p-4">
        <h3 className="text-sm font-semibold text-text-1 mb-3">Actividad reciente</h3>
        <div className="flex flex-col items-center justify-center py-8 text-text-4 text-sm gap-2">
          <Clock className="w-8 h-8 opacity-30" />
          <span>Sin actividad todavía</span>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-1">Actividad reciente</h3>
        {lastSync && (
          <span className="text-2xs text-text-4 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse-soft" />
            Sync {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {events.map((ev, i) => {
          const Icon = ev.icon
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-start gap-3"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ev.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${ev.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-3">{ev.label}</p>
                <p className="text-sm font-medium text-text-1 truncate">{ev.name}</p>
              </div>
              <span className="text-2xs text-text-4 flex-shrink-0 mt-1">
                {formatRelative(ev.date)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}