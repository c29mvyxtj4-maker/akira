import { useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Watch, Home, Wifi } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MobileSync from '@/components/mobile/MobileSync'
import AppleWatchConfig from '@/components/mobile/AppleWatchConfig'
import WearOSConfig from '@/components/mobile/WearOSConfig'
import SmartHomeIntegration from '@/components/mobile/SmartHomeIntegration'

/**
 * Mobile Page
 * Mobile OS configuration, sync, and integrations
 * Phase 6: Mobile OS
 */
export default function Mobile() {
  const [activeTab, setActiveTab] = useState('sync')

  const tabs = [
    { id: 'sync', label: 'Sync', icon: Wifi },
    { id: 'apple-watch', label: 'Apple Watch', icon: Watch },
    { id: 'wearos', label: 'WearOS', icon: Watch },
    { id: 'smart-home', label: 'Smart Home', icon: Home },
  ]

  const tabContent = {
    sync: <MobileSync />,
    'apple-watch': <AppleWatchConfig />,
    wearos: <WearOSConfig />,
    'smart-home': <SmartHomeIntegration />,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <PageHeader
          title="Mobile OS"
          description="Configure mobile sync, wearables, and smart home integrations"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4 border-b border-border overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'text-brand-500 border-b-2 border-brand-500'
                  : 'text-text-4 hover:text-text-2 border-b-2 border-transparent'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </div>
    </div>
  )
}
