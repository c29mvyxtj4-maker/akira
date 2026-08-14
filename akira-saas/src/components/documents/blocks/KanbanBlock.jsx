import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, GripVertical } from 'lucide-react'

/**
 * KanbanBlock - Kanban board for task/project management
 * Columns are customizable and draggable
 * Cards can be drag-and-dropped between columns
 */
export default function KanbanBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [columns, setColumns] = useState(
    block.metadata?.columns || [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'in-progress', title: 'In Progress', cards: [] },
      { id: 'done', title: 'Done', cards: [] },
    ]
  )

  const [draggedCard, setDraggedCard] = useState(null)
  const [newCardText, setNewCardText] = useState({})

  // Add card to column
  const handleAddCard = (columnId, title) => {
    if (!title.trim()) return

    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [
              ...col.cards,
              {
                id: `card_${Date.now()}`,
                title,
                description: '',
                assignee: null,
                dueDate: null,
              },
            ],
          }
        }
        return col
      })
    )

    setNewCardText({ ...newCardText, [columnId]: '' })
    updateMetadata()
  }

  // Delete card
  const handleDeleteCard = (columnId, cardId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          }
        }
        return col
      })
    )
    updateMetadata()
  }

  // Add column
  const handleAddColumn = () => {
    const newColumn = {
      id: `col_${Date.now()}`,
      title: 'New Column',
      cards: [],
    }
    setColumns([...columns, newColumn])
    updateMetadata()
  }

  // Delete column
  const handleDeleteColumn = (columnId) => {
    setColumns(columns.filter((c) => c.id !== columnId))
    updateMetadata()
  }

  // Handle drag start
  const handleCardDragStart = (e, card, fromColumnId) => {
    setDraggedCard({ card, fromColumnId })
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Handle drop on column
  const handleCardDrop = (e, toColumnId) => {
    e.preventDefault()
    if (!draggedCard) return

    const { card, fromColumnId } = draggedCard

    if (fromColumnId === toColumnId) {
      setDraggedCard(null)
      return
    }

    // Remove from source column
    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === fromColumnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== card.id),
          }
        }
        if (col.id === toColumnId) {
          return {
            ...col,
            cards: [...col.cards, card],
          }
        }
        return col
      })
    )

    setDraggedCard(null)
    updateMetadata()
  }

  // Update metadata in parent
  const updateMetadata = () => {
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        columns,
      },
    })
  }

  // Rename column
  const handleRenameColumn = (columnId, newTitle) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
    )
    updateMetadata()
  }

  return (
    <div className="w-full">
      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-min pb-4">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 w-80 bg-surface-1 rounded-lg border border-surface-2 flex flex-col max-h-screen"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-surface-2">
                <div className="group flex items-center justify-between">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => handleRenameColumn(column.id, e.target.value)}
                    readOnly={!canEdit}
                    className="font-semibold text-text-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1 flex-1"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-3 hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-text-3 mt-1">{column.cards.length} items</div>
              </div>

              {/* Cards */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleCardDrop(e, column.id)}
                className="flex-1 overflow-y-auto p-3 space-y-2"
              >
                {column.cards.map((card) => (
                  <motion.div
                    key={card.id}
                    draggable={canEdit}
                    onDragStart={(e) => handleCardDragStart(e, card, column.id)}
                    whileHover={{ y: -2 }}
                    className={`p-3 bg-surface-0 border border-surface-2 rounded-lg group ${
                      canEdit ? 'cursor-grab hover:shadow-md transition-shadow' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {canEdit && (
                        <GripVertical
                          size={16}
                          className="flex-shrink-0 text-text-3 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-1 break-words">
                          {card.title}
                        </p>
                        {card.description && (
                          <p className="text-xs text-text-3 mt-1 break-words">
                            {card.description}
                          </p>
                        )}
                        {card.dueDate && (
                          <div className="text-xs text-text-3 mt-2">
                            Due: {card.dueDate}
                          </div>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteCard(column.id, card.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 text-text-3 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Add card button */}
                {canEdit && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleAddCard(column.id, newCardText[column.id] || '')
                    }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={newCardText[column.id] || ''}
                      onChange={(e) =>
                        setNewCardText({ ...newCardText, [column.id]: e.target.value })
                      }
                      placeholder="Add a card..."
                      className="w-full px-2 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      className="w-full px-2 py-1.5 bg-brand-500 text-white rounded text-sm hover:bg-brand-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Add Card
                    </button>
                  </motion.form>
                )}
              </div>
            </motion.div>
          ))}

          {/* Add Column Button */}
          {canEdit && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleAddColumn}
              className="flex-shrink-0 w-80 h-16 border-2 border-dashed border-surface-2 rounded-lg flex items-center justify-center text-text-3 hover:text-brand-500 hover:border-brand-500 transition-colors"
            >
              <Plus size={20} />
              <span className="ml-2">Add Column</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
