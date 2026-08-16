import { supabase } from '@/shared/lib/supabase'
import type {
  YouTubeProject,
  YouTubePhase,
  YouTubeMilestone,
  CreateYouTubeProjectInput,
  UpdateYouTubeProjectInput,
  YouTubeTemplate,
} from '@/shared/types/youtube'
import { calculatePhaseDates, calculateProjectProgress } from '@/shared/utils/dateCalculations'
import { getTemplateByName } from '@/shared/data/youtubeTemplates'

/**
 * Crear un nuevo YouTube Project con phases automáticas
 */
export const createYouTubeProject = async (
  input: CreateYouTubeProjectInput
): Promise<YouTubeProject> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  // Obtener org_id del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) throw new Error('No organization found')

  // Crear el YouTube project
  const { data: project, error: projectError } = await supabase
    .from('youtube_projects')
    .insert({
      project_id: input.projectId,
      org_id: profile.org_id,
      title: input.title,
      description: input.description,
      template: input.template,
      target_audience: input.targetAudience,
      duration_minutes: input.durationMinutes ?? 10,
      publishing_date: input.publishingDate.toISOString().split('T')[0],
      status: 'planning',
    })
    .select()
    .single()

  if (projectError || !project) throw projectError || new Error('Failed to create project')

  // Obtener template y calcular phases
  const template = getTemplateByName(input.template)
  if (!template) throw new Error(`Template ${input.template} not found`)

  const phaseDates = calculatePhaseDates(input.publishingDate, template.phases)

  // Crear todas las phases
  const phases: YouTubePhase[] = []
  for (const pd of phaseDates) {
    const templatePhase = template.phases.find((p) => p.name === pd.name)
    if (!templatePhase) continue

    const { data: phaseData, error: phaseError } = await supabase
      .from('youtube_phases')
      .insert({
        youtube_project_id: project.id,
        phase_name: pd.name,
        phase_order: pd.order,
        start_date: pd.startDate.toISOString().split('T')[0],
        end_date: pd.endDate.toISOString().split('T')[0],
        description: templatePhase.description,
        deliverables: templatePhase.deliverables,
        estimated_hours: templatePhase.estimatedHours,
        status: 'pending',
      })
      .select()
      .single()

    if (phaseError || !phaseData) throw phaseError

    // Crear milestones para esta phase
    const daysDiff = Math.ceil((pd.endDate.getTime() - pd.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    for (let i = 0; i < daysDiff; i++) {
      const milestoneDate = new Date(pd.startDate)
      milestoneDate.setDate(milestoneDate.getDate() + i)

      await supabase.from('youtube_milestones').insert({
        youtube_phase_id: phaseData.id,
        title: `${pd.name} - Day ${i + 1}`,
        description: `Work on ${pd.name}`,
        due_date: milestoneDate.toISOString().split('T')[0],
        due_time: '09:00:00',
        reminder_days: [3, 1],
      })
    }

    phases.push({
      id: phaseData.id,
      youtubeProjectId: project.id,
      phaseName: pd.name as any,
      phaseOrder: pd.order,
      startDate: pd.startDate,
      endDate: pd.endDate,
      description: templatePhase.description,
      deliverables: templatePhase.deliverables,
      estimatedHours: templatePhase.estimatedHours,
      actualHours: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  return {
    id: project.id,
    projectId: project.project_id,
    orgId: project.org_id,
    title: project.title,
    description: project.description,
    template: project.template,
    targetAudience: project.target_audience,
    durationMinutes: project.duration_minutes,
    publishingDate: new Date(project.publishing_date),
    status: project.status,
    phases,
    metadata: project.metadata,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  }
}

/**
 * Obtener un YouTube Project con sus phases y milestones
 */
export const getYouTubeProject = async (projectId: string): Promise<YouTubeProject | null> => {
  const { data: project, error: projectError } = await supabase
    .from('youtube_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError || !project) return null

  const { data: phases, error: phasesError } = await supabase
    .from('youtube_phases')
    .select('*, youtube_milestones(*)')
    .eq('youtube_project_id', projectId)
    .order('phase_order', { ascending: true })

  if (phasesError) throw phasesError

  return {
    id: project.id,
    projectId: project.project_id,
    orgId: project.org_id,
    title: project.title,
    description: project.description,
    template: project.template,
    targetAudience: project.target_audience,
    durationMinutes: project.duration_minutes,
    publishingDate: new Date(project.publishing_date),
    status: project.status,
    phases: phases.map((p: any) => ({
      id: p.id,
      youtubeProjectId: p.youtube_project_id,
      phaseName: p.phase_name,
      phaseOrder: p.phase_order,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      description: p.description,
      deliverables: p.deliverables,
      estimatedHours: p.estimated_hours,
      actualHours: p.actual_hours,
      status: p.status,
      milestones: p.youtube_milestones.map((m: any) => ({
        id: m.id,
        youtubePhaseId: m.youtube_phase_id,
        title: m.title,
        description: m.description,
        dueDate: new Date(m.due_date),
        dueTime: m.due_time,
        reminderDays: m.reminder_days,
        completedAt: m.completed_at ? new Date(m.completed_at) : undefined,
        createdAt: new Date(m.created_at),
      })),
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    })),
    metadata: project.metadata,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  }
}

/**
 * Actualizar fecha de publicación y recalcular todas las phases
 */
export const updatePublishingDate = async (
  youtubeProjectId: string,
  newPublishingDate: Date
): Promise<YouTubeProject> => {
  // Obtener proyecto actual
  const project = await getYouTubeProject(youtubeProjectId)
  if (!project) throw new Error('Project not found')

  // Obtener template
  const template = getTemplateByName(project.template)
  if (!template) throw new Error('Template not found')

  // Calcular nuevas fechas
  const phaseDates = calculatePhaseDates(newPublishingDate, template.phases)

  // Actualizar cada phase
  for (const pd of phaseDates) {
    await supabase
      .from('youtube_phases')
      .update({
        start_date: pd.startDate.toISOString().split('T')[0],
        end_date: pd.endDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('youtube_project_id', youtubeProjectId)
      .eq('phase_order', pd.order)
  }

  // Actualizar publishing date del proyecto
  await supabase
    .from('youtube_projects')
    .update({
      publishing_date: newPublishingDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', youtubeProjectId)

  // Retornar proyecto actualizado
  const updated = await getYouTubeProject(youtubeProjectId)
  if (!updated) throw new Error('Failed to fetch updated project')
  return updated
}

/**
 * Marcar una phase como completada
 */
export const completePhase = async (phaseId: string, actualHours?: number): Promise<void> => {
  await supabase
    .from('youtube_phases')
    .update({
      status: 'completed',
      actual_hours: actualHours,
      updated_at: new Date().toISOString(),
    })
    .eq('id', phaseId)
}

/**
 * Obtener todos los YouTube Projects de una organización
 */
export const getYouTubeProjects = async (): Promise<YouTubeProject[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) throw new Error('No organization found')

  const { data: projects, error } = await supabase
    .from('youtube_projects')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  if (error) throw error

  const result: YouTubeProject[] = []
  for (const p of projects || []) {
    const project = await getYouTubeProject(p.id)
    if (project) result.push(project)
  }

  return result
}

/**
 * Eliminar un YouTube Project (cascada elimina phases y milestones)
 */
export const deleteYouTubeProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase.from('youtube_projects').delete().eq('id', projectId)
  if (error) throw error
}

