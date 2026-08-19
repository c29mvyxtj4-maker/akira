import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchDocument, fetchPermissions } from '@/services/documents.service'

type UserRole = 'viewer' | 'editor' | 'admin'

interface DocumentPermissionRecord {
  id: string
  user_id: string
  document_id: string
  role: UserRole
  created_at: string
}

/**
 * useDocumentPermissions - Check user permissions on a document
 * Returns: canEdit, canComment, canAdmin
 */
export function useDocumentPermissions(documentId: string, userId?: string) {
  const [userRole, setUserRole] = useState<UserRole>('viewer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!documentId || !userId) {
      setLoading(false)
      return
    }

    const checkPermissions = async () => {
      try {
        // Check if user is owner of document
        const doc = await fetchDocument(documentId)

        if (doc?.created_by === userId) {
          setUserRole('admin')
          setLoading(false)
          return
        }

        // Check document_permissions table
        const permissions = await fetchPermissions(documentId)
        const userPerm = permissions.find((p: DocumentPermissionRecord) => p.user_id === userId)

        if (userPerm) {
          setUserRole(userPerm.role as UserRole)
        } else {
          setUserRole('viewer')
        }
      } catch (error) {
        console.error('Error fetching permissions:', error)
        setUserRole('viewer')
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()

    // Subscribe to permission changes
    const subscription = supabase
      .channel(`document_permissions:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_permissions',
          filter: `document_id=eq.${documentId}`,
        },
        () => {
          checkPermissions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [documentId, userId])

  const canEdit = userRole === 'editor' || userRole === 'admin' || userRole === 'owner'
  const canComment = userRole !== 'viewer' || userRole === 'owner'
  const canAdmin = userRole === 'admin' || userRole === 'owner'

  return {
    userRole,
    canEdit,
    canComment,
    canAdmin,
    loading,
  }
}

