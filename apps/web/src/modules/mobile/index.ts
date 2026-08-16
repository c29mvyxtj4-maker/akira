// Mobile Module exports
export { MOBILE_ENHANCEMENTS, MOBILE_TESTING_CHECKLIST, VIEWPORT_META_TAG } from './MobileResponsiveGuide'

// Hooks
export { useIsMobile, useIsTablet, useDeviceOrientation, useScreenSize } from './hooks/useIsMobile'

// Note: Mobile enhancements are primarily CSS-based using Tailwind breakpoints
// Apply these patterns throughout the codebase:
// - stack: flex flex-col md:flex-row
// - grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// - responsive text: text-sm md:text-base
// - responsive padding: p-3 md:p-4 lg:p-6
// - responsive gaps: gap-2 md:gap-4
