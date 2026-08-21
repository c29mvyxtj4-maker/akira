import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, BarChart3 } from 'lucide-react'
import Timer from '@/components/time/Timer'
import TimeEntries from '@/components/time/TimeEntries'
import PageHeader from '@/shared/components/layout/PageHeader'
import Button from '@/shared/components/ui/Button'
import EmptyState from '@/shared/components/ui/EmptyState'
import Modal from '@/shared/components/ui/Modal'
import Select from '@/shared/components/ui/Select'
import { supabase } from '@/lib/supabase'

/**
 * Time Tracking Page
 *
 * Features:
 * - Live timer with project selection
 * - Time entries history
 * - Weekly/monthly summary
 * - Billable vs non-billable tracking
 * - Integration with projects for invoicing
 */
export default function TimeTracking() {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const [projects, setProjects] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const { data } = await supabase
          .from('projects')
          .select('id, name, clients(name)')
          .limit(50)

        setProjects(data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error loading projects:', error)
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Load time entries
  useEffect(() => {
    async function loadEntries() {
      try {
        const { data } = await supabase
          .from('time_entries')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(50)

        setEntries(data || [])
      } catch (error) {
        console.error('Error loading entries:', error)
      }
    }

    loadEntries()
  }, [])

  // Handle start
  const handleStart = () => {
    setIsRunning(true)
  }

  // Handle pause
  const handlePause = () => {
    setIsRunning(false)
  }

  // Handle save entry
  const handleComplete = async () => {
    if (seconds === 0) return

    try {
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('time_entries').insert([
        {
          user_id: user?.id,
          project_id: selectedProject || null,
          duration_seconds: seconds,
          description: projectDescription,
          billable: isBillable,
          started_at: new Date(Date.now() - seconds * 1000).toISOString(),
        },
      ])

      // Reset
      setSeconds(0)
      setProjectDescription('')
      setIsRunning(false)

      // Reload entries
      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50)

      setEntries(data || [])
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  // Calculate weekly summary
  const weekSeconds = entries
    .filter((e) => {
      const date = new Date(e.started_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return date >= weekAgo
    })
    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0)

  const weekHours = (weekSeconds / 3600).toFixed(1)
  const selectedProjectName = projects.find((p) => p.id === selectedProject)?.name

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <PageHeader
        title="Time Tracking"
        description={`Track your work time and generate accurate invoices`}
        actions={
          <Button icon={<BarChart3 className="w-4 h-4" />} variant="secondary">
            Reports
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Timer Card */}
          <Timer
            isRunning={isRunning}
            seconds={seconds}
            projectName={selectedProjectName}
            onStart={handleStart}
            onPause={handlePause}
            onStop={() => setSeconds(0)}
            onComplete={handleComplete}
            disabled={!selectedProject}
          />

          {/* Project & Settings */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Session Details
            </h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-4)', display: 'block', marginBottom: '6px' }}>
                Project *
              </label>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                size="md"
                options={[
                  { value: '', label: 'Select a project...' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: `${p.name}${p.clients?.name ? ` (${p.clients.name})` : ''}`,
                  })),
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-4)', display: 'block', marginBottom: '6px' }}>
                What are you working on?
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="e.g., Design mockups, Fix bug #123..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-1)',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(230,57,70,0.3)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
            }}>
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-2)' }}>
                Billable time (invoice the client)
              </span>
            </label>
          </motion.div>

          {/* Recent Entries */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px 0' }}>
              Time Entries ({entries.length})
            </h3>
            <TimeEntries entries={entries.slice(0, 10)} loading={loading} />
          </motion.div>
        </motion.div>

        {/* Sidebar - Summary */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Weekly Summary */}
          <motion.div
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
              border: '1px solid rgba(34,197,94,0.2)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: 0, marginBottom: '6px' }}>
              This Week
            </p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e', margin: 0, fontFamily: '"JetBrains Mono"' }}>
              {weekHours}h
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
              {Math.round(weekSeconds / 3600)} hours logged
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>Billable this week</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>
                {Math.round(
                  entries
                    .filter((e) => {
                      const date = new Date(e.started_at)
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return date >= weekAgo && e.billable
                    })
                    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600
                )}h
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>Non-billable</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-3)' }}>
                {Math.round(
                  entries
                    .filter((e) => {
                      const date = new Date(e.started_at)
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return date >= weekAgo && !e.billable
                    })
                    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600
                )}h
              </span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            style={{ width: '100%' }}
            onClick={() => setModalOpen(true)}
          >
            Manual Entry
          </Button>
        </motion.div>
      </div>
    </div>
  )
}


