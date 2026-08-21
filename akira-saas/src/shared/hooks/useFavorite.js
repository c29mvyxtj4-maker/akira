import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export function useFavorite(itemType, itemId, itemName = '') {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const key = `fav-${itemType}-${itemId}`

  useEffect(() => {
    const stored = localStorage.getItem(key)
    setIsFavorite(stored === 'true')
  }, [key])

  const toggleFavorite = useCallback(async () => {
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        localStorage.setItem(key, isFavorite ? 'false' : 'true')
        setIsFavorite(!isFavorite)
        setLoading(false)
        return
      }

      const userId = session.user.id
      const method = isFavorite ? 'DELETE' : 'POST'
      const body = isFavorite
        ? null
        : JSON.stringify([{
            user_id: userId,
            item_type: itemType,
            item_id: itemId,
            item_name: itemName || itemId,
          }])

      const response = await fetch(`${SUPABASE_URL}/rest/v1/favorites`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body,
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('[useFavorite] Error:', response.status, err)
      }

      localStorage.setItem(key, isFavorite ? 'false' : 'true')
      setIsFavorite(!isFavorite)
    } catch (err) {
      localStorage.setItem(key, isFavorite ? 'false' : 'true')
      setIsFavorite(!isFavorite)
    } finally {
      setLoading(false)
      window.dispatchEvent(new CustomEvent('favorites-updated'))
    }
  }, [isFavorite, itemType, itemId, itemName, key])

  return { isFavorite, toggleFavorite, loading }
}

