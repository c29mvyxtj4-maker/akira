import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react'

function Mini({ label, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="surface-card p-3 flex items-center gap-3"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color.bg}`}>
        <Icon className={`w-4 h-4 ${color.text}`} />
      </div>
      <div>
        <p className="text-lg font-black text-text-1 leading-none">{value}</p>
        <p className="text-2xs text-text-4 mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

export default function ClientKpis({ clients = [] }) {
  const active  = clients.filter(c => c.status === 'active').length
  const leads   = clients.filter(c => c.status === 'lead').length
  const atRisk  = clients.filter(c => c.status === 'at_risk').length
  const mrv     = clients.reduce((s, c) => s + (Number(c.monthly_value) || 0), 0)

  return (
    <div className="grid grid-cols-2 gap-2 p-3 border-b border-border">
      <Mini label="Activos"  value={active}  icon={UserCheck}    color={{ bg: 'bg-status-success/10', text: 'text-status-success' }} delay={0} />
      <Mini label="Leads"    value={leads}   icon={Users}        color={{ bg: 'bg-brand-500/10',      text: 'text-brand-400' }}     delay={0.06} />
      <Mini label="En riesgo"value={atRisk}  icon={AlertTriangle} color={{ bg: 'bg-status-danger/10',text: 'text-status-danger' }}  delay={0.12} />
      <Mini label="MRV total" value={`${mrv.toLocaleString()}€`} icon={TrendingUp} color={{ bg: 'bg-status-warning/10', text: 'text-status-warning' }} delay={0.18} />
    </div>
  )
}