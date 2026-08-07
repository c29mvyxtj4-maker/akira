// Mobile Responsive Enhancement Guide
// This file documents improvements made for mobile responsiveness

export const MOBILE_ENHANCEMENTS = {
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  touchTargets: {
    minimum: '44px', // Apple HIG recommendation
    comfortable: '48px',
    spacious: '56px',
  },

  // Components that have been optimized for mobile
  optimizedComponents: [
    {
      component: 'Dashboard',
      changes: [
        'Stack KPI cards vertically on sm screens',
        'Full-width charts on mobile',
        'Bottom navigation drawer',
        'Responsive grid (1 col on sm, 2 on md, 3+ on lg)',
      ],
    },
    {
      component: 'Projects (Kanban)',
      changes: [
        'Horizontal scroll on mobile',
        'Expandable columns',
        'Card collapse/expand',
        'Touch-friendly drag handles',
      ],
    },
    {
      component: 'Clients',
      changes: [
        'List view on mobile (not table)',
        'Swipeable actions',
        'Collapsible details',
        'Search sticky at top',
      ],
    },
    {
      component: 'Invoices',
      changes: [
        'Card layout on mobile',
        'Status badges prominent',
        'Action buttons below content',
        'Responsive PDF preview',
      ],
    },
    {
      component: 'Settings',
      changes: [
        'Vertical tabs on mobile',
        'Full-width inputs',
        'Single-column layout',
        'Sticky save button',
      ],
    },
  ],

  // CSS Classes to apply for mobile responsiveness
  responsivePatterns: {
    stack: 'flex flex-col md:flex-row',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    table: 'overflow-x-auto md:overflow-visible',
    touchButton: 'min-h-[44px] min-w-[44px]',
    verticalTabs: 'flex flex-col md:flex-row',
    fullWidth: 'w-full md:w-auto',
    responsiveText: 'text-sm md:text-base',
    responsivePadding: 'p-3 md:p-4 lg:p-6',
  },

  // Mobile-first utility
  utilities: {
    hideOnMobile: 'hidden md:block',
    showOnMobile: 'md:hidden',
    responsiveMargin: 'mb-2 md:mb-4',
    responsiveGap: 'gap-2 md:gap-4',
  },
}

// HOW TO APPLY:
// 1. Use Tailwind breakpoint prefixes: sm:, md:, lg:
// 2. Mobile-first approach: default is mobile, then override for larger screens
// 3. Minimum touch targets: 44x44px
// 4. No horizontal scrolling on body
// 5. Test with DevTools mobile emulation (iPhone/Android)
// 6. Test in actual mobile browsers/apps

export const MOBILE_TESTING_CHECKLIST = [
  '[ ] No horizontal scrolling on body element',
  '[ ] All buttons >= 44x44px on touch',
  '[ ] Text is readable without zoom (minimum 16px)',
  '[ ] Links are spaced >= 8px apart',
  '[ ] Form inputs are full width on mobile',
  '[ ] Touch interactions work without hover',
  '[ ] Modals/drawers fit screen height',
  '[ ] Navigation is accessible (not hidden)',
  '[ ] Images are responsive (max-width: 100%)',
  '[ ] Viewport meta tag is correct',
  '[ ] Performance is acceptable on slow 3G',
]

export const VIEWPORT_META_TAG = `
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
`
