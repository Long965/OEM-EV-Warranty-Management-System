import { useAuth } from '../context/AuthContext'
export default function RoleGuard({ roles, children }) {
  const { hasRole } = useAuth()
  if (!hasRole(...roles)) return null
  return <>{children}</>
}
