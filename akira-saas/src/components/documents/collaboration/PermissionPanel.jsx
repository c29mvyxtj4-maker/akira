import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Share2, Copy, Eye, Edit3, Lock } from 'lucide-react'

/**
 * PermissionPanel - Manage document permissions
 * Add/remove members, change roles (Viewer, Editor, Admin)
 * Share link generation with expiration
 */
export default function PermissionPanel({ documentId }) {
  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'Marc Rodriguez',
      email: 'marcroson7@gmail.com',
      role: 'admin',
      addedAt: new Date(),
    },
  ])

  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('editor')
  const [shareLink, setShareLink] = useState('')
  const [showShareLink, setShowShareLink] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const ROLE_OPTIONS = [
    { id: 'viewer', label: 'Viewer', icon: Eye, description: 'Can only view' },
    { id: 'editor', label: 'Editor', icon: Edit3, description: 'Can edit and comment' },
    { id: 'admin', label: 'Admin', icon: Lock, description: 'Full control' },
  ]

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return

    const newMember = {
      id: `member_${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      addedAt: new Date(),
    }

    setMembers([...members, newMember])
    setNewMemberEmail('')
    setNewMemberRole('editor')
    setShowAddMember(false)

    // TODO: Call service to invite user
  }

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId))
    // TODO: Call service to remove member
  }

  const handleChangeRole = (memberId, newRole) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    // TODO: Call service to update role
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/documents/share/${documentId}?token=${Math.random().toString(36).substr(2, 9)}`
    setShareLink(link)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    // Show toast notification
  }

  return (
    <div className="space-y-6">
      {/* Share Link Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-surface-0 rounded-lg border border-surface-2 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-text-2" />
          <h4 className="font-semibold text-text-1">Share Link</h4>
        </div>

        {!shareLink ? (
          <button
            onClick={generateShareLink}
            className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Generate Share Link
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-surface-1 border border-surface-2 rounded text-sm focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-text-2 hover:text-brand-500 hover:bg-surface-1 rounded transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-text-3">
              <input type="checkbox" defaultChecked className="rounded" />
              Expires in 30 days
            </label>
          </div>
        )}
      </motion.div>

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-1">Members</h4>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-surface-1 rounded-lg border border-surface-2 space-y-3"
          >
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setNewMemberRole(option.id)}
                    className={`p-2 rounded border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                      newMemberRole === option.id
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-surface-0 text-text-1 border-surface-2 hover:border-brand-500'
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                className="flex-1 px-3 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition-colors"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-3 py-2 bg-surface-0 border border-surface-2 rounded-lg text-sm hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Members List */}
        <div className="space-y-2">
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-surface-1 rounded-lg border border-surface-2 hover:border-brand-500 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-text-1">{member.name}</div>
                <div className="text-xs text-text-3">{member.email}</div>
              </div>

              <div className="flex items-center gap-2">
                {/* Role Selector */}
                <select
                  value={member.role}
                  onChange={(e) => handleChangeRole(member.id, e.target.value)}
                  className="px-2 py-1 text-xs bg-surface-0 border border-surface-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 text-text-3 hover:text-danger hover:bg-surface-0 rounded transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Role Descriptions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-surface-1 rounded-lg border border-surface-2"
      >
        <h5 className="text-sm font-semibold text-text-1 mb-2">Permissions</h5>
        <div className="space-y-2">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <div key={option.id} className="flex items-start gap-2">
                <Icon size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-text-3">
                    {option.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
