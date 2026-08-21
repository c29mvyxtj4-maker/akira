import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Clock, AlertCircle } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Modal from '@/shared/components/ui/Modal'
import Input from '@/shared/components/ui/Input'
import Select from '@/shared/components/ui/Select'

/**
 * TimeEntryForm component - Modal form for adding time entries
 *
 * Features:
 * - Project selection
 * - Date/time picker
 * - Duration input
 * - Description field
 * - Billable toggle
 * - Form validation
 * - Success feedback
 */
export default function TimeEntryForm({
  isOpen = false,
  onClose,
  onSubmit,
  projects = [],
  loading = false,
}) {
  const [formData, setFormData] = useState({
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '1',
    minutes: '0',
    description: '',
    billable: true,
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    const hours = parseInt(formData.hours) || 0
    const minutes = parseInt(formData.minutes) || 0
    const totalSeconds = hours * 3600 + minutes * 60

    if (totalSeconds === 0) {
      newErrors.duration = 'Ingresa una duración válida'
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Selecciona un proyecto'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    await onSubmit({
      project_id: formData.project_id,
      duration_seconds: totalSeconds,
      description: formData.description || null,
      billable: formData.billable,
      started_at: new Date(`${formData.date}T00:00:00`).toISOString(),
    })

    // Reset form
    setFormData({
      project_id: '',
      date: new Date().toISOString().split('T')[0],
      hours: '1',
      minutes: '0',
      description: '',
      billable: true,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(230,57,70,0.05))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock style={{ width: '20px', height: '20px', color: 'var(--brand)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Add Time Entry
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {Object.keys(errors).length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px', color: '#ef4444' }}>
                {Object.values(errors).map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Project Selection */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>
                Project *
              </label>
              <Select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select a project...' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: `${p.name}${p.clients?.name ? ` (${p.clients.name})` : ''}`,
                  })),
                ]}
              />
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>
                Date *
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            {/* Duration */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>
                Duration *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <Input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    min="0"
                    max="24"
                    placeholder="Hours"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    name="minutes"
                    value={formData.minutes}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    placeholder="Minutes"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>
                What did you work on?
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Design mockups, Fix bug #123..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
              />
            </div>

            {/* Billable Checkbox */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
            }}>
              <input
                type="checkbox"
                name="billable"
                checked={formData.billable}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-2)' }}>
                Billable time (invoice the client)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Plus className="w-4 h-4" />}
              style={{ flex: 1 }}
            >
              Add Entry
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  )
}

