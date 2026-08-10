import { createContext, useState, useCallback } from 'react'

export const TabsContext = createContext()

export function TabsProvider({ children }) {
  const [tabs, setTabs] = useState([
    { id: 'home', label: 'Inicio', route: '/' },
  ])
  const [activeTabId, setActiveTabId] = useState('home')

  const addTab = useCallback((label, route) => {
    const id = `tab-${Date.now()}`
    setTabs((prev) => [...prev, { id, label, route }])
    setActiveTabId(id)
  }, [])

  const closeTab = useCallback((id) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id))
    setActiveTabId((prev) => (prev === id ? tabs[0]?.id : prev))
  }, [tabs])

  const switchTab = useCallback((id) => {
    setActiveTabId(id)
  }, [])

  return (
    <TabsContext.Provider value={{ tabs, activeTabId, addTab, closeTab, switchTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = window.React?.useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within TabsProvider')
  }
  return context
}
