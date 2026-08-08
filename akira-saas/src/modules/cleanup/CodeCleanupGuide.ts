// Code Cleanup and Optimization Guide for AKIRA v2.0

export const CLEANUP_PATTERNS = {
  // 1. Consolidate Duplicate Service Methods
  duplicateServices: [
    {
      pattern: 'Multiple `.select()` queries with same structure',
      example: 'clients.service.js, projects.service.js (repetitive)',
      solution: 'Create baseService.js with generic fetch/create/update/delete',
      impact: '~200 LOC reduction',
    },
    {
      pattern: 'Repeated error handling in async functions',
      example: 'try/catch with console.error in every service',
      solution: 'Create errorHandler utility',
      impact: '~150 LOC reduction',
    },
    {
      pattern: 'Repeated Supabase query patterns',
      example: 'eq().order().select() in multiple places',
      solution: 'Create QueryBuilder utility',
      impact: '~100 LOC reduction',
    },
  ],

  // 2. Extract Common Hooks
  extractableHooks: [
    {
      name: 'useFetch',
      usage: 'Generic data fetching with loading/error states',
      replacements: ['useClients', 'useProjects', (partial) => '...'],
      impact: '~300 LOC reduction',
    },
    {
      name: 'useForm',
      usage: 'Form state, validation, submission',
      replacements: ['ClientForm', 'ProjectForm', 'InvoiceForm'],
      impact: '~400 LOC reduction',
    },
    {
      name: 'useAsync',
      usage: 'Async operation management',
      replacements: ['All components with async calls'],
      impact: '~250 LOC reduction',
    },
    {
      name: 'usePagination',
      usage: 'Pagination logic',
      replacements: ['ClientList', 'ProjectList', 'InvoiceList'],
      impact: '~200 LOC reduction',
    },
  ],

  // 3. Consolidate Component Variants
  componentVariants: [
    {
      components: ['Button.jsx', 'PrimaryButton', 'SecondaryButton'],
      solution: 'Single Button with variant prop',
      impact: '~100 LOC reduction',
    },
    {
      components: ['Card.jsx', 'WidgetCard', 'DashboardCard'],
      solution: 'Single Card with slots/children',
      impact: '~80 LOC reduction',
    },
    {
      components: ['Modal.jsx', 'Dialog.jsx', 'AlertDialog.jsx'],
      solution: 'Single Modal component',
      impact: '~120 LOC reduction',
    },
  ],

  // 4. Constants Consolidation
  constantLocations: [
    {
      pattern: 'Magic strings scattered throughout components',
      solution: 'Move to src/config/strings.js',
      impact: '~150 LOC cleanup',
    },
    {
      pattern: 'API endpoints hardcoded',
      solution: 'Move to src/config/api.js',
      impact: '~100 LOC cleanup',
    },
    {
      pattern: 'UI dimensions/spacing hardcoded',
      solution: 'Use Tailwind classes or CSS variables only',
      impact: '~200 LOC cleanup',
    },
  ],

  // 5. Remove Unused Code
  unusedCodePatterns: [
    'Old commented-out code',
    'Obsolete component files',
    'Unused imports (run eslint --fix)',
    'Console.log statements (keep only in dev)',
    'Dead CSS (run PurgeCSS)',
  ],

  // 6. Improve Type Safety
  typeSafetyImprovements: [
    'Add JSDoc comments to all functions',
    'Convert .js services to .ts',
    'Create interface files for props',
    'Strict TypeScript in tsconfig.json',
  ],

  // 7. Performance Optimizations
  performanceGains: [
    {
      optimization: 'Code splitting for routes (already done with lazy())',
      current: '~500KB per route chunk',
      potential: '~200KB per route chunk (-60%)',
    },
    {
      optimization: 'Memoize expensive components',
      example: 'Dashboard charts with React.memo',
      potential: 'Avoid unnecessary re-renders',
    },
    {
      optimization: 'Lazy load TipTap editor',
      current: 'Always loaded',
      potential: 'Only loaded on Knowledge page',
      savings: '~500KB',
    },
    {
      optimization: 'Remove unused Tailwind classes',
      current: 'Full Tailwind',
      potential: 'Purged Tailwind',
      savings: '~100KB',
    },
  ],
}

export const CLEANUP_CHECKLIST = [
  '[ ] Extract common hooks (useFetch, useForm, useAsync)',
  '[ ] Consolidate Button/Card/Modal components',
  '[ ] Move magic strings to config files',
  '[ ] Remove commented-out code',
  '[ ] Run eslint --fix to clean imports',
  '[ ] Convert .js services to .ts (gradual)',
  '[ ] Add JSDoc comments to functions',
  '[ ] Memoize expensive components',
  '[ ] Lazy load TipTap editor',
  '[ ] Run PurgeCSS to remove unused styles',
  '[ ] Review and remove dead imports',
  '[ ] Consolidate error handling',
  '[ ] Standardize naming conventions',
  '[ ] Create shared utilities directory',
  '[ ] Document public APIs (services)',
]

export const BEFORE_AFTER = {
  totalLOC: {
    before: 28861,
    after: 24300,
    reduction: '~15-20%',
  },
  bundleSize: {
    before: '~2.5MB',
    after: '~1.8MB',
    reduction: '~30%',
  },
  componentCount: {
    before: 88,
    after: 65,
    reason: 'Consolidated variants and removed unused',
  },
  serviceCount: {
    before: 33,
    after: 28,
    reason: 'Consolidated with base service',
  },
}

export const IMPROVEMENT_PHASES = [
  {
    phase: 1,
    name: 'Quick Wins (1h)',
    tasks: [
      'Remove commented code',
      'Run eslint --fix',
      'Consolidate magic strings',
      'Remove dead imports',
    ],
  },
  {
    phase: 2,
    name: 'Hook Extraction (2h)',
    tasks: [
      'Create useFetch hook',
      'Create useForm hook',
      'Create useAsync hook',
      'Create usePagination hook',
    ],
  },
  {
    phase: 3,
    name: 'Component Consolidation (2h)',
    tasks: [
      'Consolidate Button variants',
      'Consolidate Card variants',
      'Consolidate Modal/Dialog',
      'Remove unused components',
    ],
  },
  {
    phase: 4,
    name: 'Performance (1h)',
    tasks: [
      'Memoize expensive components',
      'Lazy load TipTap',
      'Run PurgeCSS',
      'Analyze bundle with source-map-explorer',
    ],
  },
  {
    phase: 5,
    name: 'Type Safety (1h)',
    tasks: [
      'Add JSDoc to utilities',
      'Convert critical .js to .ts',
      'Create prop interfaces',
      'Enable strict TypeScript',
    ],
  },
]
