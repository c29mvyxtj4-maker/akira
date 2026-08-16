import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import type { YouTubeProject } from '@/shared/types/youtube'
import { calculateProjectProgress, daysUntil, getUpcomingPhases, isPhaseAtRisk } from '@/shared/utils/dateCalculations'

interface YouTubeMetricsProps {
  project: YouTubeProject
}

export function YouTubeMetrics({ project }: YouTubeMetricsProps) {
  const progress = calculateProjectProgress(project.phases)
  const daysLeftUntilPublish = daysUntil(project.publishingDate)
  const upcomingPhases = getUpcomingPhases(
    project.phases.map((p) => ({
      name: p.phaseName,
      startDate: p.startDate,
      status: p.status,
    })),
    3
  )

  const phasesAtRisk = project.phases.filter((p) => isPhaseAtRisk(p, 3) && p.status !== 'completed')
  const completedPhases = project.phases.filter((p) => p.status === 'completed').length
  const totalEstimatedHours = project.phases.reduce((sum, p) => sum + p.estimatedHours, 0)
  const totalActualHours = project.phases.reduce((sum, p) => sum + p.actualHours, 0)

  const metrics = [
    {
      label: 'Overall Progress',
      value: `${progress}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      description: `${completedPhases}/${project.phases.length} phases done`,
    },
    {
      label: 'Time Until Publish',
      value: daysLeftUntilPublish,
      icon: Calendar,
      color: daysLeftUntilPublish <= 7 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
      description: daysLeftUntilPublish <= 0 ? 'Publishing soon!' : 'days remaining',
    },
    {
      label: 'Hours Invested',
      value: totalActualHours,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      description: `of ${totalEstimatedHours} estimated`,
    },
    {
      label: 'Phases at Risk',
      value: phasesAtRisk.length,
      icon: AlertCircle,
      color: phasesAtRisk.length > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
      description: phasesAtRisk.length > 0 ? 'Need attention' : 'On track',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-gradient-to-br from-surface-1 to-surface-0 rounded-lg border border-surface-2 hover:border-brand-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">{metric.label}</p>
                  <p className="text-3xl font-bold mt-1 text-text-1">{metric.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-20`}>
                  <Icon className="w-5 h-5 text-text-1" />
                </div>
              </div>
              <p className="text-xs text-text-3">{metric.description}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-gradient-to-r from-surface-1 to-surface-0 rounded-lg border border-surface-2"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-text-1">Production Progress</p>
          <span className="text-sm font-bold text-brand-500">{progress}%</span>
        </div>
        <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
          />
        </div>
      </motion.div>

      {/* Next Milestones */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <h4 className="font-semibold text-text-1">Upcoming Phases</h4>
        {upcomingPhases.length > 0 ? (
          <div className="space-y-2">
            {upcomingPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-3 bg-surface-1 border border-surface-2 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-text-1 capitalize">{phase.name}</p>
                    <p className="text-xs text-text-3">Starts {new Date(phase.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-brand-dim text-brand-500 rounded">
                  In {Math.ceil((new Date(phase.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-3">No upcoming phases - all done!</p>
        )}
      </motion.div>

      {/* At Risk Phases */}
      {phasesAtRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="font-semibold text-red-900">Phases at Risk</p>
          </div>
          <div className="space-y-2">
            {phasesAtRisk.map((phase) => (
              <div key={phase.id} className="text-sm text-red-800 capitalize">
                <span className="font-semibold">{phase.phaseName}</span> - Ends{' '}
                {new Date(phase.endDate).toLocaleDateString()}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Time Breakdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-surface-1 rounded-lg border border-surface-2">
        <h4 className="font-semibold text-text-1 mb-4">Hours Breakdown</h4>
        <div className="space-y-3">
          {project.phases
            .filter((p) => p.estimatedHours > 0)
            .map((phase) => {
              const percentage = (phase.estimatedHours / totalEstimatedHours) * 100
              return (
                <div key={phase.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-text-2 capitalize font-medium">{phase.phaseName}</span>
                    <span className="text-xs font-semibold text-text-3">
                      {phase.actualHours || 0} / {phase.estimatedHours}h
                    </span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
                      style={{ width: `${Math.min(100, (phase.actualHours / phase.estimatedHours) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </motion.div>
    </div>
  )
}

