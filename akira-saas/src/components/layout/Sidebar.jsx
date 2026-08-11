import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  MessageCircle,
  FileText,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Calendar,
  Users,
  BookOpen,
  CheckSquare,
  ArrowUp,
  Zap,
  UserPlus,
  LogOut,
  Clock,
  Star,
} from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { supabase } from '@/lib/supabase'
import { getRecentPages, getFavorites, getUserWorkspaces, getRecentClients, getRecentProjects } from '@/services/sidebar.service'
import { EVENT_TYPES } from '@/services/calendar.service'

export default function Sidebar({ isCollapsed, onToggleCollapse, onOpenSettings }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState({
    reuniones: true,
    recientes: true,
    favoritos: true,
    equipo: false,
    privado: true,
  })
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const accountButtonRef = useRef(null)

  // Estado para datos dinámicos
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentPages, setRecentPages] = useState([])
  const [favorites, setFavorites] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentItems, setRecentItems] = useState([])

  // Function to add item to recent items
  const addRecentItem = (type, id) => {
    const key = `${type}-${id}`
    const recent = JSON.parse(localStorage.getItem('akira-recent-items') || '[]')

    // Remove if already exists (to move to top)
    const filtered = recent.filter(item => item !== key)

    // Add to beginning
    const updated = [key, ...filtered].slice(0, 20) // Keep max 20 items

    localStorage.setItem('akira-recent-items', JSON.stringify(updated))
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Inline fetching to avoid cache issues - DIRECT FROM SIDEBAR.JSX
      let orgId = localStorage.getItem('akira-active-org')

      // If no orgId in localStorage yet, try to get from auth user
      if (!orgId) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user && user.user_metadata && user.user_metadata.org_id) {
            orgId = user.user_metadata.org_id
            console.log('[SIDEBAR-INLINE] Got org_id from auth metadata:', orgId)
          }
        } catch (e) {
          console.error('[SIDEBAR-INLINE] Error getting auth user:', e)
        }
      }

      console.log('[SIDEBAR-INLINE] Starting event fetch for org:', orgId)
      let events = []
      try {
        // Query: Get future calendar events
        // Include events with matching org_id OR org_id = NULL (for legacy/unassigned events)
        let query = supabase
          .from('calendar_events')
          .select('*')
          .not('start_at', 'is', null)
          .eq('archived', false)
          .order('start_at', { ascending: true })
          .limit(10)

        // Always filter by org_id (matching or NULL for unassigned)
        if (orgId) {
          console.log('[SIDEBAR-INLINE] Filtering by org_id:', orgId)
          // Include events with this org_id OR org_id = NULL
          query = query.or(`org_id.eq.${orgId},org_id.is.null`)
        } else {
          console.log('[SIDEBAR-INLINE] No org_id, showing unassigned events only')
          // If no org_id, only show unassigned events (org_id = NULL)
          query = query.isNull('org_id')
        }

        const { data, error } = await query

        console.log('[SIDEBAR-INLINE] Query response:', { dataLength: data?.length, error })

        if (!error && data && data.length > 0) {
          const now = new Date()
          console.log('[SIDEBAR-INLINE] Filtering', data.length, 'events after', now)
          events = data.filter(event => {
            const eventDate = event.start_at || event.date || event.event_date
            const isAfterNow = eventDate && new Date(eventDate) > now
            console.log('[SIDEBAR-INLINE] Event:', event.title, '- start_at:', event.start_at, '- isFuture:', isAfterNow)
            return isAfterNow
          }).slice(0, 5)
          console.log('[SIDEBAR-INLINE] Returning', events.length, 'future events')
        } else if (error) {
          console.error('[SIDEBAR-INLINE] Query error:', error)
        }
      } catch (err) {
        console.error('[SIDEBAR-INLINE] Exception:', err)
      }

      const [pages, favs, workspaces_data, clients, projects] = await Promise.all([
        getRecentPages(),
        getFavorites(),
        getUserWorkspaces(),
        getRecentClients(),
        getRecentProjects(),
      ])

      // Get recent items from localStorage (ordered by opening)
      const recentItemsLS = JSON.parse(localStorage.getItem('akira-recent-items') || '[]')

      // Create a map of all available items
      const itemsMap = {}

      events.forEach(e => {
        itemsMap[`event-${e.id}`] = {
          type: 'event',
          id: e.id,
          icon: Calendar,
          label: e.title || 'Sin título',
          route: '/calendar',
          data: e,
          isEvent: true,
          eventData: e,
        }
      })

      pages.forEach(p => {
        itemsMap[`page-${p.id}`] = {
          type: 'page',
          id: p.id,
          icon: Clock,
          label: p.page_name || 'Sin nombre',
          route: p.page_route,
        }
      })

      clients.forEach(c => {
        itemsMap[`client-${c.id}`] = {
          type: 'client',
          id: c.id,
          icon: Users,
          label: c.name || 'Sin nombre',
          route: `/clients/${c.id}`,
        }
      })

      projects.forEach(pr => {
        itemsMap[`project-${pr.id}`] = {
          type: 'project',
          id: pr.id,
          icon: CheckSquare,
          label: pr.name || 'Sin nombre',
          route: `/projects/${pr.id}`,
        }
      })

      // Build combined recent list from localStorage order
      const combinedRecent = recentItemsLS
        .map(key => itemsMap[key])
        .filter(item => item) // Remove items that no longer exist
        .slice(0, 9)

      setUpcomingEvents(events)
      setRecentPages(pages)
      setRecentItems(combinedRecent)
      setFavorites(favs)
      setWorkspaces(workspaces_data)
      setLoading(false)

      return orgId
    }

    let subscription = null

    loadData().then((orgId) => {
      // Subscribe to real-time changes in calendar_events
      if (orgId) {
        subscription = supabase
          .channel(`calendar_events:org_id=eq.${orgId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'calendar_events',
              filter: `org_id=eq.${orgId}`,
            },
            (payload) => {
              console.log('[SIDEBAR-REALTIME] Calendar event updated:', payload)
              // Refetch events when changes occur
              loadData()
            }
          )
          .subscribe()
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const mainNavItems = [
    { icon: Home, label: 'Inicio', route: ROUTES.HOME },
    { icon: MessageCircle, label: 'Chat', route: '/brain' },
    { icon: FileText, label: 'Documentos', route: '/documents' },
    { icon: Mail, label: 'Correo', route: '/messages' },
    { icon: Search, label: 'Búsqueda', route: '/search' },
  ]

  const sections = {
    reuniones: {
      label: 'Reuniones',
      items: upcomingEvents.length > 0
        ? [
            ...upcomingEvents.slice(0, 3).map(event => {
              const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.other
              return {
                icon: Calendar,
                label: event.title || 'Sin título',
                route: '/calendar',
                color: eventType.color,
                isEvent: true,
                eventData: event,
              }
            }),
            { icon: ChevronRight, label: 'Ver todo', arrow: true, route: '/calendar' },
          ]
        : [
            { icon: Calendar, label: 'No hay próximos eventos', disabled: true },
            { icon: ChevronRight, label: 'Ver todo', arrow: true, route: '/calendar' },
          ],
    },
    recientes: {
      label: 'Recientes',
      items: recentItems.length > 0
        ? [
            ...recentItems.map(item => ({
              icon: item.icon,
              label: item.label,
              route: item.route,
              isEvent: item.isEvent,
              eventData: item.eventData,
              color: item.isEvent ? (EVENT_TYPES[item.eventData?.type]?.color || '#64748b') : undefined,
            })),
            { icon: Plus, label: 'Más', dots: true, route: '/activity' },
          ]
        : [
            { icon: Clock, label: 'Sin elementos recientes', disabled: true },
          ],
    },
    favoritos: {
      label: 'Favoritos',
      items: favorites.length > 0
        ? favorites.map(fav => ({
            icon: Star,
            label: fav.item_name || 'Sin nombre',
            route: fav.item_route,
          }))
        : [
            { icon: Star, label: 'Sin favoritos aún', disabled: true },
          ],
    },
    equipo: {
      label: 'Espacios de equipo',
      items: [],
    },
    privado: {
      label: 'Privado',
      items: workspaces.length > 0
        ? workspaces.map(ws => ({
            icon: Users,
            label: ws.name || 'Sin nombre',
            route: '/workspace/' + ws.id,
          }))
        : [
            { icon: Users, label: 'Sin workspaces', disabled: true },
          ],
    },
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isActive = (route) => location.pathname === route

  return (
    <motion.div
      animate={{ width: isCollapsed ? '0px' : '280px' }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50,
      }}>
      {/* Header */}
      <div style={{
        padding: '12px 8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <motion.button
          ref={accountButtonRef}
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          style={{
            width: '100%',
            border: '1px solid var(--border)',
            background: 'var(--bg-2)',
            padding: '10px 8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>M</div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            Marc Rosón Martí's ...
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />
        </motion.button>

        {/* Account Menu Dropdown */}
        {showAccountMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: accountButtonRef.current?.getBoundingClientRect().bottom + 8,
              left: accountButtonRef.current?.getBoundingClientRect().left,
              width: '280px',
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            {/* Header Info */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                }}>
                  M
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                  }}>
                    Marc Rosón Martí's Notion
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-3)',
                  }}>
                    Plan gratuito · 1 miembro
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{
              padding: '8px',
            }}>
              {/* Configuración */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  if (onOpenSettings) onOpenSettings()
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Settings size={16} />
                Configuración
              </motion.button>

              {/* Invitar a miembros */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Invitar a miembros - Funcionalidad en desarrollo')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <UserPlus size={16} />
                Invitar a miembros
              </motion.button>

              {/* Añadir cuenta */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Añadir cuenta - Funcionalidad en desarrollo')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Plus size={16} />
                Añadir cuenta
              </motion.button>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'var(--border)',
              margin: '8px 0',
            }} />

            {/* Email and Workspaces */}
            <div style={{
              padding: '8px',
            }}>
              {/* Email */}
              <div style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--text-3)',
              }}>
                marcroson7@gmail.com
              </div>

              {/* Current Workspace */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Workspace actual: Marc Rosón Martí\'s Notion')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'var(--bg-2)',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  M
                </div>
                Marc Rosón Martí's Notion
                <span style={{ marginLeft: 'auto', fontSize: '16px' }}>✓</span>
              </motion.button>

              {/* Other Workspace */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Cambiar a workspace: BECARIOS')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: 'var(--text-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  B
                </div>
                BECARIOS
              </motion.button>

              {/* Nuevo espacio de trabajo */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Crear nuevo espacio de trabajo')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--brand)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Plus size={16} />
                Nuevo espacio de trabajo
              </motion.button>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'var(--border)',
              margin: '8px 0',
            }} />

            {/* Cerrar sesión */}
            <div style={{
              padding: '8px',
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  alert('Cerrando sesión...')
                  setShowAccountMenu(false)
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'all var(--dur-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 8px',
        flexShrink: 0,
      }}>
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.route)

          return (
            <motion.button
              key={item.route}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.route)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'var(--brand)' : 'transparent',
                color: active ? 'white' : 'var(--text-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--dur-fast)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
              title={item.label}
            >
              <Icon size={20} />
            </motion.button>
          )
        })}
      </div>

      {/* Sections (Scrollable) */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        borderTop: '1px solid var(--border)',
      }}>
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} style={{ marginBottom: '16px' }}>
            {/* Section Header */}
            <motion.button
              onClick={() => toggleSection(key)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-3)',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-3)'
              }}
            >
              {expandedSections[key] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {section.label}
            </motion.button>

            {/* Section Items */}
            {expandedSections[key] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                {section.items.map((item, idx) => {
                  const Icon = item.icon

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        if (!item.disabled) {
                          if (item.isEvent) {
                            // Save event to localStorage and navigate to calendar
                            localStorage.setItem('akira-event-to-edit', JSON.stringify(item.eventData))
                            addRecentItem('event', item.eventData.id)
                            navigate('/calendar')
                          } else if (item.route) {
                            // Register other items (clients, projects, pages)
                            if (item.type === 'client') {
                              addRecentItem('client', item.id)
                            } else if (item.type === 'project') {
                              addRecentItem('project', item.id)
                            } else if (item.type === 'page') {
                              addRecentItem('page', item.id)
                            }
                            navigate(item.route)
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: item.disabled ? 'var(--text-4)' : 'var(--text-2)',
                        padding: '6px 12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: item.disabled ? 'default' : 'pointer',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: item.highlight ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!item.disabled) {
                          e.currentTarget.style.background = 'var(--bg-2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span style={{ color: item.color || 'inherit', display: 'flex', alignItems: 'center' }}>
                        <Icon size={16} style={{ flexShrink: 0 }} />
                      </span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>
                      {item.dots && <span style={{ marginLeft: 'auto' }}>...</span>}
                      {item.arrow && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        gap: '8px',
        display: 'flex',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          style={{
            flex: 1,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-2)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Plus size={14} />
          Nuevo chat
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-3)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Settings size={18} />
        </motion.button>
      </div>

    </motion.div>
  )
}
