import { motion } from 'framer-motion'
import { Download, Share2, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const BI_PLATFORMS = [
  {
    id: 'tableau',
    name: 'Tableau',
    description: 'Connect via Tableau Server connector',
    icon: '📊',
    connected: true,
    lastSync: '30 minutes ago',
    fields: ['Revenue', 'Churn Rate', 'CLV', 'Customer Growth', 'Engagement'],
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    description: 'Export data to Power BI Premium',
    icon: '📈',
    connected: true,
    lastSync: '2 hours ago',
    fields: ['Financial Metrics', 'KPIs', 'Forecasts', 'Trends'],
  },
  {
    id: 'looker',
    name: 'Looker',
    description: 'Stream data to Looker Studio',
    icon: '📉',
    connected: false,
    fields: ['Custom Dimensions', 'Aggregations', 'Filters'],
  },
  {
    id: 'superset',
    name: 'Apache Superset',
    description: 'Self-hosted BI dashboards',
    icon: '🎯',
    connected: false,
    fields: ['Real-time Analytics', 'Custom Queries'],
  },
]

const EXPORT_OPTIONS = [
  {
    id: 'csv',
    label: 'CSV Export',
    description: 'Download as comma-separated values',
    format: 'CSV',
    frequency: 'On demand',
  },
  {
    id: 'parquet',
    label: 'Parquet Format',
    description: 'Optimized columnar format for analytics',
    format: 'Parquet',
    frequency: 'On demand',
  },
  {
    id: 'scheduled_export',
    label: 'Scheduled Export',
    description: 'Automatic daily/weekly exports',
    format: 'Multiple',
    frequency: 'Recurring',
  },
  {
    id: 'api_streaming',
    label: 'API Streaming',
    description: 'Real-time data via REST API',
    format: 'JSON',
    frequency: 'Real-time',
  },
]

function PlatformCard({ platform, idx }) {
  const [isExpanding, setIsExpanding] = useState(false)

  return (
    <motion.div
      key={platform.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="p-4 rounded-lg bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{platform.icon}</div>
          <div>
            <h4 className="text-text-1 font-semibold">{platform.name}</h4>
            <p className="text-text-4 text-xs">{platform.description}</p>
          </div>
        </div>
        {platform.connected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <Check className="w-3 h-3 text-green-500" />
            <span className="text-green-500 text-xs font-semibold">Connected</span>
          </motion.div>
        )}
      </div>

      {platform.connected && (
        <>
          <div className="text-xs text-text-4 mb-3">
            Last sync: {platform.lastSync}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {platform.fields.map(field => (
              <span key={field} className="px-2 py-1 rounded-md bg-surface-3 border border-border text-text-3 text-xs">
                {field}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            platform.connected
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : 'bg-surface-3 border border-border text-text-2 hover:border-brand-500/30'
          }`}
        >
          {platform.connected ? 'Configure' : 'Connect'}
        </button>
        {platform.connected && (
          <button className="px-3 py-2 rounded-lg text-sm font-medium bg-surface-3 border border-border text-text-2 hover:border-brand-500/30 transition-all flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Sync
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function BIExportConfig() {
  const [activeTab, setActiveTab] = useState('platforms')
  const connectedCount = BI_PLATFORMS.filter(p => p.connected).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'platforms'
              ? 'text-brand-500 border-brand-500'
              : 'text-text-4 border-transparent hover:text-text-2'
          }`}
        >
          BI Platforms
        </button>
        <button
          onClick={() => setActiveTab('exports')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'exports'
              ? 'text-brand-500 border-brand-500'
              : 'text-text-4 border-transparent hover:text-text-2'
          }`}
        >
          Export Options
        </button>
      </div>

      {/* BI Platforms Tab */}
      {activeTab === 'platforms' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Connection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all"
            >
              <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Connected Platforms</p>
              <p className="text-3xl font-black text-text-1 mb-1">{connectedCount}</p>
              <p className="text-text-4 text-xs">of {BI_PLATFORMS.length} available</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-surface-2 border border-border hover:border-blue-500/30 transition-all"
            >
              <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Total Data Exported</p>
              <p className="text-3xl font-black text-text-1 mb-1">2.4GB</p>
              <p className="text-text-4 text-xs">Last 30 days</p>
            </motion.div>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BI_PLATFORMS.map((platform, idx) => (
              <PlatformCard key={platform.id} platform={platform} idx={idx} />
            ))}
          </div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
          >
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold text-sm mb-1">Data Sync Information</p>
                <p className="text-blue-200/80 text-xs">
                  Connected platforms sync data automatically. Each platform has its own schedule and data retention policy.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Export Options Tab */}
      {activeTab === 'exports' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPORT_OPTIONS.map((option, idx) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg bg-surface-2 border border-border hover:border-brand-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-text-1 font-semibold">{option.label}</h4>
                    <p className="text-text-4 text-xs">{option.description}</p>
                  </div>
                  <Download className="w-5 h-5 text-text-3 flex-shrink-0" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-4">Format:</span>
                    <span className="text-text-2 font-semibold">{option.format}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-4">Frequency:</span>
                    <span className="text-text-2 font-semibold">{option.frequency}</span>
                  </div>
                </div>

                <button className="w-full px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-all text-sm font-medium">
                  {option.id === 'csv' ? 'Download Now' : 'Configure'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Advanced Options */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-surface-2 border border-border"
          >
            <h4 className="text-text-1 font-semibold mb-4">Advanced Export Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="text-text-2 text-sm font-medium mb-2 block">Data Retention</label>
                <select className="w-full px-3 py-2 rounded-lg bg-surface-3 border border-border text-text-2 text-sm">
                  <option>Keep last 12 months</option>
                  <option>Keep last 24 months</option>
                  <option>Keep all data</option>
                </select>
              </div>
              <div>
                <label className="text-text-2 text-sm font-medium mb-2 block">Compression</label>
                <select className="w-full px-3 py-2 rounded-lg bg-surface-3 border border-border text-text-2 text-sm">
                  <option>GZIP (recommended)</option>
                  <option>ZIP</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
