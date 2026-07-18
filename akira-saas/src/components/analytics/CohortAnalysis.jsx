import { motion } from "framer-motion"

const cohortData = [
  { cohort: "2026-01", m0: 100, m1: 89, m2: 78, m3: 72, m4: 68, m5: 65, m6: 63 },
  { cohort: "2026-02", m0: 120, m1: 105, m2: 94, m3: 87, m4: 82, m5: 79 },
  { cohort: "2026-03", m0: 145, m1: 128, m2: 116, m3: 108, m4: 103 },
  { cohort: "2026-04", m0: 167, m1: 151, m2: 138, m3: 129 },
  { cohort: "2026-05", m0: 189, m1: 168, m2: 155 },
  { cohort: "2026-06", m0: 201, m1: 179 },
]

export default function CohortAnalysis() {
  const getRetentionColor = (value, maxValue) => {
    const percentage = (value / maxValue) * 100
    if (percentage >= 80) return "#22c55e"
    if (percentage >= 60) return "#f59e0b"
    return "#ef4444"
  }

  const maxValue = cohortData[0].m0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-surface-2 border border-border"
    >
      <h3 className="text-text-1 font-bold mb-4">Cohort Retention Analysis</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-text-3 font-semibold">Cohort</th>
              {[0, 1, 2, 3, 4, 5, 6].map(m => (
                <th key={m} className="text-center py-2 px-2 text-text-4 font-semibold">M{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-surface-3">
                <td className="py-3 px-3 text-text-2 font-semibold">{row.cohort}</td>
                {[0, 1, 2, 3, 4, 5, 6].map(m => {
                  const key = `m${m}`
                  const value = row[key]
                  return (
                    <td key={m} className="text-center py-3 px-2">
                      {value ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + m * 0.02 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                          style={{ background: getRetentionColor(value, maxValue) }}
                        >
                          {Math.round((value / row.m0) * 100)}%
                        </motion.div>
                      ) : (
                        <span className="text-text-4">--</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md" style={{ background: "#22c55e" }} />
          <span className="text-text-3">High Retention (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md" style={{ background: "#f59e0b" }} />
          <span className="text-text-3">Medium (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md" style={{ background: "#ef4444" }} />
          <span className="text-text-3">Low Retention (&lt;60%)</span>
        </div>
      </div>
    </motion.div>
  )
}
