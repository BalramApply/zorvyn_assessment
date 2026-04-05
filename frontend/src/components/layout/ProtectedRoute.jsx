import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole) {
    const hierarchy = { viewer: 1, analyst: 2, admin: 3 }
    if ((hierarchy[user.role] ?? 0) < (hierarchy[requiredRole] ?? 0)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export const GuestOnly = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}