import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'

/**
 * MobileSheet - Bottom sheet modal que se adapta a móvil/tablet/desktop
 * Desktop: Modal centrado tradicional
 * Tablet: Modal en la parte inferior con altura limitada
 * Móvil: Full-height bottom sheet con drag-to-close
 */

interface MobileSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showCloseButton?: boolean
  showHandle?: boolean
  maxHeight?: string | number
  snapPoints?: number[] // En móvil, puntos de snap para drag
}

export function MobileSheet({
  open,
  onClose,
  children,
  title,
  showCloseButton = true,
  showHandle = true,
  maxHeight = '80dvh',
  snapPoints = [0.5, 1],
}: MobileSheetProps) {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  if (isDesktop) {
    // Desktop: Modal tradicional centrado
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

            {/* Modal Dialog */}
            <motion.div
              className="fixed top-1/2 left-1/2 bg-surface-0 rounded-xl shadow-xl z-50 w-full"
              style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, scale: 0.95, y: 0, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-surface-2">
                  {title && <h2 className="text-xl font-semibold text-text-1">{title}</h2>}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-surface-1 rounded-lg transition-colors ml-auto"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-text-2" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 max-h-[calc(80dvh-120px)] overflow-y-auto">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Mobile/Tablet: Bottom Sheet
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-surface-0 rounded-t-2xl shadow-2xl z-50"
            style={{
              maxHeight,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle & Header */}
            <div className="flex flex-col items-center gap-3 pt-3 pb-2">
              {showHandle && (
                <motion.div
                  className="w-12 h-1 bg-surface-2 rounded-full"
                  whileHover={{ backgroundColor: 'var(--surface-3)' }}
                />
              )}

              {title && (
                <div className="w-full flex items-center justify-between px-6 py-2">
                  <h2 className="text-lg font-semibold text-text-1">{title}</h2>
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="p-2 hover:bg-surface-1 rounded-lg transition-colors"
                      whileTap={{ scale: 0.95 }}
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-text-2" />
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80dvh-80px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * useMobileSheet - Hook para manejar estado del sheet
 */

import { useState } from 'react'

export function useMobileSheet() {
  const [open, setOpen] = useState(false)

  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => setOpen((prev) => !prev),
  }
}

/**
 * SheetFooter - Componente para botones en la parte inferior del sheet
 */

interface SheetFooterProps {
  children: ReactNode
  sticky?: boolean
}

export function SheetFooter({ children, sticky = true }: SheetFooterProps) {
  return (
    <div
      className={`flex gap-3 py-4 ${sticky ? 'sticky bottom-0 bg-surface-0 border-t border-surface-2' : ''}`}
    >
      {children}
    </div>
  )
}
