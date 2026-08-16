import React, { ReactNode, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Settings,
  Clock,
  Zap,
  Film,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/shared/context/AuthContext'

/**
 * MoreMenu - Drawer con opciones adicionales
 * Se muestra en mÃ³vil/tablet cuando el usuario hace click en "MÃ¡s"
 */

interface MenuOption {
  icon: ReactNode
  label: string
  route?: string
  action?: () => void
  divider?: boolean
  danger?: boolean
}

interface MoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuOptions: MenuOption[] = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Time Tracking',
      route: ROUTES.TIME_TRACKING,
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Operatives',
      route: ROUTES.AI_OPERATIVES,
    },
    {
      icon: <Film className="w-5 h-5" />,
      label: 'YouTube Projects',
      route: '/youtube',
    },
    {
      divider: true,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      route: ROUTES.SETTINGS,
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      route: '/help',
    },
    {
      divider: true,
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: 'Log Out',
      action: () => {
        logout()
        onClose()
      },
      danger: true,
    },
  ]

  const handleMenuItemClick = (option: MenuOption) => {
    if (option.route) {
      navigate(option.route)
      onClose()
    } else if (option.action) {
      option.action()
    }
  }

  const isActive = (route?: string) => {
    if (!route) return false
    return location.pathname.startsWith(route)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-surface-0 rounded-t-xl shadow-lg z-50"
            style={{
              maxHeight: '80dvh',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle & Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2">
              <h2 className="text-lg font-semibold text-text-1">More Options</h2>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-surface-1 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-text-2" />
              </motion.button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto max-h-[calc(80dvh-60px)]">
              <nav className="p-2 space-y-1">
                {menuOptions.map((option, idx) => {
                  if (option.divider) {
                    return (
                      <div
                        key={`divider-${idx}`}
                        className="my-2 h-px bg-surface-2"
                      />
                    )
                  }

                  const active = isActive(option.route)

                  return (
                    <motion.button
                      key={option.label}
                      onClick={() => handleMenuItemClick(option)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-brand-500/10 text-brand-500'
                          : option.danger
                            ? 'text-danger hover:bg-danger/10'
                            : 'text-text-1 hover:bg-surface-1'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex-shrink-0">{option.icon}</span>
                      <span className="flex-1 text-left text-sm font-medium">
                        {option.label}
                      </span>
                      {active && (
                        <motion.div
                          className="w-2 h-2 bg-brand-500 rounded-full"
                          layoutId="activeIndicator"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * useMoreMenu - Hook para manejar el estado del MoreMenu drawer
 */

export function useMoreMenu() {
  const [open, setOpen] = useState(false)

  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => setOpen((prev) => !prev),
  }
}

