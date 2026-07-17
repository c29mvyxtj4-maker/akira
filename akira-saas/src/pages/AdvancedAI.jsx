import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, TrendingUp, Users, Zap, AlertCircle, BarChart3,
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import ProjectHealthAnalyzer from '@/components/ai/ProjectHealthAnalyzer'
import ChurnRiskDashboard from '@/components/ai/ChurnRiskDashboard'
import RevenueForecaster from '@/components/ai/RevenueForecaster'
import ExpenseOptimizer from '@/components/ai/ExpenseOptimizer'
import AutomationRecommender from '@/components/ai/AutomationRecommender'

const tabs = [
  { id: 'health', label: 'Project Health', icon: BarChart3 },
  { id: 'churn', label: 'Churn Risk', icon: AlertCircle },
  { id: 'forecast', label: 'Revenue Forecast', icon: TrendingUp },
  { id: 'expenses', label: 'Cost Optimization', icon: Zap },
  { id: 'automation', label: 'Automation', icon: Brain },
]

export default function AdvancedAI() {
  const [activeTab, setActiveTab] = useState('health')

  const renderContent = () => {
    switch (activeTab) {
      case 'health':
        return <ProjectHealthAnalyzer />
      case 'churn':
        return <ChurnRiskDashboard />
      case 'forecast':
        return <RevenueForecaster />
      case 'expenses':
        return <ExpenseOptimizer />
      case 'automation':
        return <AutomationRecommender />
      default:
        return <ProjectHealthAnalyzer />
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Advanced AI & Automation"
        subtitle="Intelligent insights and recommendations powered by AI"
        icon={Brain}
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
