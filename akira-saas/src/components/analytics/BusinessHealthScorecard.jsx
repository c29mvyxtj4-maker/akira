import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Users, AlertCircle } from "lucide-react"

export default function BusinessHealthScorecard() {
  const score = 78
  const trend = "+5"
  const lastUpdated = "2 hours ago"

  const metrics = [
    { name: "Revenue Growth", value: 24, target: 20, status: "good" },
    { name: "Churn Rate", value: 2.1, target: 3, status: "good" },
    { name: "Customer Acquisition", value: 18, target: 15, status: "good" },
    { name: "Product Engagement", value: 71, target: 70, status: "good" },
  ]

  const getScoreColor = () => {
    if (score >= 80) return { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", ring: "rgba(34, 197, 94, 0.3)" }
    if (score >= 60) return { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", ring: "rgba(245, 158, 11, 0.3)" }
    return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", ring: "rgba(239, 68, 68, 0.3)" }
  }

  const colors = getScoreColor()

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <motion.div
        whileHover={{ y: -2 }}
        className="p-8 rounded-2xl bg-surface-2 border-2 transition-all"
        style={{ borderColor: colors.ring, background: colors.bg }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-text-3 text-sm font-semibold uppercase tracking-wider">Business Health Score</p>
            <p className="text-text-4 text-xs">Last updated: {lastUpdated}</p>
          </div>
          <TrendingUp className="w-6 h-6" style={{ color: colors.text }} />
        </div>

        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={colors.text}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: colors.text }}>{score}</div>
                <div className="text-text-4 text-xs">/100</div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="text-text-3 font-semibold">{metric.name}</p>
                  <p className="text-text-2 font-bold">{metric.value}%</p>
                </div>
                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: metric.status === "good" ? "#22c55e" : "#ef4444",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-text-2 font-semibold">Performance Status</p>
            <p className="text-text-4 text-xs">All metrics on track</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: colors.text }}>{trend}%</p>
            <p className="text-text-4 text-xs">Week over week</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">Optimization Opportunity</p>
            <p className="text-amber-200/80 text-xs mt-1">Product engagement is below optimal. Consider launching feature awareness campaign.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
