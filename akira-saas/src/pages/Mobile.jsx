import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'

export default function Mobile() {
  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Mobile Management"
        subtitle="iOS and Android app configuration"
        icon={Smartphone}
      />

      <div className="container max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <span className="text-3xl">📱</span>
          </div>
          <h2 className="text-2xl font-bold text-text-1">Mobile Module</h2>
          <p className="text-text-4 max-w-md text-center">
            Cross-device sync, mobile app settings, and push notifications
          </p>
        </motion.div>
      </div>
    </div>
  )
}
