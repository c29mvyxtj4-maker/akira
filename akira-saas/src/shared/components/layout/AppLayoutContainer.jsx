import { Outlet, useLocation } from 'react-router-dom'
import AppLayout from './AppLayout'
import PageContent from './PageContent'

export const AppLayoutContainer = () => {
  const location = useLocation()
  const isInicio = location.pathname === '/inicio' || location.pathname === '/'

  // Inicio no usa AppLayout (tiene su propio layout personalizado)
  if (isInicio) {
    return <Outlet />
  }

  return (
    <AppLayout>
      <PageContent>
        <Outlet />
      </PageContent>
    </AppLayout>
  )
}
