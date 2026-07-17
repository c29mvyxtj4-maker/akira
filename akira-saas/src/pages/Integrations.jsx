import { motion } from "framer-motion"
import { useState } from "react"
import { Plug } from "lucide-react"
import PageHeader from "@/components/layout/PageHeader"
import IntegrationsList from "@/components/marketplace/IntegrationsList"
import IntegrationSetup from "@/components/marketplace/IntegrationSetup"

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Integrations"
        subtitle="Connect with third-party applications and services"
        icon={Plug}
      />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-6">
          {["list", "setup"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab
                  ? "bg-brand-500 text-white"
                  : "bg-surface-2 text-text-2 hover:bg-surface-3"
              }`}
            >
              {tab === "list" ? "My Integrations" : "Setup"}
            </button>
          ))}
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "list" && <IntegrationsList />}
          {activeTab === "setup" && <IntegrationSetup />}
        </motion.div>
      </div>
    </div>
  )
}
