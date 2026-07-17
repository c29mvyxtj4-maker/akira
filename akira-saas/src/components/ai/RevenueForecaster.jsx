import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, BarChart3, AlertCircle, Target,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const mockForecastData = [
  { month: 'Jul', actual: 45000, forecast: 45000, confidence: 95 },
  { month: 'Aug', actual: 48000, forecast: 48000, confidence: 92 },
  { month: 'Sep', actual: 51000, forecast: 51000, confidence: 88 },
  { month: 'Oct', actual: null, forecast: 54200, confidence: 82 },
  { month: 'Nov', actual: null, forecast: 57500, confidence: 78 },
  { month: 'Dec', actual: null, forecast: 61200, confidence: 72 },
  { month: 'Jan', actual: null, forecast: 58900, confidence: 68 },
  { month: 'Feb', actual: null, forecast: 62100, confidence: 65 },
  { month: 'Mar', actual: null, forecast: 65800, confidence: 62 },
  { month: 'Apr', actual: null, forecast: 68500, confidence: 60 },
  { month: 'May', actual: null, forecast: 71200, confidence: 58 },
  { month: 'Jun', actual: null, forecast: 74500, confidence: 55 },
]

const mockScenarios = [
  { name: 'Conservative', value: 690000, growth: '18%', color: '#a855f7' },
  { name: 'Base Case', value: 762000, growth: '24%', color: '#e63946' },
  { name: 'Optimistic', value: 845000, growth: '31%', color: '#22c55e' },
]

const mockDrivers = [
  { factor: 'New Clients', contribution: 28, trend: 'up' },
  { factor: 'Upsells', contribution: 18, trend: 'up' },
  { factor: 'Churn', contribution: -12, trend: 'down' },
  { factor: 'Price Increases', contribution: 8, trend: 'up' },
  { factor: 'Seasonal', contribution: -5, trend: 'down' },
]

export default function RevenueForecaster() {
  const [timeframe, setTimeframe] = useState('12m')
  const [scenario, setScenario] = useState('base')

  const totalForecast = mockForecastData.reduce((sum, d) => sum + d.forecast, 0)
  const currentYTD = mockForecastData
    .slice(0, 3)
    .reduce((sum, d) => sum + d.actual, 0)
  const forecastedRemaining = mockForecastData
    .slice(3)
    .reduce((sum, d) => sum + d.forecast, 0)

  const selectedScenario = mockScenarios.find(s => s.name.toLowerCase().includes(scenario))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">YTD Actual</p>
          <p className="text-3xl font-black text-text-1 mb-1">${(currentYTD / 1000).toFixed(0)}k</p>
          <p className="text-text-4 text-xs">Jan - Sep</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">12-Month Forecast</p>
          <p className="text-3xl font-black text-text-1 mb-1">${(totalForecast / 1000).toFixed(0)}k</p>
          <p className="text-text-4 text-xs">Base case scenario</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
        >
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Projected Growth</p>
          <p className="text-3xl font-black text-green-500 mb-1">+24%</p>
          <p className="text-text-4 text-xs">YoY vs previous year</p>
        </motion.div>
      </div>

      {/* Forecast Chart */}
      <motion.div
        whileHover={{ borderColor: 'rgba(230, 57, 70, 0.2)' }}
        className="p-6 rounded-xl bg-surface-2 border border-border transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-1 font-bold">12-Month Revenue Forecast</h3>
          <div className="flex gap-2">
            {['3m', '6m', '12m'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  timeframe === t
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-3 text-text-3 hover:bg-surface-4'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockForecastData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e63946" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={v => (v ? `$${(v / 1000).toFixed(0)}k` : '--')}
              cursor={{ stroke: 'rgba(230,57,70,0.2)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#e63946"
              strokeWidth={2}
              fill="url(#colorActual)"
              name="Actual"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorForecast)"
              name="Forecast"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Scenarios */}
      <motion.div className="space-y-3">
        <h3 className="text-text-1 font-bold">Forecast Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockScenarios.map(s => (
            <motion.div
              key={s.name}
              onClick={() => setScenario(s.name.toLowerCase().split(' ')[0])}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                scenario === s.name.toLowerCase().split(' ')[0]
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-border bg-surface-2 hover:border-brand-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: s.color }}
                />
                <p className="text-text-2 font-semibold text-sm">{s.name}</p>
              </div>
              <p className="text-2xl font-black text-text-1 mb-1">${(s.value / 1000).toFixed(0)}k</p>
              <p className="text-green-400 text-xs font-semibold">{s.growth} growth</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Drivers */}
      <motion.div className="space-y-3">
        <h3 className="text-text-1 font-bold">Revenue Drivers</h3>
        <div className="space-y-2">
          {mockDrivers.map((driver, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-surface-2 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-text-2 font-semibold text-sm">{driver.factor}</p>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: driver.contribution > 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  {driver.contribution > 0 ? '+' : ''}{driver.contribution}%
                </span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(driver.contribution)}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: driver.contribution > 0 ? '#22c55e' : '#ef4444',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-semibold text-sm mb-1">Forecast Confidence</p>
            <p className="text-blue-200/80 text-xs leading-relaxed">
              High confidence in next 3 months (82%+). Confidence decreases beyond 6-month horizon due to market volatility.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
