import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Video, Users, Clock } from 'lucide-react'
import type { YouTubeTemplate, CreateYouTubeProjectInput } from '@/shared/types/youtube'
import { YOUTUBE_TEMPLATES } from '@/shared/data/youtubeTemplates'

interface YouTubeProjectFormProps {
  projectId: string
  onSubmit: (input: CreateYouTubeProjectInput) => Promise<void>
  isLoading?: boolean
}

export function YouTubeProjectForm({ projectId, onSubmit, isLoading = false }: YouTubeProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    template: 'tutorial' as YouTubeTemplate,
    publishingDate: new Date().toISOString().split('T')[0],
    description: '',
    targetAudience: '',
    durationMinutes: 10,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedTemplate = YOUTUBE_TEMPLATES[formData.template]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título requerido'
    }
    if (!formData.publishingDate) {
      newErrors.publishingDate = 'Fecha de publicación requerida'
    }
    if (new Date(formData.publishingDate) <= new Date()) {
      newErrors.publishingDate = 'La fecha debe ser en el futuro'
    }
    if (formData.durationMinutes < 1) {
      newErrors.durationMinutes = 'Duración debe ser al menos 1 minuto'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    const input: CreateYouTubeProjectInput = {
      projectId,
      title: formData.title,
      template: formData.template,
      publishingDate: new Date(formData.publishingDate),
      description: formData.description,
      targetAudience: formData.targetAudience,
      durationMinutes: formData.durationMinutes,
    }

    await onSubmit(input)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-gradient-to-br from-surface-0 to-surface-1 rounded-lg border border-surface-2"
    >
      {Object.keys(errors).length > 0 && (
        <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-3 flex gap-2">
          <div className="text-status-danger text-sm font-medium">
            {Object.values(errors).map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-text-1 mb-2">Video Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Tutorial React Hooks"
          className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-1 mb-2">Template</label>
          <select
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value as YouTubeTemplate })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {Object.entries(YOUTUBE_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-1 mb-2">Publishing Date</label>
          <input
            type="date"
            value={formData.publishingDate}
            onChange={(e) => setFormData({ ...formData, publishingDate: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-1 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of your video"
          className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-1 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Target Audience
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Developers"
            className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 placeholder-text-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-1 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
            min="1"
            max="480"
            className="w-full px-4 py-2 bg-surface-1 border border-surface-2 rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {selectedTemplate && (
        <div className="p-4 bg-brand-dim rounded-lg border border-brand-500 border-opacity-30">
          <p className="text-sm text-text-1 font-semibold mb-2">ðŸ“‹ Template Overview</p>
          <p className="text-sm text-text-2 mb-3">{selectedTemplate.description}</p>
          <div className="space-y-1">
            {selectedTemplate.phases.map((phase) => (
              <div key={phase.name} className="text-xs text-text-3 flex justify-between">
                <span>{phase.name}</span>
                <span>{phase.daysNeeded} days</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-4 mt-3 pt-3 border-t border-brand-500 border-opacity-30">
            Total: {selectedTemplate.phases.reduce((sum, p) => sum + p.daysNeeded, 0)} days
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !formData.title}
        className="w-full px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating Project...' : 'Create YouTube Project'}
      </button>
    </motion.form>
  )
}

