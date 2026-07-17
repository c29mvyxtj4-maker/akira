import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Trash2, Mail, Shield, MoreVertical,
  AlertCircle, Check, Clock, XCircle
} from 'lucide-react'
import { getTeamMembers, addTeamMember, removeTeamMember, updateMemberRole } from '@/services/teamCollaboration.service'
import Card from '@/components/ui/Card'

/**
 * Team Members
 * Manage team members, assign roles, and handle invitations
 */
export default function TeamMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [error, setError] = useState(null)

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
  })

  const ROLES = [
    { id: 'owner', label: 'Owner', description: 'Full access to workspace' },
    { id: 'admin', label: 'Admin', description: 'Can manage members and settings' },
    { id: 'member', label: 'Member', description: 'Can view and edit content' },
    { id: 'viewer', label: 'Viewer', description: 'Can view content only' },
  ]

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(false)
      const data = await getTeamMembers()
      setMembers(data || [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', avatar: 'JD', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', avatar: 'JS', status: 'active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member', avatar: 'BJ', status: 'active' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'member', avatar: 'AB', status: 'pending' },
      ])
      setError(null)
    } catch (err) {
      console.error('Error loading team members:', err)
      setError('Failed to load team members')
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    if (!inviteForm.email.trim()) return

    try {
      await addTeamMember({
        email: inviteForm.email,
        role: inviteForm.role,
      })

      setMembers([...members, {
        id: Math.random().toString(36).substr(2, 9),
        name: inviteForm.email.split('@')[0],
        email: inviteForm.email,
        role: inviteForm.role,
        avatar: inviteForm.email.substring(0, 2).toUpperCase(),
        status: 'pending',
      }])

      setInviteForm({ email: '', role: 'member' })
      setShowInviteForm(false)
    } catch (err) {
      console.error('Error inviting member:', err)
      setError('Failed to invite member')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await removeTeamMember(memberId)
      setMembers(members.filter(m => m.id !== memberId))
    } catch (err) {
      console.error('Error removing member:', err)
      setError('Failed to remove member')
    }
  }

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole)
      setMembers(members.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ))
    } catch (err) {
      console.error('Error updating role:', err)
      setError('Failed to update member role')
    }
  }

  const getRoleLabel = (roleId) => {
    return ROLES.find(r => r.id === roleId)?.label || roleId
  }

  const getRoleColor = (roleId) => {
    const colors = {
      owner: 'bg-status-danger/10 border-status-danger/20 text-status-danger',
      admin: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
      member: 'bg-status-info/10 border-status-info/20 text-status-info',
      viewer: 'bg-surface-2 border-border text-text-3',
    }
    return colors[roleId] || colors.viewer
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-1">Team Members</h2>
          <p className="text-sm text-text-4 mt-1">Manage who has access to your workspace</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </div>

      {error && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg flex gap-3">
          <AlertCircle size={16} className="text-status-danger flex-shrink-0 mt-0.5" />
          <span className="text-sm text-status-danger">{error}</span>
        </div>
      )}

      {/* Invite Form */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="team@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm placeholder-text-5 focus:outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-4 mb-2 uppercase">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-1 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    {ROLES.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                  >
                    Send Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 bg-surface-2 text-text-2 rounded-lg hover:bg-surface-3 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-surface-3 animate-spin mb-3 mx-auto" />
            <p className="text-text-4 text-sm">Loading team members...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Users size={40} className="text-text-4 mx-auto mb-3 opacity-50" />
          <p className="text-text-2 font-medium mb-1">No team members yet</p>
          <p className="text-text-4 text-sm">Invite your team to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="lg" hover>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-semibold text-sm">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-1">{member.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${
                          member.status === 'active'
                            ? 'bg-status-success/10 border-status-success/20 text-status-success'
                            : 'bg-status-warning/10 border-status-warning/20 text-status-warning'
                        }`}>
                          {member.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-text-4 text-sm">
                        <Mail size={12} />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Selector */}
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded border ${getRoleColor(member.role)} focus:outline-none bg-transparent cursor-pointer`}
                    >
                      {ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-text-4 hover:text-status-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Role Reference */}
      <Card padding="lg" className="bg-surface-2/50 border border-border">
        <h3 className="font-semibold text-text-1 mb-3 flex items-center gap-2">
          <Shield size={18} className="text-brand-500" />
          Role Permissions
        </h3>
        <div className="space-y-2">
          {ROLES.map(role => (
            <div key={role.id} className="text-sm">
              <p className="font-medium text-text-1">{role.label}</p>
              <p className="text-text-4 text-xs">{role.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
