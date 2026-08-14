import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Share2, MoreVertical } from 'lucide-react'
import BlockRenderer from './BlockRenderer'
import SlashCommandPalette from './SlashCommandPalette'
import { useAuth } from '@/context/AuthContext'

export default function DocumentEditor({ docId, onBack }) {
  const { user } = useAuth()
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('Untitled Document')

  useEffect(() => {
    setLoading(false)
  }, [docId])

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <div className="border-b border-surface-2 bg-surface-0 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <button onClick={onBack} className="flex items-center gap-2 text-text-3 hover:text-text-1">
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex-1 mx-6">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              className="text-xl font-bold text-text-1 bg-surface-1 px-3 py-1 rounded"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-xl font-bold text-text-1 hover:bg-surface-1 px-3 py-1 rounded"
            >
              {title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-2 rounded"><Share2 size={18} /></button>
          <button className="p-2 hover:bg-surface-2 rounded"><Users size={18} /></button>
          <button className="p-2 hover:bg-surface-2 rounded"><MoreVertical size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <p className="text-text-3">Document editor placeholder - Full components incoming</p>
        </div>
      </div>
    </div>
  )
}
