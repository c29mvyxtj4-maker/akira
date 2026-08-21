import { useState, useCallback } from 'react'

export interface AdvancedFilters {
  dateFrom?: string
  dateTo?: string
  status?: string[]
  type?: string[]
  userId?: string
  searchText?: string
}

export function useAdvancedFilters(initialFilters: AdvancedFilters = {}) {
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters)
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = useCallback((key: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const toggleFilterValue = useCallback((key: keyof AdvancedFilters, value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[]) || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: updated }
    })
  }, [])

  const applyDateRange = useCallback((from: string, to: string) => {
    setFilters(prev => ({
      ...prev,
      dateFrom: from,
      dateTo: to,
    }))
  }, [])

  const hasActiveFilters = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))

  const buildQuery = useCallback((baseQuery: any) => {
    let query = baseQuery

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type)
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    return query
  }, [filters])

  return {
    filters,
    isOpen,
    setIsOpen,
    updateFilter,
    clearFilters,
    toggleFilterValue,
    applyDateRange,
    hasActiveFilters,
    buildQuery,
  }
}
