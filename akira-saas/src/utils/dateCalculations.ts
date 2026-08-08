import type { TemplatePhase } from '@/types/youtube'

/**
 * Calcula fechas para phases trabajando hacia atrás desde publishing date
 * Considera el tiempo estimado y si las phases pueden ser paralelas
 */
export const calculatePhaseDates = (
  publishingDate: Date,
  phases: TemplatePhase[]
): Array<{ name: string; order: number; startDate: Date; endDate: Date; daysNeeded: number }> => {
  const result: Array<{ name: string; order: number; startDate: Date; endDate: Date; daysNeeded: number }> = []

  // Publishing ocurre 1 día antes de la fecha (para dejar buffer)
  let currentDate = new Date(publishingDate)
  currentDate.setDate(currentDate.getDate() - 1)

  // Ordena phases en reversa para calcular hacia atrás
  const sortedPhases = [...phases].sort((a, b) => b.order - a.order)

  for (const phase of sortedPhases) {
    const endDate = new Date(currentDate)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - phase.daysNeeded)

    result.push({
      name: phase.name,
      order: phase.order,
      startDate,
      endDate,
      daysNeeded: phase.daysNeeded,
    })

    // Si no es paralizable, el siguiente phase termina cuando este comienza
    if (!phase.parallelize) {
      currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() - 1)
    }
  }

  // Re-ordena por order ASC para retornar en orden natural
  return result.sort((a, b) => a.order - b.order)
}

/**
 * Recalcula todas las phases si la fecha de publicación cambia
 */
export const recalculatePhasesForNewDate = (
  oldPhases: Array<{ name: string; daysNeeded: number; order: number; parallelize?: boolean }>,
  oldPublishingDate: Date,
  newPublishingDate: Date
): Array<{ name: string; order: number; startDate: Date; endDate: Date; daysNeeded: number }> => {
  return calculatePhaseDates(newPublishingDate, oldPhases as TemplatePhase[])
}

/**
 * Calcula cuántos días faltan hasta un milestone
 */
export const daysUntil = (date: Date): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatPhaseDate = (date: Date): string => {
  const d = new Date(date)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

/**
 * Calcula el progreso de un proyecto basado en phases completadas
 */
export const calculateProjectProgress = (
  phases: Array<{ status: 'pending' | 'in-progress' | 'completed' }>
): number => {
  if (phases.length === 0) return 0
  const completed = phases.filter((p) => p.status === 'completed').length
  return Math.round((completed / phases.length) * 100)
}

/**
 * Retorna las próximas N fases
 */
export const getUpcomingPhases = (
  phases: Array<{ name: string; startDate: Date; status: 'pending' | 'in-progress' | 'completed' }>,
  count: number = 3
) => {
  const today = new Date()
  return phases
    .filter((p) => p.status !== 'completed' && new Date(p.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count)
}

/**
 * Calcula si una fase está "en riesgo" (llegando a la fecha final)
 */
export const isPhaseAtRisk = (
  phase: { endDate: Date; status: 'pending' | 'in-progress' | 'completed' },
  daysWarning: number = 3
): boolean => {
  if (phase.status === 'completed') return false
  const today = new Date()
  const endDate = new Date(phase.endDate)
  const diff = endDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return daysLeft <= daysWarning
}

/**
 * Distribuye horas estimadas entre milestones de una phase
 */
export const distributeMilestoneHours = (
  phaseHours: number,
  milestoneDays: number
): number[] => {
  const hours: number[] = []
  const baseHours = Math.floor(phaseHours / milestoneDays)
  const remainder = phaseHours % milestoneDays

  for (let i = 0; i < milestoneDays; i++) {
    hours.push(baseHours + (i < remainder ? 1 : 0))
  }

  return hours
}
