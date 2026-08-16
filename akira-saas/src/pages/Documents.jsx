import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotionEditor } from '@/components/notion/NotionEditor'
import * as notionService from '@/services/notion.service'
import { PageSpinner } from '@/components/ui/Spinner'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initialize() {
      try {
        const WORKSPACE_ID = 'b66ce8ac-6415-40c1-b801-4bef15ef7982'
        const TEAMSPACE_ID = await getOrCreateTeamspace(WORKSPACE_ID)

        const pages = await notionService.getPages(TEAMSPACE_ID)
        let pg = pages.find((p) => p.title === 'AkiraLib Home')

        if (!pg) {
          try {
            pg = await notionService.createPage(TEAMSPACE_ID, 'AkiraLib Home', '📚')
          } catch (err) {
            console.warn('Could not create page:', err)
            pg = {
              id: 'temp-' + Date.now(),
              teamspace_id: TEAMSPACE_ID,
              title: 'AkiraLib Home',
              icon: '📚',
              created_by: 'unknown',
              updated_at: new Date(),
            }
          }
        }

        setPage(pg)
      } catch (err) {
        console.error('Error initializing AkiraLib:', err)
        setPage({
          id: 'temp-' + Date.now(),
          teamspace_id: 'temp',
          title: 'AkiraLib Home',
          icon: '📚',
          created_by: 'unknown',
          updated_at: new Date(),
        })
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  async function getOrCreateTeamspace(workspaceId) {
    try {
      const teamspaces = await notionService.getTeamspaces(workspaceId)
      if (teamspaces.length > 0) return teamspaces[0].id

      const ts = await notionService.createTeamspace(workspaceId, 'Biblioteca AKIRA')
      return ts.id
    } catch (err) {
      console.warn('Could not get/create teamspace:', err)
      return 'temp-' + Date.now()
    }
  }

  if (loading || !page) {
    return <PageSpinner label="Cargando AkiraLib..." />
  }

  return (
    <div className="bg-surface-0 text-text-1 min-h-screen">
      <NotionEditor pageId={page.id} />
    </div>
  )
}
