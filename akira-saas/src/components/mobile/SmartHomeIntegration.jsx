import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Home, ToggleRight, Check, AlertCircle, Plus, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Smart Home Integration
 * Configure Alexa, Google Home, and other smart home integrations
 */
export default function SmartHomeIntegration() {
  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      name: 'Amazon Alexa',
      status: 'connected',
      enabled: true,
      devices: ['Alexa Echo', 'Alexa Dot'],
    },
    {
      id: '2',
      name: 'Google Home',
      status: 'connected',
      enabled: true,
      devices: ['Google Home Mini', 'Google Nest Hub'],
    },
    {
      id: '3',
      name: 'Apple Siri',
      status: 'disconnected',
      enabled: false,
      devices: [],
    },
  ])

  const [skillConfig, setSkillConfig] = useState({
    enableVoiceQueries: true,
    enableTaskCreation: true,
    enableTimeTracking: false,
    enableReporting: true,
  })

  const AVAILABLE_PLATFORMS = [
    { id: 'alexa', name: 'Amazon Alexa', icon: '🔊' },
    { id: 'google', name: 'Google Home', icon: '🔊' },
    { id: 'siri', name: 'Apple Siri', icon: '🎤' },
  ]

  const toggleIntegration = (id) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, enabled: !i.enabled } : i
    ))
  }

  const toggleSkillFeature = (feature) => {
    setSkillConfig({
      ...skillConfig,
      [feature]: !skillConfig[feature],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">Smart Home Integration</h2>
        <p className="text-sm text-text-4 mt-1">Connect to Alexa, Google Home, and other smart assistants</p>
      </div>

      {/* Connected Platforms */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-1">Connected Platforms</h3>

        {integrations.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card padding="lg" hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-text-1">{integration.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      integration.status === 'connected'
                        ? 'bg-status-success/10 text-status-success'
                        : 'bg-status-warning/10 text-status-warning'
                    }`}>
                      {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                    <span className="text-xs text-text-4">
                      {integration.devices.length} devices
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    integration.enabled
                      ? 'bg-status-success/10 text-status-success'
                      : 'bg-surface-2 text-text-4'
                  }`}
                >
                  <ToggleRight size={20} />
                </button>
              </div>

              {/* Devices */}
              {integration.devices.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-4 mb-2 uppercase">Devices</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.devices.map((device, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-surface-2 rounded text-text-2"
                      >
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {integration.status === 'disconnected' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium">
                    Connect Now
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add New Integration */}
      <Card padding="lg">
        <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Plus size={18} />
          Add New Integration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_PLATFORMS.map(platform => {
            const isConnected = integrations.some(
              i => i.name.toLowerCase().includes(platform.name.toLowerCase().split(' ')[0])
            )

            return (
              <button
                key={platform.id}
                disabled={isConnected}
                className={`p-4 rounded-lg border transition-all text-center ${
                  isConnected
                    ? 'bg-surface-2 border-border opacity-50 cursor-not-allowed'
                    : 'bg-surface-2 border-border hover:border-brand-500'
                }`}
              >
                <div className="text-3xl mb-2">{platform.icon}</div>
                <p className="font-medium text-text-1 text-sm">{platform.name}</p>
                {isConnected && (
                  <p className="text-xs text-text-4 mt-2">Already connected</p>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Skill Configuration */}
      <Card padding="lg">
        <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-brand-500" />
          AKIRA Skill Configuration
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-semibold text-text-1">Voice Queries</h4>
              <p className="text-sm text-text-4 mt-1">Ask about revenue, tasks, and client info</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={skillConfig.enableVoiceQueries}
                onChange={(e) => toggleSkillFeature('enableVoiceQueries')}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-semibold text-text-1">Create Tasks</h4>
              <p className="text-sm text-text-4 mt-1">Create new tasks by voice command</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={skillConfig.enableTaskCreation}
                onChange={(e) => toggleSkillFeature('enableTaskCreation')}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-semibold text-text-1">Time Tracking</h4>
              <p className="text-sm text-text-4 mt-1">Start and stop time entries by voice</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={skillConfig.enableTimeTracking}
                onChange={(e) => toggleSkillFeature('enableTimeTracking')}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-1">Generate Reports</h4>
              <p className="text-sm text-text-4 mt-1">Request reports by voice command</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={skillConfig.enableReporting}
                onChange={(e) => toggleSkillFeature('enableReporting')}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium text-sm">
            Save Configuration
          </button>
          <button className="px-6 py-2 bg-surface-3 text-text-2 rounded-lg hover:bg-surface-4 transition-colors font-medium text-sm">
            Test Skill
          </button>
        </div>
      </Card>

      {/* Voice Commands Reference */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <h3 className="font-semibold text-text-1 mb-4">Voice Command Examples</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-text-1">"Alexa, ask AKIRA for today's revenue"</p>
            <p className="text-text-4 text-xs">Get current day revenue total</p>
          </div>
          <div>
            <p className="font-medium text-text-1">"Hey Google, ask AKIRA to create a task: Call John"</p>
            <p className="text-text-4 text-xs">Create a new task with voice</p>
          </div>
          <div>
            <p className="font-medium text-text-1">"Alexa, ask AKIRA how many invoices are overdue"</p>
            <p className="text-text-4 text-xs">Get overdue invoice count</p>
          </div>
          <div>
            <p className="font-medium text-text-1">"Hey Google, ask AKIRA for my team status"</p>
            <p className="text-text-4 text-xs">Get current team member status</p>
          </div>
        </div>
      </Card>

      {/* Status Alert */}
      <Card padding="lg" className="flex items-start gap-3 bg-status-success/10 border border-status-success/20">
        <Check size={20} className="text-status-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-text-1">All Integrations Active</p>
          <p className="text-sm text-text-4 mt-1">
            Your smart home devices can access AKIRA data securely. Voice commands are encrypted end-to-end.
          </p>
        </div>
      </Card>
    </div>
  )
}
