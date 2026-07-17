import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Download, Users, Heart } from "lucide-react"

export default function AppDetails() {
  const [liked, setLiked] = useState(false)

  const app = {
    name: "Advanced Analytics Platform",
    developer: "Analytics Pro",
    rating: 4.8,
    reviews: 342,
    downloads: 15200,
    description: "Comprehensive analytics and business intelligence platform",
    longDescription: "Get insights into your business with advanced analytics. Track KPIs, create custom dashboards, and export data to your favorite BI tools.",
    features: ["Custom Dashboards", "Real-time Analytics", "Export Capabilities", "API Access", "Email Reports", "Team Collaboration"],
    pricing: "$29/month",
    icon: "📊",
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="p-6 rounded-xl bg-surface-2 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{app.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-text-1">{app.name}</h1>
              <p className="text-text-4 text-sm mb-3">{app.developer}</p>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(app.rating) ? "text-amber-500 fill-current" : "text-text-4"}`} />
                    ))}
                  </div>
                  <span className="text-text-2 font-semibold">{app.rating}</span>
                  <span className="text-text-4 text-xs">({app.reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-4 text-text-4 text-sm border-l border-border pl-4">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {(app.downloads / 1000).toFixed(1)}k downloads
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-brand-500 mb-3">{app.pricing}</p>
            <div className="flex gap-2">
              <button onClick={() => setLiked(!liked)} className={`p-2 rounded-lg transition-all ${liked ? "bg-red-500/20 text-red-500" : "bg-surface-3 text-text-2 hover:bg-surface-4"}`}>
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all">
                Install
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="p-4 rounded-lg bg-surface-2 border border-border">
          <h3 className="text-text-1 font-bold mb-3">Overview</h3>
          <p className="text-text-4 text-sm mb-4">{app.longDescription}</p>

          <h4 className="text-text-1 font-semibold mb-2">Features</h4>
          <ul className="space-y-1">
            {app.features.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2 text-text-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="lg:col-span-2">
          <div className="p-4 rounded-lg bg-surface-2 border border-border">
            <h3 className="text-text-1 font-bold mb-4">Screenshots</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video rounded-lg bg-surface-3 flex items-center justify-center text-text-4">
                  Screenshot {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
