import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Webhook, Plus, Trash2, AlertCircle, CheckCircle2, Clock,
  ChevronDown, RotateCcw, Eye, EyeOff
} from 'lucide-react'
import { getWebhooks, createWebhook, deleteWebhook, testWebhook } from '@/services/webhooks.service'
import Card from '@/components/ui/Card'

/**
 * Webhooks Panel
 * Configure and manage webhook event notifications
 */
export default function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [testingId, setTestingId] = useState(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    url: '',
    events: ['client.created', 'client.updated'],
    active: true,
    description: '',
  })

  const AVAILABLE_EVENTS = [
    { id: 'client.created', label: 'Client Created' },
    { id: 'client.updated', label: 'Client Updated' },
    { id: 'client.deleted', label: 'Client Deleted' },
    { id: 'project.created', label: 'Project Created' },
    { id: 'project.updated', label: 'Project Updated' },
    { id: 'project.completed', label: 'Project Completed' },
    { id: 'invoice.created', label: 'Invoice Created' },
    { id: 'invoice.paid', label: 'Invoice Paid' },
    { id: 'invoice.overdue', label: 'Invoice Overdue' },
    { id: 'quote.created', label: 'Quote Created' },
    { id: 'quote.accepted', label: 'Quote Accepted' },
    { id: 'payment.received', label: 'Payment Received' },
  ]

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      const data = await getWebhooks()
      setWebhooks(data)
      setError(null)
    } catch (err) {
      console.error('Error loading webhooks:', err)
      setError('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async (e) => {
    e.preventDefault()
    if (!formData.url.trim()) return

    try {
      const newWebhook = await createWebhook({
        url: formData.url,
        events: formData.events,
        active: formData.active,
        description: formData.description,
      })

      setWebhooks([...webhooks, newWebhook])
      setFormData({
        url: '',
        events: ['client.created', 'client.updated'],
        active: true,
        description: '',
      })
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error creating webhook:', err)
      setError('Failed to create webhook')
    }
  }

  const handleDeleteWebhook = async (webhookId) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      await deleteWebhook(webhookId)
      setWebhooks(webhooks.filter(w => w.id !== webhookId))
    } catch (err) {
      console.error('Error deleting webhook:', err)
      setError('Failed to delete webhook')
    }
  }

  const handleTestWebhook = async (webhookId) => {
    try {
      setTestingId(webhookId)
      await testWebhook(webhookId)
      // Show success message
      setError(null)
      setTimeout(() => setTestingId(null), 2000)
    } catch (err) {
      console.error('Error testing webhook:', err)
      setError('Test failed: ' + err.message)
      setTestingId(null)
    }
  }

  const getEventLabel = (eventId) => {
    return AVAILABLE_EVENTS.find(e => e.id === eventId)?.label || eventId
  }

  const getWebhookStatus = (webhook) => {
    if (!webhook.active) return { status: 'Inactive', color: 'text-text-4' }
    if (webhook.delivery_success_count === 0) return { status: 'Testing', color: 'text-status-warning' }
    return { status: 'Active', color: 'text-status-success' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-1">Webhooks</h2>
          <p className="text-sm text-text-4 mt-1">Receive real-time notifications for business events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Add Webhook
        </button>
      </div>

      {error && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg flex gap-3">
          <AlertCircle size={16} className="text-status-danger flex-shrink-0 mt-0.5" />
          <span className="text-sm text-status-danger">{error}</span>
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/webhook"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm placeholder-text-5 focus:outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Description</label>
                  <textarea
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm placeholder-text-5 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Events</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {AVAILABLE_EVENTS.map(event => (
                      <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                events: [...formData.events, event.id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter(ev => ev !== event.id)
                              })
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-text-2">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="active" className="text-sm text-text-2 cursor-pointer">
                    Activate this webhook immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                  >
                    Create Webhook
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-surface-2 text-text-2 rounded-lg hover:bg-surface-3 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhooks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-surface-3 animate-spin mb-3 mx-auto" />
            <p className="text-text-4 text-sm">Loading webhooks...</p>
          </div>
        </div>
      ) : webhooks.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Webhook size={40} className="text-text-4 mx-auto mb-3 opacity-50" />
          <p className="text-text-2 font-medium mb-1">No webhooks configured</p>
          <p className="text-text-4 text-sm">Add your first webhook to get started with event notifications</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook, index) => {
            const status = getWebhookStatus(webhook)
            return (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card padding="lg">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-1 break-all text-sm md:text-base">{webhook.url}</h3>
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.status}
                          </span>
                        </div>
                        {webhook.description && (
                          <p className="text-xs text-text-4">{webhook.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedId(expandedId === webhook.id ? null : webhook.id)}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-4 hover:text-text-2"
                      >
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${expandedId === webhook.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-surface-2 rounded px-3 py-2">
                        <p className="text-text-4">Delivered</p>
                        <p className="text-lg font-bold text-status-success">{webhook.delivery_success_count || 0}</p>
                      </div>
                      <div className="bg-surface-2 rounded px-3 py-2">
                        <p className="text-text-4">Failed</p>
                        <p className="text-lg font-bold text-status-danger">{webhook.delivery_failure_count || 0}</p>
                      </div>
                      <div className="bg-surface-2 rounded px-3 py-2">
                        <p className="text-text-4">Last Delivery</p>
                        <p className="font-mono text-text-2">
                          {webhook.last_delivery_at
                            ? new Date(webhook.last_delivery_at).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === webhook.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-border"
                        >
                          {/* Events */}
                          <div>
                            <p className="text-xs font-semibold text-text-4 mb-2 uppercase">Events</p>
                            <div className="flex flex-wrap gap-2">
                              {webhook.events && webhook.events.length > 0 ? (
                                webhook.events.map(event => (
                                  <span
                                    key={event}
                                    className="px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text-3 font-medium"
                                  >
                                    {getEventLabel(event)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-text-4">No events selected</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleTestWebhook(webhook.id)}
                              disabled={testingId === webhook.id}
                              className="flex-1 px-3 py-2 bg-surface-2 text-text-2 rounded-lg hover:bg-surface-3 transition-colors text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <RotateCcw size={12} className={testingId === webhook.id ? 'animate-spin' : ''} />
                              Test Delivery
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="px-3 py-2 bg-status-danger/10 text-status-danger rounded-lg hover:bg-status-danger/20 transition-colors text-xs font-medium"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Webhook Best Practices */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-status-info flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-text-1 mb-2">Webhook Best Practices</h3>
            <ul className="space-y-1 text-xs text-text-4 list-disc list-inside">
              <li>Ensure your endpoint responds with 200-299 status code within 30 seconds</li>
              <li>Validate webhook signatures using the X-Webhook-Signature header</li>
              <li>Implement idempotency to handle duplicate deliveries</li>
              <li>Use HTTPS for all webhook endpoints</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
