import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Key, Zap, Check } from "lucide-react"

export default function IntegrationSetup() {
  const [activeStep, setActiveStep] = useState(1)
  const [connected, setConnected] = useState(false)

  const steps = [
    { num: 1, title: "Authorize", desc: "Grant AKIRA permission to access your account" },
    { num: 2, title: "Configure", desc: "Set up integration preferences and features" },
    { num: 3, title: "Test", desc: "Verify the connection works correctly" },
    { num: 4, title: "Complete", desc: "Start using the integration" },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map(step => (
          <motion.div
            key={step.num}
            whileHover={{ y: -2 }}
            onClick={() => setActiveStep(step.num)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${activeStep >= step.num ? "bg-brand-500/10 border-brand-500/30" : "bg-surface-2 border-border"}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep >= step.num ? "bg-brand-500 text-white" : "bg-surface-3 text-text-2"}`}>
                {activeStep > step.num ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <p className="text-text-1 font-semibold text-sm">{step.title}</p>
            </div>
            <p className="text-text-4 text-xs">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="p-6 rounded-xl bg-surface-2 border border-border">
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-1">Authorize Access</h3>
            <p className="text-text-4 text-sm">Grant AKIRA permission to access your Slack workspace</p>
            <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all">
              Connect with Slack
            </button>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-1">Configure Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-3 border border-border">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-text-2 text-sm">Send project notifications to Slack</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-3 border border-border">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-text-2 text-sm">Post daily summary updates</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-3 border border-border">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-text-2 text-sm">Enable slash commands</span>
              </div>
            </div>
            <button onClick={() => setActiveStep(3)} className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all">
              Next: Test Connection
            </button>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-1">Test Connection</h3>
            <p className="text-text-4 text-sm">Verifying your integration settings...</p>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold text-sm">Connection successful!</p>
                <p className="text-green-200/80 text-xs">AKIRA can now access your Slack workspace</p>
              </div>
            </div>
            <button onClick={() => { setActiveStep(4); setConnected(true) }} className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all">
              Complete Setup
            </button>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-1">Setup Complete!</h3>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-300 font-semibold">Your Slack integration is now active</p>
              <p className="text-green-200/80 text-sm mt-1">Start receiving notifications and using Slack commands</p>
            </div>
            <div className="space-y-2">
              <p className="text-text-2 text-sm font-semibold">Next steps:</p>
              <ul className="text-text-4 text-sm space-y-1">
                <li>- Invite AKIRA bot to your Slack channels</li>
                <li>- Try the /akira help command</li>
                <li>- Configure notification preferences in settings</li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
