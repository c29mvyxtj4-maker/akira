import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react'
import { getWorkspaces, switchWorkspace } from '@/services/teamCollaboration.service'
import Card from '@/components/ui/Card'

/**
 * Workspace Selector
 * Switch between different workspaces and create new ones
 */
export default function WorkspaceSelector({ currentWorkspace, onWorkspaceChange }) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      setLoading(false)
      const data = await getWorkspaces()
      setWorkspaces(data || [
        { id: '1', name: 'Main Workspace', owner: true, members: 5 },
        { id: '2', name: 'Design Team', owner: false, members: 3 },
        { id: '3', name: 'Marketing', owner: false, members: 8 },
      ])
    } catch (err) {
      console.error('Error loading workspaces:', err)
    }
  }

  const handleSwitchWorkspace = async (workspace) => {
    try {
      await switchWorkspace(workspace.id)
      onWorkspaceChange?.(workspace)
      setIsOpen(false)
    } catch (err) {
      console.error('Error switching workspace:', err)
    }
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return

    // Mock create workspace
    const newWorkspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: newWorkspaceName,
      owner: true,
      members: 1,
    }
    setWorkspaces([...workspaces, newWorkspace])
    setNewWorkspaceName('')
    setShowCreateForm(false)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors w-full text-left"
      >
        <Building2 size={16} className="text-brand-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-1 truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </p>
          <p className="text-xs text-text-4 truncate">
            {currentWorkspace?.members || 0} members
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-text-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-2 border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Workspaces List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-center text-text-4 text-sm">
                  Loading workspaces...
                </div>
              ) : workspaces.length === 0 ? (
                <div className="px-4 py-3 text-center text-text-4 text-sm">
                  No workspaces found
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleSwitchWorkspace(workspace)}
                    className={`w-full px-4 py-3 text-left hover:bg-surface-3 transition-colors border-b border-border last:border-0 flex items-center justify-between ${
                      currentWorkspace?.id === workspace.id ? 'bg-surface-3' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-text-1 text-sm">{workspace.name}</p>
                      <p className="text-xs text-text-4">{workspace.members} members</p>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Check size={16} className="text-brand-500" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border px-2 py-2 space-y-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full px-3 py-2 rounded-lg hover:bg-surface-3 transition-colors text-text-2 text-sm font-medium flex items-center gap-2 justify-center"
              >
                <Plus size={14} />
                New Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-2 border border-border rounded-lg p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-bold text-text-1 mb-4">Create Workspace</h3>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <input
                  type="text"
                  placeholder="Workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-3 border border-border rounded-lg text-text-1 focus:outline-none focus:border-brand-500 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-surface-3 text-text-2 rounded-lg hover:bg-surface-4 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
