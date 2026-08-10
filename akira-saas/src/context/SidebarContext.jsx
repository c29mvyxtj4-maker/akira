import { createContext, useState, useCallback } from 'react'

export const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true)
  }, [])

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false)
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, collapseSidebar, expandSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext ? React.useContext(SidebarContext) : null
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
