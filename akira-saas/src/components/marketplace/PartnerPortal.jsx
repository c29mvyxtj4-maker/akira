import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react"

const mockPartnerStats = [
  { month: "Jan", revenue: 12000, apps: 3 },
  { month: "Feb", revenue: 15000, apps: 4 },
  { month: "Mar", revenue: 18000, apps: 5 },
  { month: "Apr", revenue: 21000, apps: 6 },
]

export default function PartnerPortal() {
  const [activeTab, setActiveTab] = useState("overview")

  const totalRevenue = mockPartnerStats.reduce((sum, s) => sum + s.revenue, 0)
  const totalApps = mockPartnerStats[mockPartnerStats.length - 1].apps
  const avgRevenue = Math.round(totalRevenue / mockPartnerStats.length)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-2xl font-black text-green-500 mb-1">${(totalRevenue / 1000).toFixed(0)}k</p>
          <p className="text-text-4 text-xs">All time</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-blue-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Published Apps</p>
          <p className="text-2xl font-black text-blue-500 mb-1">{totalApps}</p>
          <p className="text-text-4 text-xs">In marketplace</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-purple-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Monthly Avg</p>
          <p className="text-2xl font-black text-purple-500 mb-1">${(avgRevenue / 1000).toFixed(1)}k</p>
          <p className="text-text-4 text-xs">Revenue</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-amber-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Growth</p>
          <p className="text-2xl font-black text-amber-500 mb-1">+75%</p>
          <p className="text-text-4 text-xs">YoY</p>
        </motion.div>
      </div>

      <div className="flex gap-2">
        {["overview", "payouts", "analytics", "submissions"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-brand-500 text-white" : "bg-surface-2 text-text-2 hover:bg-surface-3"}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-surface-2 border border-border">
            <h3 className="text-text-1 font-bold mb-4">Revenue Trend</h3>
            <div className="space-y-2">
              {mockPartnerStats.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-text-3">{s.month}</span>
                  <div className="flex-1 mx-4 h-2 bg-surface-3 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.revenue / 25000) * 100}%` }} transition={{ duration: 0.6, delay: idx * 0.1 }} className="h-full bg-green-500 rounded-full" />
                  </div>
                  <span className="text-green-500 font-semibold">${(s.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-2 border border-border">
            <h3 className="text-text-1 font-bold mb-4">Your Apps</h3>
            <div className="space-y-2">
              {[
                { name: "AI Assistant Pro", installs: 2500, revenue: 8000 },
                { name: "Analytics Suite", installs: 1800, revenue: 12000 },
                { name: "Workflow Automation", installs: 3200, revenue: 4500 },
              ].map((app, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-lg bg-surface-3 flex items-center justify-between">
                  <div>
                    <p className="text-text-2 font-semibold text-sm">{app.name}</p>
                    <p className="text-text-4 text-xs">{app.installs} installs</p>
                  </div>
                  <p className="text-green-500 font-bold">${(app.revenue / 1000).toFixed(0)}k</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "payouts" && (
        <div className="p-4 rounded-lg bg-surface-2 border border-border">
          <p className="text-text-2 mb-4">Payout History</p>
          <div className="space-y-2">
            {[
              { date: "2026-07-15", amount: 5200, status: "Paid" },
              { date: "2026-06-15", amount: 4800, status: "Paid" },
              { date: "2026-05-15", amount: 4500, status: "Paid" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-3">
                <div>
                  <p className="text-text-2 font-semibold text-sm">{p.date}</p>
                  <span className="px-2 py-1 rounded text-xs font-semibold text-green-500 bg-green-500/10">{p.status}</span>
                </div>
                <p className="text-green-500 font-bold">${p.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
