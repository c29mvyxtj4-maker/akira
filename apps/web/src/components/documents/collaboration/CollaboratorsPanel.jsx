import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck } from 'lucide-react'

/**
 * CollaboratorsPanel - Shows who's currently editing
 * Real-time presence using Supabase Presence
 * Displays online/offline status
 */
export default function CollaboratorsPanel({ documentId }) {
  const [collaborators, setCollaborators] = useState([
    {
      id: '1',
      name: 'Marc Rodriguez',
      email: 'marcroson7@gmail.com',
      avatar: 'MR',
      isOnline: true,
      lastEditedAt: new Date(),
      color: '#e63946',
    },
  ])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // TODO: Implement real-time Supabase Presence subscription
    // For now, using mock data
    setLoading(false)
  }, [documentId])

  if (loading) {
    return <div className="text-text-3 text-sm">Loading collaborators...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-text-2" />
        <h3 className="text-sm font-semibold text-text-1">
          {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-2">
        {collaborators.map((collab) => (
          <motion.div
            key={collab.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-surface-0 rounded-lg border border-surface-2 hover:border-brand-500 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: collab.color }}
              >
                {collab.avatar}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-text-1 truncate">
                  {collab.name}
                </div>
                <div className="text-xs text-text-3 truncate">
                  {collab.email}
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    collab.isOnline ? 'bg-success' : 'bg-text-4'
                  }`}
                  title={collab.isOnline ? 'Online' : 'Offline'}
                />
                {collab.isOnline && (
                  <span className="text-xs text-success font-medium">
                    Editing
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Edited Info */}
      {collaborators.length > 0 && (
        <div className="p-3 bg-surface-1 rounded-lg border border-surface-2 text-xs text-text-3">
          <div className="flex items-center gap-1.5 mb-1">
            <UserCheck size={14} />
            <span>Last edited by {collaborators[0].name}</span>
          </div>
          <div>
            {new Date(collaborators[0].lastEditedAt).toLocaleString()}
          </div>
        </div>
      )}

      {/* Auto-refresh hint */}
      <div className="text-xs text-text-3 text-center">
        Updates automatically
      </div>
    </div>
  )
}
