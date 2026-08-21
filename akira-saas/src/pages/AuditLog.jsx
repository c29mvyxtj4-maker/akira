import { useState, useEffect } from 'react'
import { Download, Filter, X } from 'lucide-react'
import { motion } from 'framer-motion'
import AppLayout from '@/shared/components/layout/AppLayout'
import AuditTimeline from '@/components/AuditTimeline'
import { fetchAuditLogs, exportAuditLogsCSV } from '@/services/audit.service'

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: null,
    table: null,
    user: null,
    dateFrom: null,
    dateTo: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await fetchAuditLogs({
        action: filters.action,
        table: filters.table,
        user: filters.user,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
    setLoading(false)
  }

  const handleExport = async () => {
    try {
      await exportAuditLogsCSV(logs)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const clearFilters = () => {
    setFilters({
      action: null,
      table: null,
      user: null,
      dateFrom: null,
      dateTo: null,
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== null)

  const header = (
    <div style={{
      padding: 'var(--space-4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <h1 style={{
          margin: '0 0 4px 0',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-1)',
        }}>
          Registro de auditoría
        </h1>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'var(--text-3)',
        }}>
          {logs.length} eventos registrados
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px 16px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <Filter size={16} />
          Filtros
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            background: 'var(--brand)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <Download size={16} />
          Exportar
        </motion.button>
      </div>
    </div>
  )

  const toolbar = (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: showFilters ? 1 : 0, height: showFilters ? 'auto' : 0 }}
      transition={{ duration: 0.2 }}
      style={{
        overflow: 'hidden',
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      {/* Action filter */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--text-3)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Acción
        </label>
        <select
          value={filters.action || ''}
          onChange={(e) => setFilters({ ...filters, action: e.target.value || null })}
          style={{
            padding: '6px 10px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-1)',
            fontSize: '12px',
          }}
        >
          <option value="">Todas las acciones</option>
          <option value="create">Crear</option>
          <option value="update">Actualizar</option>
          <option value="delete">Eliminar</option>
          <option value="view">Ver</option>
          <option value="login">Login</option>
        </select>
      </div>

      {/* Table filter */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--text-3)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Tabla
        </label>
        <select
          value={filters.table || ''}
          onChange={(e) => setFilters({ ...filters, table: e.target.value || null })}
          style={{
            padding: '6px 10px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-1)',
            fontSize: '12px',
          }}
        >
          <option value="">Todas las tablas</option>
          <option value="clients">Clientes</option>
          <option value="projects">Proyectos</option>
          <option value="invoices">Facturas</option>
          <option value="documents">Documentos</option>
          <option value="users">Usuarios</option>
        </select>
      </div>

      {/* Date from */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--text-3)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Desde
        </label>
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
          style={{
            padding: '6px 10px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-1)',
            fontSize: '12px',
          }}
        />
      </div>

      {/* Date to */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'var(--text-3)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Hasta
        </label>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
          style={{
            padding: '6px 10px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-1)',
            fontSize: '12px',
          }}
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={clearFilters}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
          }}
        >
          <X size={14} />
          Limpiar
        </motion.button>
      )}
    </motion.div>
  )

  return (
    <AppLayout
      header={header}
      toolbar={showFilters ? toolbar : null}
    >
      <div style={{
        padding: 'var(--space-4)',
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: 'var(--text-3)',
            fontSize: '14px',
          }}>
            Cargando eventos...
          </div>
        ) : (
          <AuditTimeline logs={logs} />
        )}
      </div>
    </AppLayout>
  )
}
