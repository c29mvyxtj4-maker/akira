import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdvancedFiltersPanel({ filters, onFilterChange, onClear, isOpen, onClose }) {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '')
  const [dateTo, setDateTo] = useState(filters.dateTo || '')

  const handleApplyDates = () => {
    onFilterChange('dateFrom', dateFrom)
    onFilterChange('dateTo', dateTo)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '8px',
        minWidth: '300px',
        zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f1f4' }}>Filtros avanzados</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Date Range */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
          Rango de fechas
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f1f4',
              fontSize: '12px',
            }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f1f4',
              fontSize: '12px',
            }}
          />
        </div>
        <button
          onClick={handleApplyDates}
          style={{
            width: '100%',
            padding: '6px 10px',
            background: '#e63946',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Aplicar fechas
        </button>
      </div>

      {/* Status Filter */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
          Estado
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {['active', 'completed', 'archived', 'draft'].map(status => (
            <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#f1f1f4' }}>
              <input
                type="checkbox"
                checked={(filters.status || []).includes(status)}
                onChange={e => {
                  const current = filters.status || []
                  const updated = e.target.checked
                    ? [...current, status]
                    : current.filter(s => s !== status)
                  onFilterChange('status', updated)
                }}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ textTransform: 'capitalize' }}>{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      {(filters.dateFrom || filters.dateTo || (filters.status && filters.status.length > 0)) && (
        <button
          onClick={onClear}
          style={{
            width: '100%',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: '#f1f1f4',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Limpiar filtros
        </button>
      )}
    </motion.div>
  )
}
