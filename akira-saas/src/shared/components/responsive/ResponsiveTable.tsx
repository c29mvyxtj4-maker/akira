import { ReactNode, CSSProperties } from 'react'
import { useResponsive } from '@/shared/hooks/useResponsive'
import { motion } from 'framer-motion'

/**
 * ResponsiveTable - Tabla que se adapta a mÃ³vil/tablet/desktop
 * Desktop: Tabla HTML tradicional
 * Tablet: Tabla compacta
 * MÃ³vil: Cards apiladas (no tabla)
 */

interface Column {
  key: string
  label: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any, key: string) => void
  renderRow?: (row: any, key: string) => ReactNode
  renderCard?: (row: any, key: string) => ReactNode
  loading?: boolean
  emptyState?: ReactNode
  striped?: boolean
  hoverable?: boolean
}

export function ResponsiveTable({
  columns,
  data,
  onRowClick,
  renderRow,
  renderCard,
  loading = false,
  emptyState,
  striped = true,
  hoverable = true,
}: ResponsiveTableProps) {
  const { isMobile, isTablet } = useResponsive()

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return emptyState || <div style={{ padding: '24px', textAlign: 'center' }}>No data</div>
  }

  // Mobile: Render as cards
  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {data.map((row, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onRowClick?.(row, idx.toString())}
            style={{
              cursor: onRowClick ? 'pointer' : 'default',
            }}
            whileHover={onRowClick ? { y: -2 } : {}}
          >
            {renderCard ? (
              renderCard(row, idx.toString())
            ) : (
              <CardRow row={row} columns={columns} />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // Tablet & Desktop: Render as table (but more compact on tablet)
  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid var(--surface-2)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: isTablet ? '13px' : '14px',
        }}
      >
        {/* Table Header */}
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--surface-2)',
              backgroundColor: 'var(--surface-1)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: isTablet ? '10px 12px' : '12px 16px',
                  textAlign: col.align || 'left',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  fontSize: isTablet ? '12px' : '13px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onRowClick?.(row, idx.toString())}
              style={{
                backgroundColor:
                  striped && idx % 2 === 1 ? 'var(--surface-1)' : 'transparent',
                borderBottom: '1px solid var(--surface-2)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease',
              }}
              whileHover={hoverable ? { backgroundColor: 'var(--surface-1)' } : {}}
            >
              {renderRow ? (
                renderRow(row, idx.toString())
              ) : (
                // Default rendering of columns
                columns.map((col) => (
                  <td
                    key={`${idx}-${col.key}`}
                    style={{
                      padding: isTablet ? '10px 12px' : '12px 16px',
                      textAlign: col.align || 'left',
                      color: 'var(--text-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: col.width || '200px',
                    }}
                    title={row[col.key]?.toString()}
                  >
                    {row[col.key]}
                  </td>
                ))
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * CardRow - Tarjeta para renderizar fila en mÃ³vil
 */

interface CardRowProps {
  row: any
  columns: Column[]
}

function CardRow({ row, columns }: CardRowProps) {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--surface-2)',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {columns.map((col) => (
          <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-3)',
                fontWeight: 500,
              }}
            >
              {col.label}
            </span>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-1)',
                fontWeight: 500,
                textAlign: 'right',
              }}
            >
              {row[col.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ResponsiveListItem - Componente simple para listas responsivas
 */

interface ResponsiveListItemProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  trailing?: ReactNode
  onClick?: () => void
  selected?: boolean
}

export function ResponsiveListItem({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  selected = false,
}: ResponsiveListItemProps) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: selected ? 'var(--surface-1)' : 'transparent',
        border: '1px solid var(--surface-2)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      whileHover={{ backgroundColor: 'var(--surface-1)' }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}

      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-1)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-3)',
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </motion.button>
  )
}

/**
 * ResponsiveList - Lista de items responsiva
 */

interface ResponsiveListProps {
  items: ResponsiveListItemProps[]
  onItemClick?: (index: number) => void
}

export function ResponsiveList({
  items,
  onItemClick,
}: ResponsiveListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <ResponsiveListItem
          key={idx}
          {...item}
          onClick={() => {
            item.onClick?.()
            onItemClick?.(idx)
          }}
        />
      ))}
    </div>
  )
}

