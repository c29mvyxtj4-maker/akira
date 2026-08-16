import { useState } from 'react'
import { motion } from 'framer-motion'
import AreaChart      from '@/components/charts/AreaChart'
import BarChart       from '@/components/charts/BarChart'
import DonutChart     from '@/components/charts/DonutChart'
import Card           from '@/components/ui/Card'

const TABS = [
  { id: 'revenue',  label: 'Ingresos' },
  { id: 'clients',  label: 'Clientes' },
  { id: 'projects', label: 'Proyectos' },
]

export default function RevenueChart({ revenueSparkline = [], clientsByStatus = [], projectsByStatus = [] }) {
  const [tab, setTab] = useState('revenue')

  const totalClients  = clientsByStatus.reduce((s, d)  => s + d.value, 0)
  const totalProjects = projectsByStatus.reduce((s, d) => s + d.value, 0)

  return (
    <Card padding="none" className="overflow-hidden" animate={false}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <div>
          <h3 className="text-sm font-semibold text-text-1">Resumen visual</h3>
          <p className="text-xs text-text-4 mt-0.5">Evolución y distribución</p>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-3 rounded-lg p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 ${
                tab === t.id
                  ? 'bg-surface-5 text-text-1 shadow-sm'
                  : 'text-text-3 hover:text-text-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="px-5 pt-4 pb-5">
        {tab === 'revenue' && (
          <motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {revenueSparkline.length > 0 ? (
              <AreaChart
                data={revenueSparkline}
                lines={[{ key: 'value', color: '#e63946', name: 'Ingresos' }]}
                height={180}
                formatter={(v) => `${v.toLocaleString()}€`}
              />
            ) : (
              <div className="h-44 flex items-center justify-center text-text-4 text-sm">
                Sin datos de ingresos
              </div>
            )}
          </motion.div>
        )}

        {tab === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {clientsByStatus.length > 0 ? (
              <div className="flex items-center gap-8">
                <DonutChart
                  data={clientsByStatus}
                  height={180}
                  innerRadius={50}
                  outerRadius={78}
                  centerValue={totalClients}
                  centerLabel="clientes"
                />
                <div className="flex-1 space-y-2">
                  {clientsByStatus.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-text-3">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-1">{d.value}</span>
                        <span className="text-2xs text-text-4">
                          {totalClients > 0 ? Math.round(d.value / totalClients * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-text-4 text-sm">
                Sin clientes todavía
              </div>
            )}
          </motion.div>
        )}

        {tab === 'projects' && (
          <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {projectsByStatus.length > 0 ? (
              <BarChart
                data={projectsByStatus}
                bars={[{ key: 'value', color: '#6366f1', name: 'Proyectos' }]}
                height={180}
              />
            ) : (
              <div className="h-44 flex items-center justify-center text-text-4 text-sm">
                Sin proyectos todavía
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  )
}