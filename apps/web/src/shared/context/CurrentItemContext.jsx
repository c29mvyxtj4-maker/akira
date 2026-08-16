import { createContext, useContext, useState } from 'react'

/**
 * Context para rastrear el item actual que se está viendo
 * Permite que el Topbar y otros componentes sepan qué item está abierto
 */
const CurrentItemContext = createContext()

export function CurrentItemProvider({ children }) {
  const [currentItem, setCurrentItem] = useState({
    type: null,  // 'client', 'project', 'invoice', 'quote', etc.
    id: null,
    name: ''
  })

  return (
    <CurrentItemContext.Provider value={{ currentItem, setCurrentItem }}>
      {children}
    </CurrentItemContext.Provider>
  )
}

export function useCurrentItem() {
  const context = useContext(CurrentItemContext)
  if (!context) {
    return {
      currentItem: { type: null, id: null, name: '' },
      setCurrentItem: () => {}
    }
  }
  return context
}
