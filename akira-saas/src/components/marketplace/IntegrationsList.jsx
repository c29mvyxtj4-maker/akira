import { useState } from "react"
import { motion } from "framer-motion"
import { Plug, CheckCircle, AlertCircle } from "lucide-react"

const mockIntegrations = [
  {
    id: 1,
    name: "Slack",
    description: "Receive notifications and reminders in Slack",
    icon: "💬",
    status: "Connected",
    features: ["Notifications", "Commands", "Reminders"],
    category: "Communication",
    connectedAt: "2026-07-01",
  },
  {
    id: 2,
    name: "Google Workspace",
    description: "Sync contacts, calendars, and drive files",
    icon: "📧",
    status: "Connected",
    features: ["Contacts", "Calendar", "Drive"],
    category: "Productivity",
    connectedAt: "2026-06-15",
  },
  {
    id: 3,
    name: "Stripe",
    description: "Accept payments and manage subscriptions",
    icon: "💳",
    status: "Configured",
    features: ["Payments", "Invoicing", "Subscriptions"],
    category: "Payments",
    connectedAt: "2026-05-20",
  },
  {
    id: 4,
    name: "GitHub",
    description: "Connect repositories and manage code",
    icon: "🐙",
    status: "Disconnected",
    features: ["Repos", "Issues", "Webhooks"],
    category: "Development",
    connectedAt: null,
  },
  {
    id: 5,
    name: "Microsoft Teams",
    description: "Collaborate with your team on Teams",
    icon: "👥",
    status: "Disconnected",
    features: ["Messages", "Channels", "Calls"],
    category: "Communication",
    connectedAt: null,
  },
  {
    id: 6,
    name: "Zapier",
    description: "Automate workflows with 5000+ apps",
    icon: "⚡",
    status: "Connected",
    features: ["Automation", "Workflows", "Webhooks"],
    category: "Automation",
    connectedAt: "2026-04-10",
  },
]

function StatusBadge({ status }) {
  const colors = {
    Connected: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" },
    Configured: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
    Disconnected: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" },
  }
  const color = colors[status]
  return (
    <div className="px-2 py-1 rounded-md text-xs font-semibold inline-block" style={{ background: color.bg, color: color.text }}>
      {status}
    </div>
  )
}

export default function IntegrationsList() {
  const [filter, setFilter] = useState("all")

  const connected = mockIntegrations.filter(i => i.status === "Connected").length
  const configured = mockIntegrations.filter(i => i.status === "Configured").length

  const filtered = mockIntegrations.filter(i => {
    if (filter === "all") return true
    if (filter === "connected") return i.status === "Connected"
    if (filter === "configured") return i.status === "Configured"
    if (filter === "disconnected") return i.status === "Disconnected"
    return true
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-green-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Connected</p>
          <p className="text-3xl font-black text-green-500 mb-1">{connected}</p>
          <p className="text-text-4 text-xs">Active integrations</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-amber-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Configured</p>
          <p className="text-3xl font-black text-amber-500 mb-1">{configured}</p>
          <p className="text-text-4 text-xs">Awaiting activation</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-2 border border-border hover:border-blue-500/30 transition-all">
          <p className="text-text-3 text-xs font-semibold uppercase tracking-wider mb-2">Available</p>
          <p className="text-3xl font-black text-blue-500 mb-1">{mockIntegrations.length}</p>
          <p className="text-text-4 text-xs">Total integrations</p>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "connected", "configured", "disconnected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-brand-500 text-white" : "bg-surface-2 text-text-2 hover:bg-surface-3"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((integration, idx) => (
          <motion.div key={integration.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 rounded-lg bg-surface-2 border border-border hover:border-brand-500/30 transition-all cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{integration.icon}</div>
              <div className="flex-1">
                <p className="text-text-1 font-semibold">{integration.name}</p>
                <p className="text-text-4 text-xs">{integration.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {integration.features.slice(0, 2).map(f => (
                  <span key={f} className="px-2 py-1 rounded-md bg-surface-3 text-text-3 text-xs">{f}</span>
                ))}
              </div>
              <StatusBadge status={integration.status} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
