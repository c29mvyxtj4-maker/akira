import { ReactNode, CSSProperties } from 'react'

/**
 * ResponsiveSection - Sección con padding y margins responsivos
 * Ajusta automáticamente el espaciado según el tamaño de pantalla
 */

interface ResponsiveSectionProps {
  children: ReactNode
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'compact' | 'normal' | 'generous'
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullHeight?: boolean
  fullWidth?: boolean
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside'
  style?: CSSProperties
}

const paddingMap = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  compact: 'var(--layout-padding-xs)',
  normal: 'var(--layout-padding-md)',
  generous: 'var(--layout-padding-lg)',
}

const marginMap = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
}

const gapMap = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
}

export function ResponsiveSection({
  children,
  padding = 'md',
  margin = 'sm',
  gap = 'md',
  fullHeight = false,
  fullWidth = true,
  className = '',
  as: Component = 'div',
  style = {},
}: ResponsiveSectionProps) {
  const sectionStyle: CSSProperties = {
    padding: paddingMap[padding] || padding,
    margin: marginMap[margin] || margin,
    gap: gapMap[gap] || gap,
    width: fullWidth ? '100%' : 'auto',
    height: fullHeight ? '100%' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    ...style,
  }

  return (
    <Component
      className={`responsive-section ${className}`}
      style={sectionStyle}
    >
      {children}
    </Component>
  )
}

/**
 * ResponsiveContainer - Similar pero enfocado en contenedores de ancho máximo
 */

interface ResponsiveContainerProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
}

export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  centered = true,
  padding = 'md',
  className = '',
}: ResponsiveContainerProps) {
  const containerStyle: CSSProperties = {
    maxWidth: maxWidthMap[maxWidth],
    margin: centered ? '0 auto' : '0',
    padding: paddingMap[padding] || padding,
    width: '100%',
  }

  return (
    <div
      className={`responsive-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  )
}
