import { useState } from 'react'
import { motion } from 'framer-motion'
import { Watch, Plus, Trash2, Toggle2, Smartphone, Check } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * WearOS Config
 * Configure tiles and widgets for Android Wear / WearOS
 */
export default function WearOSConfig() {
  const [tiles, setTiles] = useState([
    { id: '1', name: 'Daily Revenue', type: 'indicator', enabled: true },
    { id: '2', name: 'Urgent Tasks', type: 'list', enabled: true },
    { id: '3', name: 'Team Status', type: 'indicator', enabled: false },
  ])

  const [availableTiles] = useState([
    { id: 'revenue', name: 'Daily Revenue', description: 'Track revenue in real-time' },
    { id: 'tasks', name: 'Urgent Tasks', description: 'See tasks that need action' },
    { id: 'team', name: 'Team Status', description: 'View team member status' },
    { id: 'invoices', name: 'Invoice Status', description: 'Track invoice payments' },
    { id: 'alerts', name: 'Alerts', description: 'Critical notifications' },
    { id: 'quick-actions', name: 'Quick Actions', description: 'Common actions' },
  ])

  const toggleTile = (id) => {
    setTiles(tiles.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ))
  }

  const removeTile = (id) => {
    setTiles(tiles.filter(t => t.id !== id))
  }

  const addTile = (tileId) => {
    const available = availableTiles.find(t => t.id === tileId)
    if (!available) return

    const newTile = {
      id: `tile-${Date.now()}`,
      name: available.name,
      type: 'indicator',
      enabled: true,
    }
    setTiles([...tiles, newTile])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">WearOS Configuration</h2>
        <p className="text-sm text-text-4 mt-1">Configure tiles and widgets for Android Wear devices</p>
      </div>

      {/* Device Info */}
      <Card padding="lg" className="flex items-start gap-4 bg-surface-2">
        <Smartphone size={24} className="text-brand-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-text-1">Connected Wear Devices</h3>
          <p className="text-sm text-text-4 mt-1">
            You have 2 WearOS devices connected. Tiles sync automatically when updated.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="px-2 py-1 bg-surface-3 rounded text-xs font-medium text-text-2">
              Samsung Galaxy Watch
            </span>
            <span className="px-2 py-1 bg-surface-3 rounded text-xs font-medium text-text-2">
              Wear OS 4.0
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Tiles */}
        <div className="space-y-2">
          <h3 className="font-semibold text-text-1 flex items-center gap-2">
            <Plus size={18} />
            Available Tiles
          </h3>

          <div className="space-y-2">
            {availableTiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => addTile(tile.id)}
                disabled={tiles.some(t => t.name === tile.name)}
                className="w-full px-3 py-2 text-left text-xs rounded-lg bg-surface-2 hover:bg-surface-3 border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-text-1">{tile.name}</p>
                <p className="text-text-4 text-xs">{tile.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Tiles */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-text-1">Active Tiles ({tiles.filter(t => t.enabled).length})</h3>

          {tiles.length === 0 ? (
            <Card padding="lg" className="text-center py-8">
              <Watch size={32} className="text-text-4 mx-auto mb-2 opacity-50" />
              <p className="text-text-4 text-sm">No tiles added yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {tiles.map((tile, i) => (
                <motion.div
                  key={tile.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card padding="lg" className={!tile.enabled ? 'opacity-60' : ''}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text-1">{tile.name}</h4>
                          <span className="text-xs px-2 py-1 bg-surface-2 rounded font-medium text-text-3">
                            {tile.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTile(tile.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            tile.enabled
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-surface-2 text-text-4'
                          }`}
                        >
                          <Toggle2 size={18} />
                        </button>
                        <button
                          onClick={() => removeTile(tile.id)}
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

      {/* Tile Types Info */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <h3 className="font-semibold text-text-1 mb-4">Tile Types</h3>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-text-1 text-sm">Indicator Tile</p>
            <p className="text-xs text-text-4">Single metric display with current value</p>
          </div>
          <div>
            <p className="font-medium text-text-1 text-sm">List Tile</p>
            <p className="text-xs text-text-4">Display multiple items in a scrollable list</p>
          </div>
          <div>
            <p className="font-medium text-text-1 text-sm">Complication Tile</p>
            <p className="text-xs text-text-4">Native WearOS complication format</p>
          </div>
          <div>
            <p className="font-medium text-text-1 text-sm">Action Tile</p>
            <p className="text-xs text-text-4">Quick access to common actions</p>
          </div>
        </div>
      </Card>

      {/* Sync Status */}
      <Card padding="lg" className="flex items-center gap-3 bg-status-success/10 border border-status-success/20">
        <Check size={20} className="text-status-success flex-shrink-0" />
        <div>
          <p className="font-semibold text-text-1 text-sm">Synced to WearOS Devices</p>
          <p className="text-xs text-text-4">All changes are automatically pushed to your connected devices</p>
        </div>
      </Card>
    </div>
  )
}
