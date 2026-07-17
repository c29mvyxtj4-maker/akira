import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Download, Star, Users } from "lucide-react"

const mockApps = [
  { id: 1, name: "AI Assistant Pro", developer: "AKIRA Labs", rating: 4.8, downloads: 2500, icon: "🤖", category: "AI", price: "Free" },
  { id: 2, name: "Advanced Analytics", developer: "Data Insights Inc", rating: 4.7, downloads: 1800, icon: "📊", category: "Analytics", price: "$29/mo" },
  { id: 3, name: "Automated Workflows", developer: "Flow Systems", rating: 4.9, downloads: 3200, icon: "⚙️", category: "Automation", price: "Free" },
  { id: 4, name: "Team Collaboration", developer: "Sync Works", rating: 4.6, downloads: 1200, icon: "👥", category: "Team", price: "$19/mo" },
  { id: 5, name: "Social Media Manager", developer: "Social Labs", rating: 4.5, downloads: 890, icon: "📱", category: "Marketing", price: "Free" },
  { id: 6, name: "Customer Success", developer: "CS Pro", rating: 4.8, downloads: 2100, icon: "😊", category: "Support", price: "$49/mo" },
]

export default function MarketplaceStore() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "AI", "Analytics", "Automation", "Team", "Marketing", "Support"]

  const filtered = mockApps.filter(app => {
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === "all" || app.category === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-4" />
        <input type="text" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-2 border border-border text-text-1 placeholder-text-4 focus:border-brand-500/50 focus:outline-none" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-brand-500 text-white" : "bg-surface-2 text-text-2 hover:bg-surface-3"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app, idx) => (
          <motion.div key={app.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="p-4 rounded-lg bg-surface-2 border border-border hover:border-brand-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{app.icon}</div>
              <span className="px-2 py-1 rounded-md bg-surface-3 text-text-3 text-xs font-semibold">{app.price}</span>
            </div>

            <h3 className="text-text-1 font-semibold mb-1">{app.name}</h3>
            <p className="text-text-4 text-xs mb-3">{app.developer}</p>

            <div className="flex items-center justify-between mb-3 pb-3 border-t border-border pt-3">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-current" />
                <span className="text-text-2 text-xs font-semibold">{app.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-text-4 text-xs">
                <Download className="w-3 h-3" />
                {(app.downloads / 1000).toFixed(1)}k
              </div>
            </div>

            <button className="w-full px-3 py-2 rounded-lg bg-brand-500/10 text-brand-500 font-semibold text-sm hover:bg-brand-500/20 transition-all">
              Install
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
