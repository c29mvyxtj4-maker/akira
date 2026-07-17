import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Zap, FileText, Users } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * RBAC Settings
 * Configure role-based access control and permissions
 */
export default function RBACSettings() {
  const [roles, setRoles] = useState([
    {
      id: 'owner',
      name: 'Owner',
      color: '#ef4444',
      permissions: {
        clients: { view: true, create: true, edit: true, delete: true },
        projects: { view: true, create: true, edit: true, delete: true },
        invoices: { view: true, create: true, edit: true, delete: true },
        finance: { view: true, create: true, edit: true, delete: true },
        team: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
      }
    },
    {
      id: 'admin',
      name: 'Admin',
      color: '#f59e0b',
      permissions: {
        clients: { view: true, create: true, edit: true, delete: true },
        projects: { view: true, create: true, edit: true, delete: true },
        invoices: { view: true, create: true, edit: true, delete: false },
        finance: { view: true, create: false, edit: false, delete: false },
        team: { view: true, create: true, edit: true, delete: false },
        settings: { view: true, create: false, edit: false, delete: false },
      }
    },
    {
      id: 'member',
      name: 'Member',
      color: '#3b82f6',
      permissions: {
        clients: { view: true, create: true, edit: true, delete: false },
        projects: { view: true, create: true, edit: true, delete: false },
        invoices: { view: true, create: false, edit: false, delete: false },
        finance: { view: true, create: false, edit: false, delete: false },
        team: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      }
    },
    {
      id: 'viewer',
      name: 'Viewer',
      color: '#64748b',
      permissions: {
        clients: { view: true, create: false, edit: false, delete: false },
        projects: { view: true, create: false, edit: false, delete: false },
        invoices: { view: true, create: false, edit: false, delete: false },
        finance: { view: true, create: false, edit: false, delete: false },
        team: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      }
    },
  ])

  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [saved, setSaved] = useState(false)

  const RESOURCES = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'finance', label: 'Finance', icon: Zap },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Lock },
  ]

  const ACTIONS = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
  ]

  const handlePermissionChange = (resourceId, actionId) => {
    const updatedRole = { ...selectedRole }
    updatedRole.permissions[resourceId][actionId] = !updatedRole.permissions[resourceId][actionId]
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r))
    setSelectedRole(updatedRole)
  }

  const handleSave = async () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-1">Role-Based Access Control</h2>
        <p className="text-sm text-text-4 mt-1">Configure permissions for each role</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role List */}
        <div className="space-y-2">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedRole(role)}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                selectedRole.id === role.id
                  ? 'bg-surface-2 border-brand-500 ring-1 ring-brand-500/30'
                  : 'bg-surface-2 border-border hover:border-brand-500/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span className="font-medium text-text-1">{role.name}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3">
          <Card padding="lg">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-1 mb-2">{selectedRole.name} Permissions</h3>
              <p className="text-sm text-text-4">Define what this role can do</p>
            </div>

            {/* Permissions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-text-1">Resource</th>
                    {ACTIONS.map(action => (
                      <th key={action.id} className="text-center py-2 px-2 font-semibold text-text-1">
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map((resource, i) => {
                    const ResourceIcon = resource.icon
                    return (
                      <motion.tr
                        key={resource.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border hover:bg-surface-3 transition-colors"
                      >
                        <td className="py-3 px-2 font-medium text-text-1">
                          <div className="flex items-center gap-2">
                            <ResourceIcon size={16} className="text-brand-500" />
                            {resource.label}
                          </div>
                        </td>
                        {ACTIONS.map(action => (
                          <td key={action.id} className="text-center py-3 px-2">
                            <input
                              type="checkbox"
                              checked={selectedRole.permissions[resource.id][action.id] || false}
                              onChange={() => handlePermissionChange(resource.id, action.id)}
                              className="w-5 h-5 rounded cursor-pointer"
                            />
                          </td>
                        ))}
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
              >
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
              <button className="px-6 py-2 bg-surface-3 text-text-2 rounded-lg hover:bg-surface-4 transition-colors font-medium">
                Reset
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Permission Legend */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <h3 className="font-semibold text-text-1 mb-3">Permission Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACTIONS.map(action => (
            <div key={action.id}>
              <p className="font-medium text-text-1 text-sm mb-1">{action.label}</p>
              <p className="text-xs text-text-4">
                {action.id === 'view' && 'View content'}
                {action.id === 'create' && 'Create new items'}
                {action.id === 'edit' && 'Modify existing items'}
                {action.id === 'delete' && 'Remove items'}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
