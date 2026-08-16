import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Film } from 'lucide-react'
import AppShell from '@/shared/components/layout/AppShell'
import { YouTubeProjectForm } from '@/components/YouTube/YouTubeProjectForm'
import { YouTubeTimeline } from '@/components/YouTube/YouTubeTimeline'
import { YouTubeMetrics } from '@/components/YouTube/YouTubeMetrics'
import { useYouTube } from '@/shared/hooks/useYouTube'
import { useAuth } from '@/shared/context/AuthContext'
import { useOrg } from '@/shared/context/OrgContext'
import { useApp } from '@/shared/context/AppContext'

export default function YouTubePage() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const { addToast } = useApp()
  const { projects, loading, createProject, getAllProjects, getProject } = useYouTube()
  const [selectedProject, setSelectedProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  // Cargar proyectos al montar
  useEffect(() => {
    getAllProjects()
  }, [])

  const handleCreateProject = async (input) => {
    try {
      const project = await createProject(input)
      addToast({
        type: 'success',
        message: `YouTube project "${project.title}" created with ${project.phases.length} phases!`,
      })
      setShowForm(false)
      setSelectedProject(project)
    } catch (error) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to create YouTube project',
      })
    }
  }

  const handleSelectProject = (project) => {
    setSelectedProject(project)
    setSelectedProjectId(project.id)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-dim rounded-lg">
                <Film className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-1">YouTube Projects</h1>
                <p className="text-text-3 text-sm mt-1">Create, plan, and track your video production workflow</p>
              </div>
            </div>
            {!showForm && projects.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            )}
          </div>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-1">Create New YouTube Project</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-text-3 hover:text-text-1 transition-colors"
                  >
                    –œ•
                  </button>
                </div>
                <YouTubeProjectForm projectId={currentOrg?.id} onSubmit={handleCreateProject} isLoading={loading} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {projects.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-surface-1 rounded-lg border border-surface-2"
          >
            <Film className="w-16 h-16 text-text-4 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-text-1 mb-2">No YouTube Projects Yet</h3>
            <p className="text-text-3 mb-6">Create your first YouTube project to get started with automated workflow planning</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Project
            </button>
          </motion.div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && !showForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-bold text-text-1 mb-4">Projects ({projects.length})</h3>
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors mb-4"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
              <div className="space-y-2">
                {projects.map((project) => (
                  <motion.button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    whileHover={{ x: 4 }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedProjectId === project.id
                        ? 'bg-brand-dim border-brand-500'
                        : 'bg-surface-1 border-surface-2 hover:border-brand-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-text-1 text-sm">{project.title}</p>
                        <p className="text-xs text-text-3 mt-1 capitalize">{project.template}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs bg-text-4 text-text-1 rounded px-2 py-0.5">
                            {project.phases.filter((p) => p.status === 'completed').length}/{project.phases.length}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-3" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Project Header */}
                  <div className="p-6 bg-gradient-to-br from-surface-1 to-surface-0 rounded-lg border border-surface-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-text-1">{selectedProject.title}</h2>
                        <p className="text-text-3 mt-2">{selectedProject.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        selectedProject.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : selectedProject.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-brand-dim text-brand-500'
                      }`}>
                        {selectedProject.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-text-3 text-xs">Template</p>
                        <p className="font-semibold text-text-1 capitalize">{selectedProject.template}</p>
                      </div>
                      <div>
                        <p className="text-text-3 text-xs">Publish Date</p>
                        <p className="font-semibold text-text-1">{selectedProject.publishingDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-text-3 text-xs">Duration</p>
                        <p className="font-semibold text-text-1">{selectedProject.durationMinutes} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <YouTubeMetrics project={selectedProject} />

                  {/* Timeline */}
                  <YouTubeTimeline phases={selectedProject.phases} editable={true} />
                </motion.div>
              ) : (
                <div className="p-12 text-center bg-surface-1 rounded-lg border border-surface-2">
                  <p className="text-text-3">Select a project to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}



