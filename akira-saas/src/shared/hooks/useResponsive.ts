import { useEffect, useState } from 'react'

/**
 * useResponsive - Hook para detectar breakpoints y adaptar comportamiento
 * Útil para condicionales de renderizado, gestos táctiles, etc.
 */

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const breakpoints = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
}

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [width, setWidth] = useState(1280)

  useEffect(() => {
    function handleResize() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1280

      setWidth(w)

      // Determinar breakpoint
      if (w < breakpoints.sm) {
        setBreakpoint('xs')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (w < breakpoints.md) {
        setBreakpoint('sm')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (w < breakpoints.lg) {
        setBreakpoint('md')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else if (w < breakpoints.xl) {
        setBreakpoint('lg')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(true)
      } else {
        setBreakpoint('xl')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    // Call on mount
    handleResize()

    // Add listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Función para verificar si es menor que un breakpoint
  const isLessThan = (bp: Breakpoint) => width < breakpoints[bp]
  const isGreaterThan = (bp: Breakpoint) => width >= breakpoints[bp]
  const isBetween = (min: Breakpoint, max: Breakpoint) =>
    width >= breakpoints[min] && width < breakpoints[max]

  return {
    breakpoint,
    isMobile,      // < 768px
    isTablet,      // 768px - 1280px
    isDesktop,     // >= 1024px
    width,
    isLessThan,
    isGreaterThan,
    isBetween,
  }
}

/**
 * useMedia - Hook para detectar media queries arbitrarias
 * useMedia('(max-width: 768px)') para checks más granulares
 */

export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)

    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

/**
 * useTouchDevice - Detectar si es un dispositivo táctil
 */

export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const isTouchDevice = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            // @ts-ignore - deprecated but widely supported
            navigator.msMaxTouchPoints > 0)) ||
        false
      )
    }

    setIsTouch(isTouchDevice())
  }, [])

  return isTouch
}

/**
 * useOrientation - Detectar orientación de pantalla (portrait/landscape)
 */

export type Orientation = 'portrait' | 'landscape'

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait')

  useEffect(() => {
    function handleOrientationChange() {
      if (typeof window !== 'undefined') {
        const isPortrait = window.innerHeight > window.innerWidth
        setOrientation(isPortrait ? 'portrait' : 'landscape')
      }
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

/**
 * useVH - Hook para obtener altura del viewport que respete safe areas
 * Útil para modales fullscreen en iOS
 */

export function useVH(): number {
  const [vh, setVh] = useState(window.innerHeight)

  useEffect(() => {
    function updateVH() {
      setVh(window.innerHeight)
    }

    window.addEventListener('resize', updateVH)
    window.addEventListener('orientationchange', updateVH)

    return () => {
      window.removeEventListener('resize', updateVH)
      window.removeEventListener('orientationchange', updateVH)
    }
  }, [])

  return vh
}
