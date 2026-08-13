import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { ResponsiveGrid, ResponsiveSection } from '@/components/responsive'

/**
 * DashboardResponsive - Wrapper para hacer el dashboard completamente responsivo
 * Maneja layout adaptativo para diferentes tamaños de pantalla
 */

interface DashboardResponsiveProps {
  children: ReactNode
}

export function DashboardResponsive({ children }: DashboardResponsiveProps) {
  const { isMobile } = useResponsive()

  return (
    <ResponsiveSection
      padding={isMobile ? 'sm' : 'lg'}
      gap={isMobile ? 'sm' : 'lg'}
      className="dashboard-responsive"
    >
      {children}
    </ResponsiveSection>
  )
}

/**
 * KpiCardGrid - Grilla de KPI cards con breakpoints responsivos
 * xs: 1 col | sm: 1 col | md: 2 cols | lg: 3 cols | xl: 4 cols
 */

interface KpiCardGridProps {
  children: ReactNode
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function KpiCardGrid({ children, gap = 'md' }: KpiCardGridProps) {
  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
      gap={gap}
      className="dashboard-kpi-grid"
    >
      {children}
    </ResponsiveGrid>
  )
}

/**
 * DashboardPanel - Tarjeta de panel con estilos responsivos
 * Padding adaptativo según breakpoint
 */

interface DashboardPanelProps {
  children: ReactNode
  title?: string
  action?: ReactNode
  className?: string
}

export function DashboardPanel({
  children,
  title,
  action,
  className = '',
}: DashboardPanelProps) {
  const { isMobile } = useResponsive()

  return (
    <div
      className={`dash-panel ${className}`}
      style={{
        padding: isMobile ? '12px' : '18px',
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: isMobile ? '13px' : '15px',
                fontWeight: 700,
                color: 'var(--text-1)',
              }}
            >
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * DashboardGrid - Grid genérica para layouts de dashboard
 * Adapta columnas según breakpoint
 */

interface DashboardGridProps {
  children: ReactNode
  variant?: 'charts' | 'cards' | 'panels'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function DashboardGrid({
  children,
  variant = 'cards',
  gap = 'md',
}: DashboardGridProps) {
  const colsConfig = {
    charts: { xs: 1, sm: 1, md: 1, lg: 2, xl: 2 },
    cards: { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
    panels: { xs: 1, sm: 1, md: 2, lg: 3, xl: 3 },
  }

  return (
    <ResponsiveGrid
      cols={colsConfig[variant]}
      gap={gap}
      className={`dashboard-grid dashboard-grid-${variant}`}
    >
      {children}
    </ResponsiveGrid>
  )
}

/**
 * ChartContainer - Container responsivo para gráficos
 * Ajusta tamaño y altura según breakpoint
 */

interface ChartContainerProps {
  children: ReactNode
  minHeight?: string
  className?: string
}

export function ChartContainer({
  children,
  minHeight = '300px',
  className = '',
}: ChartContainerProps) {
  const { isMobile } = useResponsive()

  return (
    <DashboardPanel className={`chart-container ${className}`}>
      <div
        style={{
          minHeight: isMobile ? '250px' : minHeight,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </DashboardPanel>
  )
}

/**
 * DashboardSidebar - Panel lateral que se convierte en drawer en móvil
 */

interface DashboardSidebarProps {
  children: ReactNode
  title?: string
}

export function DashboardSidebar({ children, title }: DashboardSidebarProps) {
  const { isDesktop } = useResponsive()

  // En móvil, mostrar como parte del flujo normal
  // En desktop, renderizar en sidebar
  if (!isDesktop) {
    return (
      <DashboardPanel title={title} className="dashboard-sidebar-mobile">
        {children}
      </DashboardPanel>
    )
  }

  return (
    <div
      style={{
        width: '340px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Stats - Componente para mostrar estadísticas numéricas
 * Responsive text sizing
 */

interface StatsProps {
  value: string | number
  label: string
  change?: string | number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
}

export function Stats({
  value,
  label,
  change,
  changeType = 'neutral',
  icon,
}: StatsProps) {
  const { isMobile } = useResponsive()

  const changeColors = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: 'var(--text-3)',
  }

  return (
    <div
      style={{
        padding: isMobile ? '12px' : '16px',
        borderRadius: '8px',
        background: 'var(--surface-1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {icon && (
        <div
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: '6px',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: isMobile ? '12px' : '13px',
            color: 'var(--text-3)',
            margin: 0,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: '2px 0 0 0',
          }}
        >
          {value}
        </p>
        {change !== undefined && (
          <p
            style={{
              fontSize: '11px',
              color: changeColors[changeType],
              margin: '2px 0 0 0',
            }}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  )
}
