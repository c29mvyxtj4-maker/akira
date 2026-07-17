import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMyOrg, ensureOrg, getOrgMembers } from '@/services/org.service'

var OrgContext = createContext(null)

export function OrgProvider({ children }) {
  var { user, profile, isAuthenticated } = useAuth()
  var [org,     setOrg]     = useState(null)
  var [members, setMembers] = useState([])
  var [myRole,  setMyRole]  = useState('owner')
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)

    getMyOrg()
      .then(function(existingOrg) {
        if (existingOrg) {
          setOrg(existingOrg)
          return getOrgMembers(existingOrg.id)
            .then(function(membersData) {
              setMembers(membersData)
              var me = membersData.find(function(m) { return m.user_id === user.id })
              if (me) setMyRole(me.role)
            })
        } else {
          var name = 'Mi Workspace'
          return ensureOrg(name)
            .then(function(newOrg) {
              setOrg(newOrg)
              return getOrgMembers(newOrg.id)
            })
            .then(function(membersData) {
              setMembers(membersData)
              setMyRole('owner')
            })
        }
      })
      .catch(function(e) {
        console.error('[OrgContext] error:', e)
      })
      .finally(function() {
        setLoading(false)
      })
  }, [isAuthenticated, user && user.id])

  function refreshOrg() {
    if (!org) return
    getOrgMembers(org.id)
      .then(function(data) { setMembers(data) })
      .catch(function(e) { console.error(e) })
  }

  return (
    <OrgContext.Provider value={{
      org:        org,
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