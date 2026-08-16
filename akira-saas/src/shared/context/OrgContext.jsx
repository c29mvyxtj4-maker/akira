import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/shared/context/AuthContext'
import { ensureOrg, getOrgMembers, getMyWorkspaces, createOrg } from '@db/queries/org.service'

var LS_KEY = 'akira-active-org'
var OrgContext = createContext(null)

export function OrgProvider({ children }) {
  var { user, isAuthenticated } = useAuth()
  var [org,        setOrg]        = useState(null)
  var [workspaces, setWorkspaces] = useState([])
  var [members,    setMembers]    = useState([])
  var [myRole,     setMyRole]     = useState('owner')
  var [loading,    setLoading]    = useState(true)

  function loadMembers(orgId, ownerId) {
    return getOrgMembers(orgId).then(function(m) {
      setMembers(m)
      var me = m.find(function(x) { return x.user_id === ownerId })
      setMyRole(me ? me.role : 'owner')
    })
  }

  useEffect(function() {
    if (!isAuthenticated || !user) { setLoading(false); return }
    setLoading(true)
    getMyWorkspaces()
      .then(function(list) {
        console.log('[OrgContext] getMyWorkspaces returned:', list)
        if (!list || list.length === 0) {
          console.log('[OrgContext] No workspaces found, creating default')
          return ensureOrg('Mi Workspace').then(function(newOrg) {
            setWorkspaces([newOrg]); setOrg(newOrg); return loadMembers(newOrg.id, user.id)
          })
        }
        console.log('[OrgContext] Setting workspaces:', list)
        setWorkspaces(list)
        var savedId = null
        try { savedId = localStorage.getItem(LS_KEY) } catch (_) { /* noop */ }
        var active = list.find(function(o) { return o.id === savedId }) || list[0]
        console.log('[OrgContext] Active workspace:', active, 'savedId:', savedId)
        setOrg(active)
        // Persistir SIEMPRE el workspace activo, para que los servicios (que leen
        // localStorage vÃ­a getActiveOrgId) puedan filtrar por Ã©l desde el arranque.
        try { if (active) localStorage.setItem(LS_KEY, active.id) } catch (_) { /* noop */ }
        return loadMembers(active.id, user.id)
      })
      .catch(function(e) { console.error('[OrgContext] Error:', e) })
      .finally(function() { setLoading(false) })
  }, [isAuthenticated, user && user.id])

  function switchWorkspace(orgId) {
    var target = workspaces.find(function(o) { return o.id === orgId })
    if (!target || (org && org.id === orgId)) return
    try { localStorage.setItem(LS_KEY, orgId) } catch (_) { /* noop */ }
    // Recargamos para que TODAS las lecturas (hooks/servicios) se rehagan con el
    // nuevo workspace. Es infrecuente y evita re-cablear cada hook.
    try { window.location.reload() } catch (_) { setOrg(target) }
  }

  function createWorkspace(name) {
    return createOrg(name || 'Nuevo espacio').then(function(newOrg) {
      try { localStorage.setItem(LS_KEY, newOrg.id) } catch (_) { /* noop */ }
      try { window.location.reload() } catch (_) { setWorkspaces(function(prev) { return prev.concat([newOrg]) }); setOrg(newOrg) }
      return newOrg
    })
  }

  function refreshOrg() {
    if (!org || !user) return
    loadMembers(org.id, user.id).catch(function(e) { console.error(e) })
  }

  return (
    <OrgContext.Provider value={{
      org:        org,
      workspaces: workspaces,
      members:    members,
      myRole:     myRole,
      loading:    loading,
      isOwner:    myRole === 'owner',
      isAdmin:    myRole === 'owner' || myRole === 'admin',
      canEdit:    myRole !== 'viewer',
      canView:    true,
      refreshOrg: refreshOrg,
      setOrg:     setOrg,
      setMembers: setMembers,
      switchWorkspace: switchWorkspace,
      createWorkspace: createWorkspace,
    }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  var ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg debe usarse dentro de OrgProvider')
  return ctx
}


