import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import RevenueForecastChart from './RevenueForecastChart'
import ChurnPredictionModel from './ChurnPredictionModel'
import CohortAnalysis from './CohortAnalysis'
import BusinessHealthScorecard from './BusinessHealthScorecard'

const mockSparklineData = [
  { value: 45000 },
  { value: 48000 },
  { value: 51000 },
  { value: 54200 },
  { value: 57500 },
  { value: 61200 },
]

export default function AnalyticsDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value="$284K"
          subtitle="+12% from last month"
          icon={DollarSign}
          iconColor="#22c55e"
          iconBg="rgba(34, 197, 94, 0.1)"
          sparklineData={mockSparklineData}
          sparklineColor="#22c55e"
          delay={0}
        />
        <KpiCard
          title="Active Customers"
          value="1,248"
          subtitle="123 added this month"
          icon={Users}
          iconColor="#3b82f6"
          iconBg="rgba(59, 130, 246, 0.1)"
          sparklineData={mockSparklineData}
          sparklineColor="#3b82f6"
          delay={0.1}
        />
        <KpiCard
          title="Avg Churn Rate"
          value="2.3%"
          subtitle="↓ 0.4% vs last month"
          icon={TrendingUp}
          iconColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.1)"
          sparklineData={mockSparklineData}
          sparklineColor="#f59e0b"
          delay={0.2}
        />
        <KpiCard
          title="Health Score"
          value="78/100"
          subtitle="↑ 5% week over week"
          icon={AlertCircle}
          iconColor="#e63946"
          iconBg="rgba(230, 57, 70, 0.1)"
          sparklineData={mockSparklineData}
          sparklineColor="#e63946"
          delay={0.3}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RevenueForecastChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChurnPredictionModel />
        </motion.div>
      </div>

      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <BusinessHealthScorecard />
      </motion.div>

      {/* Cohort Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <CohortAnalysis />
      </motion.div>

      {/* Report Insights */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-4 rounded-lg bg-brand-500/10 border border-brand-500/30"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-brand-300 font-semibold text-sm mb-1">Dashboard Insights</p>
            <p className="text-brand-200/80 text-xs">
              Your business is tracking well with strong revenue growth and improving customer health metrics. Continue monitoring churn indicators.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
