import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  if (!isAuthenticated) {
    // Redirect based on user role if available, otherwise default to client login
    const redirectTo = user?.role === 'freelancer' ? '/seller-login' : '/client-login'
    return <Navigate to={redirectTo} replace />
  }
  
  return children
}

