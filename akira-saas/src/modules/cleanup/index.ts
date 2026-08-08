// Code Cleanup & Optimization Module

// Guides
export { CLEANUP_PATTERNS, CLEANUP_CHECKLIST, BEFORE_AFTER, IMPROVEMENT_PHASES } from './CodeCleanupGuide'

// Base utilities to consolidate duplicate code
export { BaseService } from './utils/baseService'

// Generic hooks to replace duplicated hooks
export { useFetch, useFetchPaginated } from './hooks/useFetch'

// USAGE GUIDE:
// ============
// 1. Use BaseService to replace service classes:
//    OLD: class ClientsService { fetch() { ... } }
//    NEW: new BaseService('clients').fetch()
//
// 2. Use useFetch to replace useClients, useProjects, etc:
//    OLD: useClients()
//    NEW: useFetch(() => supabase.from('clients').select('*'))
//
// 3. Follow CLEANUP_CHECKLIST for systematic cleanup
//
// 4. Expected results:
//    - 15-20% LOC reduction (~4,500 lines)
//    - 30% bundle size reduction (~700KB)
//    - Better maintainability
//    - Consistent patterns across codebase
