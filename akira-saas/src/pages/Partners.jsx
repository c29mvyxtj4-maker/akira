import { motion } from "framer-motion"
import { Users2 } from "lucide-react"
import PageHeader from "@/components/layout/PageHeader"
import PartnerPortal from "@/components/marketplace/PartnerPortal"

export default function Partners() {
  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Partner Portal"
        subtitle="Manage partnerships, apps, and earnings"
        icon={Users2}
      />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <PartnerPortal />
        </motion.div>
      </div>
    </div>
  )
}
