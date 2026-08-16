import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Plus, Trash2, Settings } from 'lucide-react'

/**
 * ChartBlock - Data visualization block
 * Supports: Bar, Line, Pie, Scatter charts
 * Manual data entry or linked data source
 */
export default function ChartBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [chartType, setChartType] = useState(block.metadata?.chartType || 'bar')
  const [data, setData] = useState(block.metadata?.data || [])
  const [xDataKey, setXDataKey] = useState(block.metadata?.xDataKey || 'name')
  const [yDataKey, setYDataKey] = useState(block.metadata?.yDataKey || 'value')
  const [colors] = useState(['#e63946', '#457b9d', '#a8dadc', '#f1faee', '#e63946'])
  const [showSettings, setShowSettings] = useState(false)
  const [newRowData, setNewRowData] = useState({ name: '', value: '' })

  // Chart type options
  const CHART_TYPES = [
    { id: 'bar', label: 'Bar Chart' },
    { id: 'line', label: 'Line Chart' },
    { id: 'pie', label: 'Pie Chart' },
    { id: 'scatter', label: 'Scatter Plot' },
  ]

  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        chartType: newType,
      },
    })
  }

  // Add data row
  const handleAddDataRow = () => {
    if (newRowData.name && newRowData.value) {
      const newData = [
        ...data,
        {
          name: newRowData.name,
          value: parseFloat(newRowData.value),
        },
      ]
      setData(newData)
      setNewRowData({ name: '', value: '' })
      onUpdate(block.id, {
        metadata: {
          ...block.metadata,
          data: newData,
        },
      })
    }
  }

  // Delete data row
  const handleDeleteRow = (index) => {
    const newData = data.filter((_, i) => i !== index)
    setData(newData)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        data: newData,
      },
    })
  }

  // Render chart based on type
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-surface-1 rounded border border-surface-2 text-text-3">
          No data to display
        </div>
      )
    }

    const commonProps = {
      width: '100%',
      height: 300,
      data,
      margin: { top: 20, right: 30, left: 0, bottom: 20 },
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
              <XAxis dataKey={xDataKey} stroke="var(--text-2)" />
              <YAxis stroke="var(--text-2)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-2)' }} />
              <Legend />
              <Bar dataKey={yDataKey} fill="var(--brand-500)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
              <XAxis dataKey={xDataKey} stroke="var(--text-2)" />
              <YAxis stroke="var(--text-2)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-2)' }} />
              <Legend />
              <Line type="monotone" dataKey={yDataKey} stroke="var(--brand-500)" dot={{ fill: 'var(--brand-500)' }} />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart {...commonProps}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={100}
                fill="var(--brand-500)"
                dataKey={yDataKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-2)' }} />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
              <XAxis dataKey={xDataKey} stroke="var(--text-2)" />
              <YAxis dataKey={yDataKey} stroke="var(--text-2)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-2)' }} />
              <Scatter data={data} fill="var(--brand-500)" />
            </ScatterChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Chart Type Selector */}
      {canEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 p-2 bg-surface-1 rounded border border-surface-2 flex-wrap"
        >
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleChartTypeChange(type.id)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                chartType === type.id
                  ? 'bg-brand-500 text-white'
                  : 'text-text-2 hover:text-brand-500 hover:bg-surface-0'
              }`}
            >
              {type.label}
            </button>
          ))}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-auto p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
          >
            <Settings size={16} />
          </button>
        </motion.div>
      )}

      {/* Chart */}
      <div className="w-full border border-surface-2 rounded-lg p-4 bg-surface-1">
        {renderChart()}
      </div>

      {/* Data Editor */}
      {canEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 bg-surface-1 rounded border border-surface-2"
        >
          <div className="text-sm font-semibold text-text-1">Data</div>

          {/* Current Data Table */}
          {data.length > 0 && (
            <div className="border border-surface-2 rounded overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-0 border-b border-surface-2">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-2">{xDataKey}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-2">{yDataKey}</th>
                    <th className="w-8 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-surface-2 last:border-0">
                      <td className="px-3 py-2 text-sm text-text-1">{row[xDataKey]}</td>
                      <td className="px-3 py-2 text-sm text-text-1">{row[yDataKey]}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          className="text-text-3 hover:text-danger transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Data Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRowData.name}
              onChange={(e) => setNewRowData({ ...newRowData, name: e.target.value })}
              placeholder={xDataKey}
              className="flex-1 px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="number"
              value={newRowData.value}
              onChange={(e) => setNewRowData({ ...newRowData, value: e.target.value })}
              placeholder={yDataKey}
              className="flex-1 px-3 py-2 bg-surface-0 border border-surface-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleAddDataRow}
              className="px-3 py-2 bg-brand-500 text-white rounded text-sm hover:bg-brand-600 transition-colors flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
