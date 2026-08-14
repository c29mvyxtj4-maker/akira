import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Check, Trash2 } from 'lucide-react'

/**
 * CommentThread - Comments on individual blocks
 * Threaded discussions with resolve/unresolve functionality
 */
export default function CommentThread({ blockId, comments = [], onAddComment, onResolveComment }) {
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAddComment = () => {
    if (!newComment.trim()) return

    onAddComment?.(blockId, {
      id: `comment_${Date.now()}`,
      text: newComment,
      author: 'Current User',
      timestamp: new Date(),
      resolved: false,
    })

    setNewComment('')
  }

  const unresolvedComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  return (
    <div className="space-y-3">
      {/* Comment Summary */}
      {comments.length > 0 && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-xs text-brand-500 hover:text-brand-600 transition-colors"
        >
          <MessageCircle size={14} />
          <span>
            {unresolvedComments.length} comment
            {unresolvedComments.length !== 1 ? 's' : ''}
          </span>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 p-3 bg-surface-0 rounded-lg border border-surface-2"
        >
          {/* Comments List */}
          {comments.length > 0 ? (
            <>
              {/* Unresolved Comments */}
              {unresolvedComments.length > 0 && (
                <div className="space-y-2">
                  {unresolvedComments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 bg-surface-1 rounded border-l-2 border-brand-500"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-xs text-text-1">
                          {comment.author}
                        </div>
                        <div className="text-xs text-text-3">
                          {new Date(comment.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <p className="text-xs text-text-1 mb-2">{comment.text}</p>

                      <button
                        onClick={() => onResolveComment?.(blockId, comment.id)}
                        className="flex items-center gap-1 text-xs text-text-3 hover:text-success transition-colors"
                      >
                        <Check size={12} />
                        Resolve
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Resolved Comments */}
              {resolvedComments.length > 0 && (
                <details className="text-xs text-text-3">
                  <summary className="cursor-pointer hover:text-text-2 transition-colors py-1">
                    {resolvedComments.length} resolved comment
                    {resolvedComments.length !== 1 ? 's' : ''}
                  </summary>
                  <div className="space-y-2 mt-2">
                    {resolvedComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2 bg-surface-1/50 rounded border-l-2 border-success opacity-60"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-xs text-text-1">
                            {comment.author}
                          </div>
                          <div className="text-xs text-success">Resolved</div>
                        </div>
                        <p className="text-xs text-text-1 line-through">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          ) : (
            <p className="text-xs text-text-3 text-center py-2">
              No comments yet
            </p>
          )}

          {/* Add Comment Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={(e) => {
              e.preventDefault()
              handleAddComment()
            }}
            className="space-y-2 border-t border-surface-2 pt-2"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-2 py-1.5 bg-surface-0 border border-surface-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-1">
              <button
                type="submit"
                className="flex-1 px-2 py-1 bg-brand-500 text-white rounded text-xs hover:bg-brand-600 transition-colors"
              >
                Comment
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-2 py-1 bg-surface-1 border border-surface-2 rounded text-xs hover:bg-surface-2 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </div>
  )
}
