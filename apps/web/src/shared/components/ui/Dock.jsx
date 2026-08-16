import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import './Dock.css'

/*
 * Dock estilo macOS (React Bits). Los iconos se magnifican según la cercanía
 * del ratón. Adaptado a AKIRA: usa `framer-motion` (no `motion/react`) y los
 * tokens de color de la app. En táctil no hay hover, así que la magnificación
 * simplemente no se dispara y los items quedan a su tamaño base (tappables).
 */

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize, label }) {
  var ref = useRef(null)
  var isHovered = useMotionValue(0)

  var mouseDistance = useTransform(mouseX, function (val) {
    var rect = ref.current ? ref.current.getBoundingClientRect() : { x: 0, width: baseItemSize }
    return val - rect.x - baseItemSize / 2
  })

  var targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize])
  var size = useSpring(targetSize, spring)

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onClick) onClick() }
  }

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={function () { isHovered.set(1) }}
      onHoverEnd={function () { isHovered.set(0) }}
      onFocus={function () { isHovered.set(1) }}
      onBlur={function () { isHovered.set(0) }}
      onClick={onClick}
      className={'dock-item ' + className}
      tabIndex={0}
      role="button"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {Children.map(children, function (child) { return cloneElement(child, { isHovered: isHovered }) })}
    </motion.div>
  )
}

function DockLabel({ children, className = '', ...rest }) {
  var isHovered = rest.isHovered
  var [isVisible, setIsVisible] = useState(false)

  useEffect(function () {
    if (!isHovered) return
    var unsubscribe = isHovered.on('change', function (latest) { setIsVisible(latest === 1) })
    return function () { unsubscribe() }
  }, [isHovered])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={'dock-label ' + className}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DockIcon({ children, className = '' }) {
  return <div className={'dock-icon ' + className}>{children}</div>
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
}) {
  var mouseX = useMotionValue(Infinity)
  var isHovered = useMotionValue(0)

  var maxHeight = useMemo(function () {
    return Math.max(dockHeight, magnification + magnification / 2 + 4)
  }, [magnification, dockHeight])
  var heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight])
  var height = useSpring(heightRow, spring)

  return (
    <motion.div style={{ height: height, scrollbarWidth: 'none' }} className="dock-outer">
      <motion.div
        onMouseMove={function (e) { isHovered.set(1); mouseX.set(e.pageX) }}
        onMouseLeave={function () { isHovered.set(0); mouseX.set(Infinity) }}
        className={'dock-panel ' + className}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Dock de la aplicación"
      >
        {(items || []).map(function (item, index) {
          return (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              label={item.label}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
