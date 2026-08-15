import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function BlockComments({ blockId, comments = [], onAddComment }) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment?.(blockId, newComment)
      setNewComment('')
    }
  }

  return (
    <div className="relative">
      {/* Comment button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1"
        title={`${comments.length} comentarios`}
      >
        <MessageCircle size={16} />
        {comments.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {comments.length}
          </span>
        )}
      </button>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface-0 border border-surface-2 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2">
              <h3 className="font-semibold text-text-1">Comentarios</h3>
              <button onClick={() => setShowComments(false)} className="text-text-3 hover:text-text-1">
                <X size={18} />
              </button>
            </div>

            {/* Comments list */}
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-text-3 text-center py-4">Sin comentarios aún</p>
              ) : (
                comments.map((comment, idx) => (
                  <div key={idx} className="bg-surface-1 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {comment.author?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-semibold text-text-1">{comment.author || 'Usuario'}</span>
                      <span className="text-xs text-text-3">{comment.timestamp || 'ahora'}</span>
                    </div>
                    <p className="text-sm text-text-2">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <div className="p-4 border-t border-surface-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Agregar comentario..."
                className="w-full p-2 bg-surface-1 border border-surface-2 rounded text-sm text-text-1 placeholder-text-3 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-surface-2 disabled:text-text-3 text-white text-sm rounded transition-colors"
              >
                Comentar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
