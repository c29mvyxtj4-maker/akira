import { motion } from "framer-motion"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const mockAnomalies = [
  { id: 1, name: "Spike in Support Tickets", severity: "high", deviation: "+145%", lastSeen: "2 hours ago", type: "alert" },
  { id: 2, name: "Revenue Drop by Region", severity: "high", deviation: "-32%", lastSeen: "1 hour ago", type: "warning" },
  { id: 3, name: "Unusual API Usage", severity: "medium", deviation: "+89%", lastSeen: "30 min ago", type: "notice" },
  { id: 4, name: "Churn Rate Increase", severity: "medium", deviation: "+18%", lastSeen: "15 min ago", type: "warning" },
]

export default function AnomalyAlerts() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-red-300 font-bold">Active Anomalies: {mockAnomalies.length}</p>
        <p className="text-red-200/80 text-sm">Unusual patterns detected in your data</p>
      </div>

      {mockAnomalies.map((anomaly, idx) => {
        const getSeverityColor = () => {
          if (anomaly.severity === "high") return { bg: "rgba(239, 68, 68, 0.1)", badge: "rgba(239, 68, 68, 0.2)", text: "#ef4444" }
          return { bg: "rgba(245, 158, 11, 0.1)", badge: "rgba(245, 158, 11, 0.2)", text: "#f59e0b" }
        }
        const colors = getSeverityColor()

        return (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-lg border border-border"
            style={{ background: colors.bg }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.text }} />
              <div className="flex-1">
                <p className="text-text-1 font-semibold">{anomaly.name}</p>
                <p className="text-text-4 text-xs">Detected: {anomaly.lastSeen}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold" style={{ color: colors.text }}>{anomaly.deviation}</p>
                <p className="text-text-4 text-xs">{anomaly.severity}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
