import { useState, useEffect } from 'react'
import { Plus, FileText, Trash2, Lock, Users } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { getDocuments, createDocument, deleteDocument } from '@/services/documents.service'
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'
import clsx from 'clsx'

export default function DocumentsNotion() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!currentOrg?.id) return
    loadDocuments()
  }, [currentOrg?.id])

  async function loadDocuments() {
    try {
      setLoading(true)
      const docs = await getDocuments(currentOrg.id)
      setDocuments(docs || [])
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateDocument() {
    if (creating) return
    try {
      setCreating(true)
      const newDoc = await createDocument({
        title: 'Untitled Document',
        description: '',
        created_by: user.id,
      })
      setDocuments([newDoc, ...documents])
      window.location.href = `/documents-notion/${newDoc.id}`
    } catch (err) {
      console.error('Failed to create document:', err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteDocument(docId) {
    if (!window.confirm('Delete this document?')) return
    try {
      await deleteDocument(docId)
      setDocuments(documents.filter(d => d.id !== docId))
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const getRoleLabel = (role) => {
    const labels = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }
    return labels[role] || role
  }

  if (loading) return <PageSpinner />

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          subtitle="Create rich, collaborative documents with live sync"
          icon={FileText}
        />

        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Create your first document to get started with rich content, tables, charts, and more."
            action={
              <Button onClick={handleCreateDocument} loading={creating}>
                <Plus size={16} />
                Create Document
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-text-1">All Documents ({documents.length})</h2>
              <Button onClick={handleCreateDocument} loading={creating} size="sm">
                <Plus size={16} />
                New
              </Button>
            </div>

            <div className="grid gap-3">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={clsx(
                    'p-4 rounded-lg border border-surface-2 hover:border-surface-3 hover:bg-surface-1 transition-all cursor-pointer',
                    'flex items-center justify-between group'
                  )}
                  onClick={() => window.location.href = `/documents-notion/${doc.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-brand-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-1 truncate">{doc.title}</h3>
                      {doc.description && (
                        <p className="text-xs text-text-3 truncate">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-4">
                          Updated {new Date(doc.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-text-3">
                      <Users size={14} />
                      {doc.collaborators_count || 1}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteDocument(doc.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-surface-2 rounded"
                    >
                      <Trash2 size={16} className="text-text-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
