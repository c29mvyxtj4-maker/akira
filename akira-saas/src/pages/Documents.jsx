import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

export default function Documents() {
  // Redirect to invoices page
  return <Navigate to={ROUTES.INVOICES} replace />
}
