import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotionEditor } from '@/components/notion/NotionEditor'
import * as notionService from '@/services/notion.service'
import { PageSpinner } from '@/components/ui/Spinner'

export default function NotionPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initialize() {
      try {
        // Usar IDs conocidos de workspace/teamspace que ya existen
        const WORKSPACE_ID = 'b66ce8ac-6415-40c1-b801-4bef15ef7982' // Tu workspace actual
        const TEAMSPACE_ID = await getOrCreateTeamspace(WORKSPACE_ID)

        // Obtener o crear página de ejemplo
        const pages = await notionService.getPages(TEAMSPACE_ID)
        let pg = pages.find((p) => p.title === 'Teamspace Home')

        if (!pg) {
          try {
            pg = await notionService.createPage(TEAMSPACE_ID, 'Teamspace Home', '🏠')
          } catch (err) {
            console.warn('Could not create page, using mock:', err)
            // Mock page si falla la creación
            pg = {
              id: 'temp-' + Date.now(),
              teamspace_id: TEAMSPACE_ID,
              title: 'Teamspace Home',
              icon: '🏠',
              created_by: 'unknown',
              updated_at: new Date(),
            }
          }
        }

        setPage(pg)
      } catch (err) {
        console.error('Error initializing Notion:', err)
        // Crear página mock si todo falla
        setPage({
          id: 'temp-' + Date.now(),
          teamspace_id: 'temp',
          title: 'Teamspace Home',
          icon: '🏠',
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

      const ts = await notionService.createTeamspace(workspaceId, 'Equipo Principal')
      return ts.id
    } catch (err) {
      console.warn('Could not get/create teamspace:', err)
      return 'temp-' + Date.now()
    }
  }

  if (loading || !page) {
    return <PageSpinner label="Iniciando editor..." />
  }

  return <NotionEditor pageId={page.id} />
}

