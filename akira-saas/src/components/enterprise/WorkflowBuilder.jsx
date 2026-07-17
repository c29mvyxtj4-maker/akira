import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ArrowRight, Settings2, Play, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Workflow Builder
 * Visual workflow editor for automating business processes
 */
export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'New Client Onboarding',
      trigger: 'client.created',
      steps: [
        { id: 's1', action: 'send_email', config: { template: 'welcome' } },
        { id: 's2', action: 'create_project', config: { template: 'onboarding' } },
        { id: 's3', action: 'assign_team', config: { team: 'onboarding' } },
      ],
      enabled: true,
    },
    {
      id: '2',
      name: 'Invoice Payment Reminder',
      trigger: 'invoice.overdue',
      steps: [
        { id: 's1', action: 'send_email', config: { template: 'reminder' } },
        { id: 's2', action: 'create_task', config: { assignee: 'accounting' } },
      ],
      enabled: true,
    },
  ])

  const [selectedWorkflow, setSelectedWorkflow] = useState(workflows[0])
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)

  const ACTIONS = [
    { id: 'send_email', label: 'Send Email', icon: '✉️' },
    { id: 'create_task', label: 'Create Task', icon: '✓' },
    { id: 'create_project', label: 'Create Project', icon: '📋' },
    { id: 'assign_team', label: 'Assign Team', icon: '👥' },
    { id: 'send_notification', label: 'Send Notification', icon: '🔔' },
    { id: 'update_status', label: 'Update Status', icon: '🔄' },
  ]

  const TRIGGERS = [
    { id: 'client.created', label: 'Client Created' },
    { id: 'client.updated', label: 'Client Updated' },
    { id: 'project.completed', label: 'Project Completed' },
    { id: 'invoice.created', label: 'Invoice Created' },
    { id: 'invoice.overdue', label: 'Invoice Overdue' },
    { id: 'payment.received', label: 'Payment Received' },
  ]

  const addStep = () => {
    const newStep = {
      id: `s${Date.now()}`,
      action: 'send_email',
      config: {},
    }
    const updated = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep],
    }
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updated : w))
    setSelectedWorkflow(updated)
  }

  const removeStep = (stepId) => {
    const updated = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(s => s.id !== stepId),
    }
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updated : w))
    setSelectedWorkflow(updated)
  }

  const getActionLabel = (actionId) => {
    return ACTIONS.find(a => a.id === actionId)?.label || actionId
  }

  const getTriggerLabel = (triggerId) => {
    return TRIGGERS.find(t => t.id === triggerId)?.label || triggerId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-1">Workflow Builder</h2>
          <p className="text-sm text-text-4 mt-1">Create automated workflows to streamline your business</p>
        </div>
        <button
          onClick={() => setShowNewWorkflow(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="space-y-2">
          {workflows.map((workflow, i) => (
            <motion.button
              key={workflow.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedWorkflow(workflow)}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                selectedWorkflow.id === workflow.id
                  ? 'bg-surface-2 border-brand-500 ring-1 ring-brand-500/30'
                  : 'bg-surface-2 border-border hover:border-brand-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-text-1 text-sm">{workflow.name}</p>
                  <p className="text-xs text-text-4 mt-1">{workflow.steps.length} steps</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  workflow.enabled
                    ? 'bg-status-success/10 text-status-success'
                    : 'bg-status-danger/10 text-status-danger'
                }`}>
                  {workflow.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Workflow Editor */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <div className="space-y-4">
              {/* Workflow Header */}
              <Card padding="lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Name</label>
                    <input
                      type="text"
                      defaultValue={selectedWorkflow.name}
                      className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Trigger</label>
                    <select
                      defaultValue={selectedWorkflow.trigger}
                      className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm focus:outline-none focus:border-brand-500"
                    >
                      {TRIGGERS.map(trigger => (
                        <option key={trigger.id} value={trigger.id}>
                          {trigger.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      defaultChecked={selectedWorkflow.enabled}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="enabled" className="text-sm text-text-2">
                      Enable this workflow
                    </label>
                  </div>
                </div>
              </Card>

              {/* Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-1">Steps</h3>
                  <button
                    onClick={addStep}
                    className="px-3 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors font-medium flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add Step
                  </button>
                </div>

                {selectedWorkflow.steps.length === 0 ? (
                  <Card padding="lg" className="text-center py-8">
                    <AlertCircle size={32} className="text-text-4 mx-auto mb-2 opacity-50" />
                    <p className="text-text-4 text-sm">No steps yet. Add one to get started.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, i) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card padding="lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <select
                                defaultValue={step.action}
                                className="px-2 py-1 text-sm bg-surface-2 border border-border rounded text-text-1 focus:outline-none focus:border-brand-500"
                              >
                                {ACTIONS.map(action => (
                                  <option key={action.id} value={action.id}>
                                    {action.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeStep(step.id)}
                              className="p-1 hover:bg-surface-2 rounded text-text-4 hover:text-status-danger transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="space-y-2 pl-8">
                            <input
                              type="text"
                              placeholder="Step configuration (optional)"
                              className="w-full px-2 py-1 text-xs bg-surface-2 border border-border rounded text-text-1 placeholder-text-5 focus:outline-none focus:border-brand-500"
                            />
                          </div>

                          {i < selectedWorkflow.steps.length - 1 && (
                            <div className="flex justify-center mt-3">
                              <ArrowRight size={16} className="text-text-4 rotate-90" />
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium flex items-center justify-center gap-2">
                  <Play size={14} />
                  Test Workflow
                </button>
                <button className="flex-1 px-4 py-2 bg-surface-2 text-text-2 rounded-lg hover:bg-surface-3 transition-colors font-medium">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full py-12">
              <p className="text-text-4">Select a workflow to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
