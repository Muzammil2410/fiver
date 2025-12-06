import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api' || 'https://freelancer-services-platform-backend.onrender.com/api',
  timeout: 30000, // 30 seconds timeout for API calls
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // If Authorization header is already set manually, don't override it
    if (config.headers.Authorization) {
      return config
    }

    // Check if this is an admin route
    const isAdminRoute = config.url?.includes('/admin/')

    if (isAdminRoute) {
      // For admin routes, use admin-token from localStorage
      const adminToken = localStorage.getItem('admin-token')
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`
      }
    } else {
      // For regular routes, use token from auth store
      const { token } = useAuthStore.getState()
      if (token) {
        // Use JWT token directly
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if this is an admin route
    const isAdminRoute = error.config?.url?.includes('/admin/')

    if (error.response?.status === 401) {
      if (isAdminRoute) {
        // For admin routes, clear admin session and redirect to admin login
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        // Don't redirect here - let the component handle it
        return Promise.reject(error)
      } else {
        // For regular routes, clear auth state and redirect
        const { user } = useAuthStore.getState()
        const userRole = user?.role

        // Clear auth state on 401
        useAuthStore.getState().logout()

        // Redirect based on user role
        if (userRole === 'client') {
          window.location.href = '/client-login'
        } else if (userRole === 'freelancer') {
          window.location.href = '/seller-login'
        } else {
          window.location.href = '/client-login'
        }
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Example API call:
 * 
 * import api from './services/api'
 * 
 * // GET request
 * const response = await api.get('/gigs', { params: { q: 'search term' } })
 * 
 * // POST request with auth token (automatically added)
 * const response = await api.post('/orders', { gigId: 123, package: 'premium' })
 * 
 * // The token is automatically included from Zustand store
 */

export default api

