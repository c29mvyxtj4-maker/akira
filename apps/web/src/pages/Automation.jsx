import React, { useState, useEffect } from 'react'
import { useAuth } from '@/shared/context/AuthContext'
import { useOrg } from '@/shared/context/OrgContext'
import { motion } from 'framer-motion'
import { Play, History, AlertCircle } from 'lucide-react'
import { workflowTemplates, workflowEngine } from '@/modules/automation'
import { workflowsService } from '@/modules/automation'

export default function Automation() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [executions, setExecutions] = useState([])
  const [executing, setExecuting] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (currentOrg?.id) {
      loadExecutions()
    }
  }, [currentOrg?.id])

  const loadExecutions = async () => {
    try {
      const stored = localStorage.getItem('akira_workflow_executions')
      if (stored) {
        const execs = JSON.parse(stored)
        setExecutions(execs.map(e => ({
          id: e.id,
          templateName: e.name || 'Workflow',
          status: e.status,
          progress: e.progress || 0,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          result: e.result,
        })))
      }
    } catch (err) {
      console.error('Failed to load executions:', err)
    }
  }

  const handleExecuteWorkflow = async (template) => {
    if (!user || !currentOrg) return

    try {
      setExecuting(template.id)
      setError(null)

      // Create workflow instance
      const workflow = {
        id: `workflow-${Date.now()}`,
        org_id: currentOrg.id,
        user_id: user.id,
        name: `${template.name} - ${new Date().toLocaleString('es-ES')}`,
        template_id: template.id,
        status: 'active',
        steps: template.steps,
        config: {},
      }

      // Execute workflow
      const execution = await workflowEngine.executeWorkflow(workflow)

      // Save to localStorage
      const stored = localStorage.getItem('akira_workflow_executions') || '[]'
      const execs = JSON.parse(stored)
      execs.unshift(execution)
      localStorage.setItem('akira_workflow_executions', JSON.stringify(execs))

      // Add to history
      setExecutions((prev) => [
        {
          id: execution.id,
          templateName: template.name,
          status: execution.status,
          progress: execution.progress,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          result: execution.result,
        },
        ...prev,
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Workflow execution failed'
      setError(message)
      console.error('Workflow execution error:', err)
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '8px' }}>
          Automation Workflows
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-3)' }}>
          Run AI-powered workflows to automate your business tasks
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(230,57,70,0.1)',
            border: '1px solid rgba(230,57,70,0.2)',
            color: '#e63946',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {/* Workflow Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
          Available Workflows
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {workflowTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'var(--surface-0)',
                border: '1px solid var(--surface-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-500)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(230,57,70,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--surface-2)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>
                  {template.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>{template.description}</p>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-4)', paddingTop: '8px', borderTop: '1px solid var(--surface-2)' }}>
                <p>
                  <strong>{template.steps.length}</strong> steps â€¢ ~<strong>{template.estimatedDuration}</strong> min
                </p>
              </div>

              <button
                onClick={() => handleExecuteWorkflow(template)}
                disabled={executing === template.id}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: executing === template.id ? 'var(--text-3)' : 'var(--brand-500)',
                  color: 'white',
                  border: 'none',
                  cursor: executing === template.id ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: executing === template.id ? 0.6 : 1,
                }}
              >
                <Play size={14} />
                {executing === template.id ? 'Running...' : 'Run Workflow'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Execution History */}
      {executions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} /> Recent Executions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {executions.map((exec) => (
              <motion.div
                key={exec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)' }}>
                    {exec.templateName}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '4px' }}>
                    {new Date(exec.startedAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '100px', height: '6px', borderRadius: '3px', background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${exec.progress}%`,
                        height: '100%',
                        background: exec.status === 'completed' ? 'var(--success)' : exec.status === 'failed' ? 'var(--danger)' : 'var(--brand-500)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background:
                        exec.status === 'completed'
                          ? 'rgba(34,197,94,0.1)'
                          : exec.status === 'failed'
                          ? 'rgba(230,57,70,0.1)'
                          : 'rgba(59,130,246,0.1)',
                      color:
                        exec.status === 'completed'
                          ? '#22c55e'
                          : exec.status === 'failed'
                          ? '#e63946'
                          : '#3b82f6',
                    }}
                  >
                    {exec.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {executions.length === 0 && !executing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-4)',
          }}
        >
          <p style={{ fontSize: '14px' }}>
            Run a workflow above to see execution history
          </p>
        </motion.div>
      )}
    </div>
  )
}

