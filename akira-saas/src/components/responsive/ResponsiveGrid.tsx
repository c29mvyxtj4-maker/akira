import { ReactNode, CSSProperties } from 'react'

/**
 * ResponsiveGrid - Grilla que se adapta automáticamente según breakpoint
 * xs: 1 columna (320px-479px)
 * sm: 1-2 columnas (480px-767px)
 * md: 2-3 columnas (768px-1023px)
 * lg: 3-4 columnas (1024px-1279px)
 * xl: 4-6 columnas (1280px+)
 */

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autoFlow?: 'row' | 'column' | 'dense'
  className?: string
}

const gapMap = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
}

export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  autoFlow = 'row',
  className = '',
}: ResponsiveGridProps) {
  const getGridTemplate = (): string => {
    // Para dispositivos muy pequeños
    if (typeof window !== 'undefined') {
      const width = window.innerWidth

      if (width < 480) return `repeat(${cols.xs || 1}, 1fr)`
      if (width < 768) return `repeat(${cols.sm || 1}, 1fr)`
      if (width < 1024) return `repeat(${cols.md || 2}, 1fr)`
      if (width < 1280) return `repeat(${cols.lg || 3}, 1fr)`
      return `repeat(${cols.xl || 4}, 1fr)`
    }
    return `repeat(${cols.md || 2}, 1fr)`
  }

  const styles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplate(),
    gap: gapMap[gap],
    autoFlow,
    width: '100%',
  }

  return (
    <div
      className={`responsive-grid ${className}`}
      style={styles}
    >
      {children}
    </div>
  )
}

// CSS Media Query Approach (más eficiente que JS)
export function ResponsiveGridCSS({
  children,
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gridClass = `
    grid
    xs:grid-cols-${cols.xs || 1}
    sm:grid-cols-${cols.sm || 1}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
    gap-${gap}
    ${className}
  `

  return (
    <div className={gridClass}>
      {children}
    </div>
  )
}
