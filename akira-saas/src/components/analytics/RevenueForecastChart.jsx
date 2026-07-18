import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { month: "Jan", actual: 45000, forecast: 45000, confidence: 95 },
  { month: "Feb", actual: 48000, forecast: 48000, confidence: 92 },
  { month: "Mar", actual: 51000, forecast: 51000, confidence: 88 },
  { month: "Apr", actual: null, forecast: 54200, confidence: 82 },
  { month: "May", actual: null, forecast: 57500, confidence: 78 },
  { month: "Jun", actual: null, forecast: 61200, confidence: 72 },
]

export default function RevenueForecastChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-surface-2 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-text-1 font-bold">Revenue Forecast (ARIMA)</h3>
          <p className="text-text-4 text-xs">6-month projection with confidence intervals</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            formatter={v => (v ? `$${(v / 1000).toFixed(0)}k` : "--")}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4, fill: "#22c55e" }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: "#3b82f6" }}
            name="Forecast"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
