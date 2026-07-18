import { motion } from "framer-motion"

export default function CLVCalculator() {
  const clvMetrics = [
    { segment: "Premium", clv: 125000, customers: 24, arpu: 5200 },
    { segment: "Standard", clv: 65000, customers: 156, arpu: 1200 },
    { segment: "Starter", clv: 22000, customers: 389, arpu: 400 },
    { segment: "Freemium", clv: 8000, customers: 1200, arpu: 89 },
  ]

  const totalClv = clvMetrics.reduce((sum, m) => sum + m.clv, 0)
  const totalCustomers = clvMetrics.reduce((sum, m) => sum + m.customers, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Total CLV</p>
          <p className="text-2xl font-black text-text-1">${(totalClv / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Avg Customer Value</p>
          <p className="text-2xl font-black text-text-1">${(totalClv / totalCustomers / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {clvMetrics.map((metric, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="p-4 rounded-lg bg-surface-2 border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-1 font-semibold">{metric.segment}</p>
            <p className="text-green-500 font-bold">${(metric.clv / 1000).toFixed(0)}k</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-text-4">Customers: {metric.customers}</p>
              <p className="text-text-4">ARPU: ${metric.arpu}</p>
            </div>
            <div className="flex items-center justify-end">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{
                  background: `linear-gradient(135deg, ${["#e63946", "#f59e0b", "#3b82f6", "#a855f7"][idx]}, ${["#cc2936", "#dc2602", "#1e40af", "#7c3aed"][idx]})`,
                }}
              >
                {((metric.clv / totalClv) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
