import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud, CloudOff, Download, Upload, Smartphone, Check,
  AlertCircle, TrendingUp
} from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Mobile Sync
 * Offline sync status and management for mobile devices
 */
export default function MobileSync() {
  const [devices, setDevices] = useState([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      type: 'iOS',
      status: 'online',
      lastSync: '2 minutes ago',
      syncProgress: 100,
      pendingItems: 0,
      storage: { used: 2.4, total: 8 }
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      type: 'Android',
      status: 'offline',
      lastSync: '2 hours ago',
      syncProgress: 75,
      pendingItems: 12,
      storage: { used: 4.1, total: 12 }
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'iOS',
      status: 'syncing',
      lastSync: 'in progress',
      syncProgress: 45,
      pendingItems: 8,
      storage: { used: 1.8, total: 16 }
    }
  ])

  const [autoSync, setAutoSync] = useState(true)
  const [wifiOnly, setWifiOnly] = useState(false)

  const handleSync = (deviceId) => {
    // Simulate sync
    const updated = devices.map(d =>
      d.id === deviceId
        ? { ...d, status: 'syncing', syncProgress: 0 }
        : d
    )
    setDevices(updated)

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        clearInterval(interval)
        setDevices(prev => prev.map(d =>
          d.id === deviceId
            ? { ...d, status: 'online', syncProgress: 100 }
            : d
        ))
      } else {
        setDevices(prev => prev.map(d =>
          d.id === deviceId
            ? { ...d, syncProgress: progress }
            : d
        ))
      }
    }, 500)
  }

  const getStatusColor = (status) => {
    if (status === 'online') return 'text-status-success'
    if (status === 'syncing') return 'text-status-info'
    return 'text-status-warning'
  }

  const getStatusIcon = (status) => {
    if (status === 'online') return Cloud
    if (status === 'syncing') return Download
    return CloudOff
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">Mobile Sync</h2>
        <p className="text-sm text-text-4 mt-1">Manage offline sync for your mobile devices</p>
      </div>

      {/* Sync Settings */}
      <Card padding="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-1">Auto Sync</h3>
              <p className="text-sm text-text-4 mt-1">Automatically sync changes across devices</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-1">WiFi Only</h3>
              <p className="text-sm text-text-4 mt-1">Only sync over WiFi connections</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wifiOnly}
                onChange={(e) => setWifiOnly(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Sync Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="lg">
          <p className="text-text-4 text-xs font-semibold uppercase mb-2">Total Devices</p>
          <p className="text-3xl font-bold text-text-1">{devices.length}</p>
          <p className="text-xs text-text-4 mt-2">
            {devices.filter(d => d.status === 'online').length} online
          </p>
        </Card>

        <Card padding="lg">
          <p className="text-text-4 text-xs font-semibold uppercase mb-2">Pending Items</p>
          <p className="text-3xl font-bold text-text-1">
            {devices.reduce((sum, d) => sum + d.pendingItems, 0)}
          </p>
          <p className="text-xs text-text-4 mt-2">Waiting to sync</p>
        </Card>

        <Card padding="lg">
          <p className="text-text-4 text-xs font-semibold uppercase mb-2">Storage Used</p>
          <p className="text-3xl font-bold text-text-1">
            {(devices.reduce((sum, d) => sum + d.storage.used, 0)).toFixed(1)}GB
          </p>
          <p className="text-xs text-text-4 mt-2">
            of {devices.reduce((sum, d) => sum + d.storage.total, 0)}GB total
          </p>
        </Card>
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-1">Connected Devices</h3>

        {devices.map((device, index) => {
          const StatusIcon = getStatusIcon(device.status)

          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="lg" hover>
                <div className="space-y-4">
                  {/* Device Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone size={24} className="text-brand-500" />
                      <div>
                        <h3 className="font-semibold text-text-1">{device.name}</h3>
                        <p className="text-xs text-text-4 mt-1">{device.type} Device</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={getStatusColor(device.status)} />
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        device.status === 'online'
                          ? 'bg-status-success/10 text-status-success'
                          : device.status === 'syncing'
                          ? 'bg-status-info/10 text-status-info'
                          : 'bg-status-warning/10 text-status-warning'
                      }`}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Sync Progress */}
                  {device.syncProgress < 100 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-4">Sync Progress</span>
                        <span className="text-xs font-semibold text-text-1">{Math.round(device.syncProgress)}%</span>
                      </div>
                      <div className="w-full bg-surface-2 rounded-full h-2">
                        <motion.div
                          className="bg-brand-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${device.syncProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Storage Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-4">Storage</span>
                      <span className="text-xs font-semibold text-text-1">
                        {device.storage.used}GB / {device.storage.total}GB
                      </span>
                    </div>
                    <div className="w-full bg-surface-2 rounded-full h-2">
                      <div
                        className="bg-status-info h-2 rounded-full"
                        style={{
                          width: `${(device.storage.used / device.storage.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-text-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      {device.pendingItems > 0 && (
                        <>
                          <AlertCircle size={12} />
                          <span>{device.pendingItems} pending items</span>
                        </>
                      )}
                      {device.pendingItems === 0 && (
                        <>
                          <Check size={12} className="text-status-success" />
                          <span>All synced</span>
                        </>
                      )}
                    </div>
                    <span>Last sync: {device.lastSync}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(device.id)}
                      disabled={device.status === 'syncing'}
                      className="flex-1 px-3 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload size={12} />
                      Sync Now
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Sync Info */}
      <Card padding="lg" className="bg-status-info/10 border border-status-info/20">
        <div className="flex gap-3">
          <TrendingUp size={20} className="text-status-info flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text-1 mb-1">About Mobile Sync</h3>
            <p className="text-sm text-text-4">
              Mobile devices automatically sync data when connected and WiFi is available. You can manually trigger a sync at any time or configure sync settings to your preference.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
