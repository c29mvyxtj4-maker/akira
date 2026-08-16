import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
  Briefcase,
  PieChart,
  Brain,
  MoreHorizontal,
  Bell,
} from 'lucide-react'
import { ROUTES } from '@/shared/config/constants'
import { useResponsive } from '@/shared/hooks/useResponsive'

/**
 * BottomNavigation - NavegaciÃ³n inferior para mÃ³vil y tablet
 * 5-6 items principales + botÃ³n "More" para opciones adicionales
 * Solo visible en breakpoints <= lg (1024px)
 */

interface NavItem {
  icon: ReactNode
  label: string
  route: string
  badge?: number
}

interface BottomNavigationProps {
  onMoreClick?: () => void
  notificationCount?: number
}

export function BottomNavigation({
  onMoreClick,
  notificationCount = 0,
}: BottomNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDesktop } = useResponsive()

  // Hide on desktop
  if (isDesktop) {
    return null
  }

  const navItems: NavItem[] = [
    {
      icon: <Home className="w-6 h-6" />,
      label: 'Inicio',
      route: ROUTES.HOME,
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Clientes',
      route: ROUTES.CLIENTS,
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: 'Proyectos',
      route: ROUTES.PROJECTS,
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      label: 'Finanzas',
      route: ROUTES.FINANCE,
    },
    {
      icon: <Brain className="w-6 h-6" />,
      label: 'AKIRA',
      route: ROUTES.BRAIN,
      badge: 0,
    },
  ]

  const isActive = (route: string) => {
    return location.pathname.startsWith(route)
  }

  const handleNavigation = (route: string) => {
    navigate(route)
  }

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-surface-0 border-t border-surface-2 safe-area-inset-bottom"
      style={{
        height: 'var(--bottombar-height-with-safe-area)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex h-full items-center justify-between px-2"
        style={{ gap: 'var(--space-xs)' }}
      >
        {/* Nav Items */}
        {navItems.map((item) => (
          <motion.button
            key={item.route}
            onClick={() => handleNavigation(item.route)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 relative transition-colors duration-200 ${
              isActive(item.route)
                ? 'text-brand-500'
                : 'text-text-3 hover:text-text-2'
            }`}
            whileTap={{ scale: 0.95 }}
            aria-label={item.label}
            aria-current={isActive(item.route) ? 'page' : undefined}
          >
            <div className="flex-1 flex items-center justify-center mb-1">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span
                  className="absolute top-1 right-0 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}
            </div>
            <span className="text-xs font-medium truncate">{item.label}</span>

            {/* Active indicator */}
            {isActive(item.route) && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-t-full"
                layoutId="activeIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}

        {/* More Menu Button */}
        <motion.button
          onClick={onMoreClick}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-text-3 hover:text-text-2 transition-colors duration-200 relative"
          whileTap={{ scale: 0.95 }}
          aria-label="MÃ¡s opciones"
        >
          <div className="flex-1 flex items-center justify-center mb-1">
            <MoreHorizontal className="w-6 h-6" />
            {notificationCount > 0 && (
              <motion.span
                className="absolute top-1 right-0 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </motion.span>
            )}
          </div>
          <span className="text-xs font-medium">MÃ¡s</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}

/**
 * BottomNavigationSpacer - Crea espacio en la parte inferior para que el contenido no quede debajo del BottomNav
 * Usar dentro del main content area
 */

export function BottomNavigationSpacer() {
  const { isDesktop } = useResponsive()

  if (isDesktop) {
    return null
  }

  return (
    <div
      style={{
        height: 'var(--bottombar-height-with-safe-area)',
      }}
    />
  )
}

/**
 * Badge Helper - Componente para mostrar badges en items de navegaciÃ³n
 */

interface NavBadgeProps {
  count: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NavBadge({ count, position = 'top-right' }: NavBadgeProps) {
  if (count <= 0) return null

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  }

  return (
    <motion.span
      className={`absolute ${positionClasses[position]} w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold pointer-events-none`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}


