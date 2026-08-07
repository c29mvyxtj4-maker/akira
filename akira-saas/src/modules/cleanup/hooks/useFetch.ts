import { useState, useEffect, useCallback } from 'react'

interface UseFetchOptions {
  immediate?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
  dependencies?: any[]
}

/**
 * Generic data fetching hook to replace useClients, useProjects, etc.
 * Reduces ~300 LOC of duplicated hook code
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { immediate = true, onError, onSuccess, dependencies = [] } = options

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, onError, onSuccess])

  useEffect(() => {
    if (immediate) {
      refetch()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch,
  }
}

/**
 * Paginated fetching hook
 * Reduces ~200 LOC of pagination logic
 */
export function useFetchPaginated<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  limit = 10
) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async (p = 1) => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn(p, limit)
      setData(result.data)
      setTotal(result.total)
      setPage(p)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, limit])

  useEffect(() => {
    refetch(1)
  }, [])

  const hasMore = page * limit < total
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    page,
    total,
    totalPages,
    loading,
    error,
    hasMore,
    goToPage: refetch,
    nextPage: () => refetch(page + 1),
    prevPage: () => refetch(page - 1),
  }
}
