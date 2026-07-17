import { useState } from 'react'
import { motion } from 'framer-motion'
import { Watch, Plus, Trash2, ToggleRight, Info, Zap } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Apple Watch Config
 * Configure complications and widgets for Apple Watch
 */
export default function AppleWatchConfig() {
  const [complications, setComplications] = useState([
    { id: '1', name: 'Revenue Today', type: 'circular', data: '$4,250', color: 'green', enabled: true },
    { id: '2', name: 'Tasks Due', type: 'linear', data: '7 tasks', color: 'blue', enabled: true },
    { id: '3', name: 'Invoices Pending', type: 'circular', data: '3', color: 'orange', enabled: false },
  ])

  const [availableComplications] = useState([
    { id: 'revenue', name: 'Revenue', description: 'Daily revenue total' },
    { id: 'tasks', name: 'Tasks Due', description: 'Number of due tasks' },
    { id: 'invoices', name: 'Invoices Pending', description: 'Pending invoices count' },
    { id: 'clients', name: 'New Clients', description: 'This month\' s new clients' },
    { id: 'projects', name: 'Active Projects', description: 'Currently active projects' },
    { id: 'time-tracked', name: 'Time Tracked', description: 'Hours tracked today' },
  ])

  const COMPLICATION_TYPES = [
    { id: 'circular', label: 'Circular', description: 'Gauge-style circular display' },
    { id: 'linear', label: 'Linear', description: 'Progress bar display' },
    { id: 'modular', label: 'Modular', description: 'Text-based modular display' },
    { id: 'graphic', label: 'Graphic', description: 'Rich graphical display' },
  ]

  const toggleComplication = (id) => {
    setComplications(complications.map(c =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ))
  }

  const removeComplication = (id) => {
    setComplications(complications.filter(c => c.id !== id))
  }

  const addComplication = (compId) => {
    const available = availableComplications.find(c => c.id === compId)
    if (!available) return

    const newComplication = {
      id: `comp-${Date.now()}`,
      name: available.name,
      type: 'circular',
      data: '--',
      color: 'blue',
      enabled: true,
    }
    setComplications([...complications, newComplication])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">Apple Watch Configuration</h2>
        <p className="text-sm text-text-4 mt-1">Configure complications and widgets for Apple Watch</p>
      </div>

      {/* Watch Face Preview */}
      <Card padding="lg">
        <h3 className="font-semibold text-text-1 mb-4">Watch Face Preview</h3>
        <div className="flex items-center justify-center mb-6">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-surface-2 to-surface-3 border-4 border-surface-3 shadow-lg flex items-center justify-center relative overflow-hidden">
            {/* Watch face background */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center clock */}
              <div className="text-center">
                <p className="text-5xl font-bold text-text-1">12:45</p>
                <p className="text-xs text-text-4 mt-2">AKIRA</p>
              </div>

              {/* Complications around the dial */}
              {complications.filter(c => c.enabled).slice(0, 4).map((comp, i) => {
                const angle = (i * 90) * Math.PI / 180
                const x = Math.cos(angle - Math.PI / 2) * 90
                const y = Math.sin(angle - Math.PI / 2) * 90

                return (
                  <motion.div
                    key={comp.id}
                    className="absolute w-20 h-20 rounded-full bg-surface-2 border border-border flex items-center justify-center text-center p-2"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <div className="text-center">
                      <p className="text-xs font-bold text-text-1">{comp.data}</p>
                      <p className="text-xs text-text-4 truncate">{comp.name}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Complications */}
        <div className="space-y-2">
          <h3 className="font-semibold text-text-1 flex items-center gap-2">
            <Plus size={18} />
            Available Complications
          </h3>

          <div className="space-y-2">
            {availableComplications.map(comp => (
              <button
                key={comp.id}
                onClick={() => addComplication(comp.id)}
                disabled={complications.some(c => c.name === comp.name)}
                className="w-full px-3 py-2 text-left text-xs rounded-lg bg-surface-2 hover:bg-surface-3 border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-text-1">{comp.name}</p>
                <p className="text-text-4 text-xs">{comp.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Complications */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-text-1">Active Complications ({complications.filter(c => c.enabled).length})</h3>

          {complications.length === 0 ? (
            <Card padding="lg" className="text-center py-8">
              <Watch size={32} className="text-text-4 mx-auto mb-2 opacity-50" />
              <p className="text-text-4 text-sm">No complications added yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {complications.map((comp, i) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card padding="lg" className={!comp.enabled ? 'opacity-60' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-text-1">{comp.name}</h4>
                          <span className="text-xs px-2 py-1 bg-surface-2 rounded font-medium text-text-3">
                            {comp.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-4">
                          <span>Data: {comp.data}</span>
                          <span>Color: {comp.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleComplication(comp.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            comp.enabled
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-surface-2 text-text-4'
                          }`}
                        >
                          <ToggleRight size={18} />
                        </button>
                        <button
                          onClick={() => removeComplication(comp.id)}
                          className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-4 hover:text-status-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complication Types */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Info size={18} className="text-brand-500" />
          Complication Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLICATION_TYPES.map(type => (
            <div key={type.id}>
              <p className="font-medium text-text-1 text-sm">{type.label}</p>
              <p className="text-xs text-text-4">{type.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sync Status */}
      <Card padding="lg" className="flex items-center gap-3 bg-status-success/10 border border-status-success/20">
        <Zap size={20} className="text-status-success flex-shrink-0" />
        <div>
          <p className="font-semibold text-text-1 text-sm">Synced to Apple Watch</p>
          <p className="text-xs text-text-4">Configuration automatically updates across your devices</p>
        </div>
      </Card>
    </div>
  )
}
