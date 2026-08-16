import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Plus } from 'lucide-react'
import PageHeader from '@/shared/components/layout/PageHeader'
import Button from '@/shared/components/ui/Button'
import OperativeCard from '@/components/operatives/OperativeCard'
import { parseIntent, executeWorkflow, getWorkflowHistory } from '@/services/aiOperatives.service'

/**
 * AI Operatives Management Page
 *
 * Features:
 * - Browse available operatives
 * - Execute operatives with natural language
 * - View workflow history
 * - Monitor operative performance
 */
export default function AIOperatives() {
  const [operatives, setOperatives] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [userIntent, setUserIntent] = useState('')
  const [executing, setExecuting] = useState(false)

  // Built-in operatives
  const BUILT_IN_OPERATIVES = [
    {
      id: 'onboard_client',
      name: 'Client Onboarding',
      description: 'Automatically onboard new clients with welcome email, project setup, and team assignment',
      trigger: 'Manual',
      estimatedDuration: '2 min',
      steps: ['Create client', 'Send welcome email', 'Create project', 'Assign manager'],
      successRate: null,
    },
    {
      id: 'generate_invoice',
      name: 'Invoice Generation',
      description: 'Auto-generate invoices from time entries and send to clients',
      trigger: 'Scheduled (Monthly)',
      estimatedDuration: '5 min',
      steps: ['Gather time entries', 'Calculate billable hours', 'Generate PDF', 'Send to client'],
      successRate: null,
    },
    {
      id: 'project_status',
      name: 'Project Status Report',
      description: 'Generate daily project status reports based on activity and blockers',
      trigger: 'Scheduled (Daily 9am)',
      estimatedDuration: '3 min',
      steps: ['Gather activity', 'Identify blockers', 'Create summary', 'Post report'],
      successRate: null,
    },
    {
      id: 'financial_analysis',
      name: 'Financial Analysis',
      description: 'Weekly financial analysis with margin calculations and recommendations',
      trigger: 'Scheduled (Weekly)',
      estimatedDuration: '4 min',
      steps: ['Calculate metrics', 'Analyze trends', 'Generate insights', 'Create dashboard'],
      successRate: null,
    },
    {
      id: 'lead_nurture',
      name: 'Lead Nurturing',
      description: 'Automatically nurture new leads with personalized follow-ups',
      trigger: 'Webhook (New contact)',
      estimatedDuration: '2 min',
      steps: ['Add to CRM', 'Send intro', 'Schedule follow-up', 'Track engagement'],
      successRate: null,
    },
  ]

  // Load operatives and history on mount
  useEffect(() => {
    setOperatives(BUILT_IN_OPERATIVES)
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await getWorkflowHistory(10)
      setHistory(data)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  // Execute operative via natural language
  const handleExecuteIntent = async (e) => {
    e.preventDefault()
    if (!userIntent.trim()) return

    setExecuting(true)
    try {
      // Parse intent
      const intent = await parseIntent(userIntent)

      if (intent.confidence < 0.7) {
        alert('Could not understand request. Please be more specific.')
        setExecuting(false)
        return
      }

      // Execute workflow
      const result = await executeWorkflow(intent)

      // Reload history
      await loadHistory()

      // Show result
      if (result.success) {
        alert(`âœ… ${result.result.outcome}`)
      } else {
        alert(`âŒ Error: ${result.error}`)
      }

      setUserIntent('')
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setExecuting(false)
    }
  }

  // Execute specific operative
  const handleExecuteOperative = async (operative) => {
    setExecuting(true)
    try {
      const result = await executeWorkflow({
        action: operative.id,
        operative: operative.id,
        params: {},
      })

      await loadHistory()

      if (result.success) {
        alert(`âœ… ${result.result.outcome}`)
      } else {
        alert(`âŒ ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <PageHeader
        title="AI Operatives"
        description="Autonomous workflows that run without manual intervention"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} variant="secondary">
            Create Operative
          </Button>
        }
      />

      {/* Intent Input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '32px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))',
          border: '1px solid rgba(168,85,247,0.2)',
          padding: '24px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 12px 0' }}>
          ðŸ¤– What do you want to automate?
        </h3>

        <form onSubmit={handleExecuteIntent} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={userIntent}
            onChange={(e) => setUserIntent(e.target.value)}
            placeholder="E.g., 'Onboard new client Acme Inc' or 'Generate monthly invoices'"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-1)',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(168,85,247,0.3)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
          <Button
            type="submit"
            variant="primary"
            icon={<Zap className="w-4 h-4" />}
            disabled={executing || !userIntent.trim()}
          >
            {executing ? 'Running...' : 'Execute'}
          </Button>
        </form>

        <p style={{ fontSize: '12px', color: 'var(--text-5)', margin: '12px 0 0 0' }}>
          ðŸ’¡ Tip: Describe what you want to automate in natural language. AI will understand your intent and execute the right operative.
        </p>
      </motion.div>

      {/* Operatives Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px 0' }}>
          Available Operatives ({operatives.length})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {operatives.map((operative) => (
            <OperativeCard
              key={operative.id}
              operative={operative}
              status="ready"
              onExecute={() => handleExecuteOperative(operative)}
              loading={executing}
            />
          ))}
        </div>
      </div>

      {/* Recent Executions */}
      {history.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px 0' }}>
            Recent Executions
          </h2>

          <div style={{
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            {history.map((entry, i) => {
              const data = JSON.parse(entry.data || '{}')
              const isSuccess = entry.event_type === 'completed'

              return (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                      {data.intent?.operative || 'Unknown operative'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: '4px 0 0 0' }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isSuccess ? '#22c55e' : '#ef4444',
                      margin: 0,
                    }}>
                      {isSuccess ? 'âœ… Success' : 'âŒ Failed'}
                    </p>
                    {data.duration && (
                      <p style={{ fontSize: '11px', color: 'var(--text-5)', margin: '4px 0 0 0' }}>
                        {data.duration}ms
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


