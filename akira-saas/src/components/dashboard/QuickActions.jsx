import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, FolderPlus, TrendingUp, Brain, FileText } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants'

const ACTIONS = [
  { label: 'Nuevo cliente',  icon: UserPlus,   to: ROUTES.CLIENTS,    color: 'text-brand-400',      bg: 'bg-brand-500/10      hover:bg-brand-500/20',      border: 'border-brand-500/20' },
  { label: 'Nuevo proyecto', icon: FolderPlus,  to: ROUTES.PROJECTS,   color: 'text-status-success', bg: 'bg-status-success/10 hover:bg-status-success/20', border: 'border-status-success/20' },
  { label: 'Ver finanzas',   icon: TrendingUp,  to: ROUTES.FINANCE,    color: 'text-status-warning', bg: 'bg-status-warning/10 hover:bg-status-warning/20', border: 'border-status-warning/20' },
  { label: 'Documentos',     icon: FileText,    to: '/documents',      color: 'text-blue-400',      bg: 'bg-blue-500/10       hover:bg-blue-500/20',       border: 'border-blue-500/20' },
  { label: 'Akira Brain',    icon: Brain,       to: ROUTES.BRAIN,      color: 'text-status-purple',  bg: 'bg-status-purple/10  hover:bg-status-purple/20',  border: 'border-status-purple/20' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-semibold text-text-1 mb-3">Acceso rápido</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.06 }}
              onClick={() => navigate(a.to)}
              className={`flex flex-col items-start gap-2 p-3 rounded-lg border transition-all duration-150 text-left ${a.bg} ${a.border}`}
            >
              <Icon className={`w-4 h-4 ${a.color}`} />
              <span className={`text-xs font-medium ${a.color}`}>{a.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
