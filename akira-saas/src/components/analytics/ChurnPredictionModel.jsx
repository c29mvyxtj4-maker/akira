import { motion } from "framer-motion"
import { AlertTriangle, Users } from "lucide-react"

export default function ChurnPredictionModel() {
  const predictions = [
    { id: 1, name: "Acme Corp", risk: 92, likelihood: "Very High", reason: "No activity 45 days" },
    { id: 2, name: "TechStart Inc", risk: 78, likelihood: "High", reason: "Reduced usage" },
    { id: 3, name: "Global Solutions", risk: 65, likelihood: "Medium", reason: "Feature interest down" },
    { id: 4, name: "DataFlow Co", risk: 42, likelihood: "Low-Medium", reason: "Seasonal pattern" },
  ]

  const avgRisk = Math.round(predictions.reduce((sum, p) => sum + p.risk, 0) / predictions.length)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="p-4 rounded-xl bg-surface-2 border border-border">
        <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Average Churn Risk</p>
        <p className="text-3xl font-black text-text-1 mb-1">{avgRisk}%</p>
        <p className="text-text-4 text-xs">Portfolio risk score</p>
      </div>

      {predictions.map((pred, idx) => {
        const getRiskColor = () => {
          if (pred.risk >= 80) return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" }
          if (pred.risk >= 60) return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" }
          return { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" }
        }
        const colors = getRiskColor()

        return (
          <motion.div
            key={pred.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-lg bg-surface-2 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-text-1 font-semibold">{pred.name}</p>
                <p className="text-text-4 text-xs">{pred.reason}</p>
              </div>
              <div
                className="px-3 py-1 rounded-lg text-sm font-bold"
                style={{ background: colors.bg, color: colors.text }}
              >
                {pred.risk}%
              </div>
            </div>
            <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pred.risk}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{ background: colors.text }}
              />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
