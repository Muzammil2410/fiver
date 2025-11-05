import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function RequireAdmin({ children }) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}

