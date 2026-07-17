import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy, Eye, EyeOff, Trash2, Plus, Check, AlertCircle,
  Clock, Shield, MoreVertical
} from 'lucide-react'
import { getApiKeys, createApiKey, revokeApiKey } from '@/services/publicApi.service'
import Card from '@/components/ui/Card'

/**
 * API Keys Manager
 * Create, view, and manage API keys for public API access
 */
export default function APIKeysManager() {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: ['read:clients', 'read:projects'],
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      const keys = await getApiKeys()
      setApiKeys(keys)
      setError(null)
    } catch (err) {
      console.error('Error loading API keys:', err)
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      const newKey = await createApiKey({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      })

      setApiKeys([...apiKeys, newKey])
      setFormData({ name: '', description: '', permissions: ['read:clients', 'read:projects'] })
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error creating API key:', err)
      setError('Failed to create API key')
    }
  }

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return

    try {
      await revokeApiKey(keyId)
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
    } catch (err) {
      console.error('Error revoking API key:', err)
      setError('Failed to revoke API key')
    }
  }

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text)
    setCopiedId(keyId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const maskKey = (key) => {
    if (!key) return ''
    return key.substring(0, 8) + '...' + key.substring(key.length - 8)
  }

  const getPermissionLabel = (perm) => {
    const labels = {
      'read:clients': 'Read Clients',
      'write:clients': 'Write Clients',
      'read:projects': 'Read Projects',
      'write:projects': 'Write Projects',
      'read:finance': 'Read Finance',
      'write:finance': 'Write Finance',
      'read:invoices': 'Read Invoices',
      'write:invoices': 'Write Invoices',
      'admin': 'Admin Access',
    }
    return labels[perm] || perm
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-1">API Keys</h2>
          <p className="text-sm text-text-4 mt-1">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Create Key
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
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production API Key"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm placeholder-text-5 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Description</label>
                  <textarea
                    placeholder="Optional description for this key"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm placeholder-text-5 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Permissions</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'read:clients',
                      'write:clients',
                      'read:projects',
                      'write:projects',
                      'read:finance',
                      'write:finance',
                      'read:invoices',
                      'write:invoices',
                    ].map(perm => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, perm]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter(p => p !== perm)
                              })
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-text-2">{getPermissionLabel(perm)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                  >
                    Create API Key
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

      {/* API Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-surface-3 animate-spin mb-3 mx-auto" />
            <p className="text-text-4 text-sm">Loading API keys...</p>
          </div>
        </div>
      ) : apiKeys.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Shield size={40} className="text-text-4 mx-auto mb-3 opacity-50" />
          <p className="text-text-2 font-medium mb-1">No API keys yet</p>
          <p className="text-text-4 text-sm">Create your first API key to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key, index) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="lg" hover>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-text-1">{key.name}</h3>
                      {key.description && (
                        <p className="text-sm text-text-4 mt-1">{key.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-4 hover:text-text-2"
                      >
                        {visibleKeys[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-4 hover:text-text-2"
                      >
                        {copiedId === key.id ? (
                          <Check size={16} className="text-status-success" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-2 hover:bg-status-danger/10 rounded-lg transition-colors text-text-4 hover:text-status-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Key Display */}
                  <div className="bg-surface-2 rounded-lg px-3 py-2 font-mono text-sm text-text-2 break-all">
                    {visibleKeys[key.id] ? key.key : maskKey(key.key)}
                  </div>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-2">
                    {key.permissions && key.permissions.length > 0 ? (
                      key.permissions.map(perm => (
                        <span
                          key={perm}
                          className="px-2 py-1 bg-surface-2 border border-border rounded text-xs text-text-3 font-medium"
                        >
                          {getPermissionLabel(perm)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-4">No permissions</span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-text-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                    </div>
                    {key.last_used_at && (
                      <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Documentation Link */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-brand-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-text-1 mb-1">API Documentation</h3>
            <p className="text-sm text-text-4 mb-3">
              Learn how to use the AKIRA API with your application
            </p>
            <a
              href="https://docs.akira.app/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-500 hover:text-brand-400 font-medium"
            >
              View Documentation →
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
