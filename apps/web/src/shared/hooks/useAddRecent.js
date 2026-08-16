import { useCallback } from 'react'

/**
 * Hook para registrar items abiertos en RECIENTES
 * Llamar cuando: usuario navega a un cliente, proyecto, evento, etc.
 */
export function useAddRecent() {
  const addRecent = useCallback((type, id) => {
    const key = `${type}-${id}`
    const recent = JSON.parse(localStorage.getItem('akira-recent-items') || '[]')

    // Remove if already exists (to move to top)
    const filtered = recent.filter(item => item !== key)

    // Add to beginning
    const updated = [key, ...filtered].slice(0, 20) // Keep max 20 items

    localStorage.setItem('akira-recent-items', JSON.stringify(updated))
    console.log('[useAddRecent] Added to recent:', key, 'Updated list:', updated)

    // Dispatch custom event so Sidebar can listen and update
    window.dispatchEvent(
      new CustomEvent('akira-recent-updated', { detail: { key, updated } })
    )
  }, [])

  return { addRecent }
}
