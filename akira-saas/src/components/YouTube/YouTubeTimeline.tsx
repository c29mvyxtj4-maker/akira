import { motion } from 'framer-motion'
import { Check, ChevronRight, AlertCircle } from 'lucide-react'
import type { YouTubePhase } from '@/shared/types/youtube'
import { formatPhaseDate, isPhaseAtRisk, daysUntil } from '@/shared/utils/dateCalculations'

interface YouTubeTimelineProps {
  phases: YouTubePhase[]
  onPhaseClick?: (phase: YouTubePhase) => void
  onCompletePhase?: (phaseId: string) => void
  editable?: boolean
}

const PHASE_COLORS: Record<string, string> = {
  research: 'from-blue-500 to-blue-600',
  planning: 'from-purple-500 to-purple-600',
  scripting: 'from-pink-500 to-pink-600',
  recording: 'from-red-500 to-red-600',
  editing: 'from-green-500 to-green-600',
  review: 'from-yellow-500 to-yellow-600',
  publishing: 'from-brand-500 to-brand-600',
  concept: 'from-indigo-500 to-indigo-600',
  storyboard: 'from-cyan-500 to-cyan-600',
  preproduction: 'from-teal-500 to-teal-600',
  color_grade: 'from-violet-500 to-violet-600',
  sound: 'from-orange-500 to-orange-600',
  final_review: 'from-amber-500 to-amber-600',
}

export function YouTubeTimeline({ phases, onPhaseClick, onCompletePhase, editable = false }: YouTubeTimelineProps) {
  const isAllCompleted = phases.every((p) => p.status === 'completed')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-1">Production Timeline</h3>
        <div className="text-sm text-text-3">
          {phases.filter((p) => p.status === 'completed').length} of {phases.length} phases completed
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent" />

        {/* Phases */}
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const atRisk = isPhaseAtRisk(phase, 3)
            const isCompleted = phase.status === 'completed'
            const daysLeft = daysUntil(phase.endDate)
            const colorClass = PHASE_COLORS[phase.phaseName] || 'from-gray-500 to-gray-600'

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-20"
              >
                {/* Dot */}
                <div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-surface-0 cursor-pointer transition-all ${
                    isCompleted ? 'bg-green-500' : `bg-gradient-to-br ${colorClass}`
                  }`}
                  onClick={() => onPhaseClick?.(phase)}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onPhaseClick?.(phase)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-green-50 border-green-200 opacity-70'
                      : atRisk
                        ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100'
                        : 'bg-surface-1 border-surface-2 hover:border-brand-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-1 capitalize">{phase.phaseName}</h4>
                      <p className="text-xs text-text-3 mt-1">{phase.description}</p>
                    </div>
                    {atRisk && !isCompleted && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-text-3">
                    <div>
                      ðŸ“… {formatPhaseDate(phase.startDate)} - {formatPhaseDate(phase.endDate)}
                    </div>
                    <div>
                      {isCompleted ? 'âœ… Completed' : `â±ï¸ ${Math.max(0, daysLeft)} days left`}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${
                        isCompleted ? 'bg-green-500' : `bg-gradient-to-r ${colorClass}`
                      }`}
                      style={{
                        width:
                          phase.status === 'completed'
                            ? '100%'
                            : phase.status === 'in-progress'
                              ? '50%'
                              : '0%',
                      }}
                    />
                  </div>

                  {/* Deliverables */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-text-2 mb-1">Deliverables:</p>
                    <p className="text-xs text-text-3">{phase.deliverables}</p>
                  </div>

                  {/* Hours */}
                  <div className="text-xs text-text-3 flex justify-between">
                    <span>Est. {phase.estimatedHours}h</span>
                    {phase.actualHours > 0 && <span className="text-green-600">Actual: {phase.actualHours}h</span>}
                  </div>

                  {/* Action button */}
                  {editable && !isCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCompletePhase?.(phase.id)
                      }}
                      className="mt-3 w-full px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Completion message */}
        {isAllCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <p className="text-green-700 font-semibold">ðŸŽ‰ All phases completed!</p>
            <p className="text-sm text-green-600 mt-1">Your video is ready to publish.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

