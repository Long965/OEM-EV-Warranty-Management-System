import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  const loc = useLocation()

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }

  // Admin-only route but user is not Admin → redirect to dashboard
  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return children
}