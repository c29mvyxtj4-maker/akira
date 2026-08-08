export type YouTubeTemplate = 'tutorial' | 'short-film' | 'documentary' | 'review' | 'podcast'
export type YouTubeProjectStatus = 'planning' | 'in-progress' | 'completed' | 'published'
export type YouTubePhaseStatus = 'pending' | 'in-progress' | 'completed'
export type PhaseName = 'research' | 'planning' | 'scripting' | 'recording' | 'editing' | 'review' | 'publishing' | 'concept' | 'storyboard' | 'preproduction' | 'color_grade' | 'sound' | 'final_review'

export interface YouTubePhase {
  id: string
  youtubeProjectId: string
  phaseName: PhaseName
  phaseOrder: number
  startDate: Date
  endDate: Date
  description: string
  deliverables: string
  estimatedHours: number
  actualHours: number
  status: YouTubePhaseStatus
  milestones?: YouTubeMilestone[]
  createdAt: Date
  updatedAt: Date
}

export interface YouTubeMilestone {
  id: string
  youtubePhaseId: string
  title: string
  description?: string
  dueDate: Date
  dueTime?: string
  reminderDays: number[]
  completedAt?: Date
  createdAt: Date
}

export interface YouTubeProject {
  id: string
  projectId: string
  orgId: string
  title: string
  description?: string
  template: YouTubeTemplate
  targetAudience?: string
  durationMinutes: number
  publishingDate: Date
  status: YouTubeProjectStatus
  phases: YouTubePhase[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface YouTubeTemplateConfig {
  name: string
  description: string
  typicalDuration: number
  phases: TemplatePhase[]
}

export interface TemplatePhase {
  name: PhaseName
  order: number
  daysNeeded: number
  description: string
  deliverables: string
  estimatedHours: number
  parallelize?: boolean
}

export interface CreateYouTubeProjectInput {
  projectId: string
  title: string
  template: YouTubeTemplate
  publishingDate: Date
  description?: string
  targetAudience?: string
  durationMinutes?: number
}

export interface UpdateYouTubeProjectInput {
  title?: string
  description?: string
  publishingDate?: Date
  status?: YouTubeProjectStatus
}

export interface YouTubeCalendarEvent {
  id: string
  title: string
  startDate: Date
  endDate: Date
  description: string
  phaseId: string
  projectId: string
  type: 'phase' | 'milestone'
  color?: string
  reminders: number[]
}
