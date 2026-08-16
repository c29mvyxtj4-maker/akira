import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Card({
  children,
  className,
  hover   = false,
  padding = 'md',
  onClick,
  animate = true,
  as      = 'div',
}) {
  const PADDING = {
    none: '',
    sm:   'p-3',
    md:   'p-4',
    lg:   'p-5',
    xl:   'p-6',
  }

  const Component = animate ? motion.div : as

  const motionProps = animate ? {
    initial:    { opacity: 0, y: 6 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.25 },
  } : {}

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={clsx(
        'surface-card',
        PADDING[padding],
        hover && 'surface-card-hover cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  )
}