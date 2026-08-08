import { useState, useEffect } from 'react'
import type { YouTubeProject, CreateYouTubeProjectInput } from '@/types/youtube'
import * as YouTubeService from '@/services/youtube.service'

export const useYouTube = (projectId?: string) => {
  const [project, setProject] = useState<YouTubeProject | null>(null)
  const [projects, setProjects] = useState<YouTubeProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener un proyecto específico
  const getProject = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await YouTubeService.getYouTubeProject(id)
      setProject(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  // Obtener todos los proyectos
  const getAllProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await YouTubeService.getYouTubeProjects()
      setProjects(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Crear un nuevo proyecto
  const createProject = async (input: CreateYouTubeProjectInput) => {
    setLoading(true)
    setError(null)
    try {
      const result = await YouTubeService.createYouTubeProject(input)
      setProject(result)
      setProjects((prev) => [result, ...prev])
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actualizar fecha de publicación
  const updatePublishingDate = async (id: string, newDate: Date) => {
    setLoading(true)
    setError(null)
    try {
      const result = await YouTubeService.updatePublishingDate(id, newDate)
      setProject(result)
      setProjects((prev) => prev.map((p) => (p.id === id ? result : p)))
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update date'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Marcar phase como completada
  const completePhase = async (phaseId: string, actualHours?: number) => {
    setError(null)
    try {
      await YouTubeService.completePhase(phaseId, actualHours)
      if (project) {
        const updated = await YouTubeService.getYouTubeProject(project.id)
        setProject(updated)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete phase'
      setError(msg)
      throw err
    }
  }

  // Eliminar proyecto
  const deleteProject = async (id: string) => {
    setError(null)
    try {
      await YouTubeService.deleteYouTubeProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (project?.id === id) setProject(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project'
      setError(msg)
      throw err
    }
  }

  // Auto-load si se pasa projectId
  useEffect(() => {
    if (projectId) {
      getProject(projectId)
    }
  }, [projectId])

  return {
    project,
    projects,
    loading,
    error,
    getProject,
    getAllProjects,
    createProject,
    updatePublishingDate,
    completePhase,
    deleteProject,
  }
}
