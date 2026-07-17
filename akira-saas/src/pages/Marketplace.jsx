import { motion } from "framer-motion"
import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import PageHeader from "@/components/layout/PageHeader"
import MarketplaceStore from "@/components/marketplace/MarketplaceStore"
import AppDetails from "@/components/marketplace/AppDetails"
import ReviewsPanel from "@/components/marketplace/ReviewsPanel"

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("browse")

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader
        title="Marketplace"
        subtitle="Discover and install apps and integrations"
        icon={ShoppingCart}
      />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-6">
          {[
            { id: "browse", label: "Browse Apps" },
            { id: "details", label: "App Details" },
            { id: "reviews", label: "Reviews" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-brand-500 text-white"
                  : "bg-surface-2 text-text-2 hover:bg-surface-3"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "browse" && <MarketplaceStore />}
          {activeTab === "details" && <AppDetails />}
          {activeTab === "reviews" && <ReviewsPanel />}
        </motion.div>
      </div>
    </div>
  )
}
