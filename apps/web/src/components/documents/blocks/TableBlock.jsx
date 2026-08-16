import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Download, Link2 } from 'lucide-react'

/**
 * TableBlock - Editable data table
 * Supports manual entry or linking to data sources (Clients, Projects, Finance, etc)
 */
export default function TableBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [data, setData] = useState(block.metadata?.data || [])
  const [columns, setColumns] = useState(block.metadata?.columns || ['Column 1', 'Column 2'])
  const [linkedSource, setLinkedSource] = useState(block.metadata?.linkedSource || null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)

  const handleUpdateCell = (rowIndex, colIndex, value) => {
    const newData = [...data]
    if (!newData[rowIndex]) newData[rowIndex] = {}
    newData[rowIndex][colIndex] = value
    setData(newData)

    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        data: newData,
      },
    })
  }

  const handleAddColumn = () => {
    const newColumns = [...columns, `Column ${columns.length + 1}`]
    setColumns(newColumns)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        columns: newColumns,
      },
    })
    setShowAddColumn(false)
  }

  const handleAddRow = () => {
    const newData = [...data, {}]
    setData(newData)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        data: newData,
      },
    })
    setShowAddRow(false)
  }

  const handleDeleteRow = (rowIndex) => {
    const newData = data.filter((_, i) => i !== rowIndex)
    setData(newData)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        data: newData,
      },
    })
  }

  const handleDeleteColumn = (colIndex) => {
    const newColumns = columns.filter((_, i) => i !== colIndex)
    const newData = data.map((row) => {
      const newRow = { ...row }
      delete newRow[colIndex]
      return newRow
    })
    setColumns(newColumns)
    setData(newData)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        columns: newColumns,
        data: newData,
      },
    })
  }

  const handleRenameColumn = (colIndex, newName) => {
    const newColumns = [...columns]
    newColumns[colIndex] = newName
    setColumns(newColumns)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        columns: newColumns,
      },
    })
  }

  const handleExportCSV = () => {
    const csv = [
      columns.join(','),
      ...data.map((row) =>
        columns.map((_, i) => row[i] || '').join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'table.csv'
    a.click()
  }

  return (
    <div className="w-full space-y-3">
      {/* Table Toolbar */}
      {canEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 p-2 bg-surface-1 rounded border border-surface-2"
        >
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
          >
            <Plus size={16} />
            Row
          </button>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
          >
            <Plus size={16} />
            Column
          </button>
          <div className="w-px bg-surface-2" />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          {!linkedSource && (
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
            >
              <Link2 size={16} />
              Link Data
            </button>
          )}
        </motion.div>
      )}

      {/* Table */}
      <div className="border border-surface-2 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-surface-1 border-b border-surface-2">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-text-1">
                  {canEdit ? (
                    <div className="group flex items-center justify-between">
                      <input
                        type="text"
                        value={col}
                        onChange={(e) => handleRenameColumn(idx, e.target.value)}
                        className="bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                      />
                      <button
                        onClick={() => handleDeleteColumn(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-3 hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    col
                  )}
                </th>
              ))}
              {canEdit && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-surface-2 hover:bg-surface-1 transition-colors"
                >
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm text-text-1">
                      {canEdit ? (
                        <input
                          type="text"
                          value={row[colIdx] || ''}
                          onChange={(e) => handleUpdateCell(rowIdx, colIdx, e.target.value)}
                          className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                        />
                      ) : (
                        row[colIdx] || ''
                      )}
                    </td>
                  ))}
                  {canEdit && (
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(rowIdx)}
                        className="p-1 text-text-3 hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (canEdit ? 1 : 0)}
                  className="px-4 py-8 text-center text-text-3 text-sm"
                >
                  {canEdit ? 'Add rows to get started' : 'No data'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Empty State with CTA */}
      {data.length === 0 && canEdit && (
        <div className="text-center py-4">
          <p className="text-text-3 text-sm mb-3">No rows yet. Click "Add Row" to get started.</p>
          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Add First Row
          </button>
        </div>
      )}
    </div>
  )
}
