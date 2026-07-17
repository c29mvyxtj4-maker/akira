import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Lock, Zap, LayoutGrid, Workflow, BarChart3 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import WorkspaceSelector from '@/components/enterprise/WorkspaceSelector'
import TeamMembers from '@/components/enterprise/TeamMembers'
import RBACSettings from '@/components/enterprise/RBACSettings'
import WorkflowBuilder from '@/components/enterprise/WorkflowBuilder'
import DashboardBuilder from '@/components/enterprise/DashboardBuilder'

/**
 * Enterprise Page
 * Enterprise features for team collaboration, workflows, and customization
 * Phase 5: Enterprise Features
 */
export default function Enterprise() {
  const [activeTab, setActiveTab] = useState('workspace')
  const [currentWorkspace, setCurrentWorkspace] = useState({
    id: '1',
    name: 'Main Workspace',
    members: 5,
  })

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'rbac', label: 'Permissions', icon: Lock },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const tabContent = {
    workspace: <WorkspaceContent workspace={currentWorkspace} onWorkspaceChange={setCurrentWorkspace} />,
    team: <TeamMembers />,
    rbac: <RBACSettings />,
    workflows: <WorkflowBuilder />,
    dashboard: <DashboardBuilder />,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <PageHeader
          title="Enterprise Features"
          description="Team collaboration, workflows, and advanced customization"
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

/**
 * Workspace Content
 * Overview and workspace management
 */
function WorkspaceContent({ workspace, onWorkspaceChange }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Workspace Selector */}
      <div className="bg-surface-2 border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-1 mb-4">Select Workspace</h2>
        <div className="max-w-sm">
          <WorkspaceSelector
            currentWorkspace={workspace}
            onWorkspaceChange={onWorkspaceChange}
          />
        </div>
      </div>

      {/* Workspace Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Team Members"
          value={workspace.members}
          icon="👥"
        />
        <StatCard
          label="Active Workflows"
          value="4"
          icon="⚙️"
        />
        <StatCard
          label="API Keys"
          value="2"
          icon="🔑"
        />
      </div>

      {/* Workspace Settings */}
      <div className="bg-surface-2 border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-text-1">Workspace Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-1 mb-2">Workspace Name</label>
            <input
              type="text"
              defaultValue={workspace.name}
              className="w-full px-4 py-2 bg-surface-3 border border-border rounded-lg text-text-1 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-1 mb-2">Workspace URL</label>
            <div className="flex">
              <input
                type="text"
                defaultValue={workspace.name?.toLowerCase().replace(/\s+/g, '-')}
                className="flex-1 px-4 py-2 bg-surface-3 border border-border border-r-0 rounded-l-lg text-text-1 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
              <span className="px-4 py-2 bg-surface-3 border border-border border-l-0 rounded-r-lg text-text-4 text-sm">
                .akira.app
              </span>
            </div>
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-text-2">Allow external team members</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium">
            Save Settings
          </button>
          <button className="px-6 py-2 bg-surface-3 text-text-2 rounded-lg hover:bg-surface-4 transition-colors font-medium">
            Export Workspace
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-status-danger mb-3">Danger Zone</h3>
        <p className="text-sm text-text-4 mb-4">
          Deleting a workspace is irreversible. All data will be permanently removed.
        </p>
        <button className="px-6 py-2 bg-status-danger/20 text-status-danger rounded-lg hover:bg-status-danger/30 transition-colors font-medium text-sm">
          Delete Workspace
        </button>
      </div>
    </div>
  )
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-4 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
