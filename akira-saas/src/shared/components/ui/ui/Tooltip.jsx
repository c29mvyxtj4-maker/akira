import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Tooltip({
  content,
  children,
  side    = 'top',
  delay   = 400,
  className,
}) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const show = () => {
    timer.current = setTimeout(() => setVisible(true), delay)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setVisible(false)
  }

  const POSITIONS = {
    top:    '-top-8 left-1/2 -translate-x-1/2',
    bottom: '-bottom-8 left-1/2 -translate-x-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={clsx(
              'absolute z-50 px-2 py-1 rounded bg-surface-5 border border-border text-text-1 text-xs whitespace-nowrap pointer-events-none',
              POSITIONS[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}