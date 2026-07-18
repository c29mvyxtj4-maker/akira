import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Zap, Layout, Lightbulb, Download, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import BusinessHealthScorecard from '@/components/analytics/BusinessHealthScorecard'
import RevenueForecastChart from '@/components/analytics/RevenueForecastChart'
import ChurnPredictionModel from '@/components/analytics/ChurnPredictionModel'
import CLVCalculator from '@/components/analytics/CLVCalculator'
import AnomalyAlerts from '@/components/analytics/AnomalyAlerts'
import CohortAnalysis from '@/components/analytics/CohortAnalysis'
import DashboardWidgetLibrary from '@/components/analytics/DashboardWidgetLibrary'
import InsightsFeed from '@/components/analytics/InsightsFeed'
import BIExportConfig from '@/components/analytics/BIExportConfig'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'insights', label: 'Insights Feed', icon: Lightbulb },
  { id: 'health', label: 'Business Health', icon: TrendingUp },
  { id: 'forecast', label: 'Revenue Forecast', icon: Zap },
  { id: 'churn', label: 'Churn Prediction', icon: Users },
  { id: 'clv', label: 'CLV Calculator', icon: TrendingUp },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'cohort', label: 'Cohort Analysis', icon: Users },
  { id: 'widgets', label: 'Widget Library', icon: Layout },
  { id: 'export', label: 'BI Export', icon: Download },
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />
      case 'insights':
        return <InsightsFeed />
      case 'health':
        return <BusinessHealthScorecard />
      case 'forecast':
        return <RevenueForecastChart />
      case 'churn':
        return <ChurnPredictionModel />
      case 'clv':
        return <CLVCalculator />
      case 'anomalies':
        return <AnomalyAlerts />
      case 'cohort':
        return <CohortAnalysis />
      case 'widgets':
        return <DashboardWidgetLibrary />
      case 'export':
        return <BIExportConfig />
      default:
        return <AnalyticsDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Analytics Platform"
        subtitle="Advanced data analytics and business intelligence"
        icon={BarChart3}
      />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-surface-2 text-text-2 border border-border hover:border-brand-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}
