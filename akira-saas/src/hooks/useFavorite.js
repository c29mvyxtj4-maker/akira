import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook para manejar favoritos
 * Permite marcar/desmarcar un item como favorito
 * Usa localStorage como fallback si la tabla favorites no existe en Supabase
 */
export function useFavorite(itemType, itemId, itemName = '') {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // Helper para generar una clave de localStorage
  const getLocalStorageKey = () => `favorite-${itemType}-${itemId}`

  // Cargar estado de favorito al montar
  useEffect(() => {
    if (!itemType || !itemId) return

    const checkFavorite = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // Si no hay usuario, intenta leer de localStorage
          const stored = localStorage.getItem(getLocalStorageKey())
          setIsFavorite(stored === 'true')
          return
        }

        // Intenta obtener de Supabase
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId)
          .single()

        if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
          console.error('Error checking favorite:', error)
          // Si hay error que no es "no rows found" o "table not found", intenta localStorage
          const stored = localStorage.getItem(getLocalStorageKey())
          setIsFavorite(stored === 'true')
          return
        }

        // Si la tabla no existe (PGRST205), usa localStorage
        if (error?.code === 'PGRST205') {
          const stored = localStorage.getItem(getLocalStorageKey())
          setIsFavorite(stored === 'true')
          return
        }

        setIsFavorite(!!data)
      } catch (err) {
        console.error('Error in useFavorite:', err)
        // Fallback a localStorage
        const stored = localStorage.getItem(getLocalStorageKey())
        setIsFavorite(stored === 'true')
      }
    }

    checkFavorite()
  }, [itemType, itemId])

  const toggleFavorite = useCallback(async () => {
    if (!itemType || !itemId) {
      console.warn('useFavorite: itemType or itemId is missing')
      return
    }

    setLoading(true)
    try {
      // Get user and verify session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      console.log('[useFavorite] Auth check:', { userId: user?.id, hasError: !!authError })

      if (authError || !user?.id) {
        console.error('[useFavorite] No valid auth session:', authError)
        setLoading(false)
        return
      }

      if (isFavorite) {
        // Remover favorito
        try {
          const { error: deleteError } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('item_type', itemType)
            .eq('item_id', itemId)

          if (deleteError) {
            console.warn('[useFavorite] Delete error:', deleteError)
          }
        } catch (err) {
          console.error('[useFavorite] Exception deleting:', err)
        }

        localStorage.removeItem(getLocalStorageKey())
        setIsFavorite(false)
        console.log('[useFavorite] Removed favorite:', itemType, itemId)
      } else {
        // Agregar favorito
        try {
          console.log('[useFavorite] Attempting to save to Supabase for user:', user.id)

          // Obtener org_id del usuario
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.warn('[useFavorite] Error getting profile:', profileError)
          }

          // Preparar datos para insertar
          const favoriteData = {
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            item_name: itemName || itemId,
          }

          // Agregar org_id si está disponible
          if (profile?.org_id) {
            favoriteData.org_id = profile.org_id
          }

          console.log('[useFavorite] Inserting data:', favoriteData)

          // Intenta guardar en Supabase
          const { error: insertError, data: insertedData } = await supabase
            .from('favorites')
            .insert([favoriteData])
            .select()

          if (insertError) {
            console.error('[useFavorite] Error inserting to Supabase:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
            })
          } else {
            console.log('[useFavorite] Successfully saved to Supabase:', insertedData)
          }
        } catch (err) {
          console.error('[useFavorite] Exception saving to Supabase:', err)
        }

        localStorage.setItem(getLocalStorageKey(), 'true')
        // Also store metadata for displaying in sidebar
        localStorage.setItem(`${getLocalStorageKey()}-name`, itemName || itemId)
        localStorage.setItem(`${getLocalStorageKey()}-type`, itemType)
        setIsFavorite(true)
        console.log('[useFavorite] Added favorite to localStorage:', itemType, itemId)
      }

      // Dispatch event to update Sidebar
      window.dispatchEvent(
        new CustomEvent('favorites-updated', { detail: { itemType, itemId, isFavorite: !isFavorite } })
      )
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setLoading(false)
    }
  }, [itemType, itemId, isFavorite])

  return { isFavorite, toggleFavorite, loading }
}
