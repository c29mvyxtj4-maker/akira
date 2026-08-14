import { FileText } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'

export default function DocumentsNotion() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          subtitle="Create rich, collaborative documents with live sync"
          icon={FileText}
        />

        <div className="max-w-4xl">
          <div className="bg-surface-1 border border-surface-2 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto mb-4 text-brand-500" />
            <h2 className="text-2xl font-bold text-text-1 mb-2">Documents Coming Soon</h2>
            <p className="text-text-3 mb-6">
              A powerful Notion-like document editor with real-time collaboration, rich formatting,
              and seamless integration with your projects and clients.
            </p>
            <div className="text-sm text-text-4">
              <p>✓ Notion-style "/" commands</p>
              <p>✓ Real-time collaborative editing</p>
              <p>✓ Tables, charts, calendars, and more</p>
              <p>✓ Shared with team and clients</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
