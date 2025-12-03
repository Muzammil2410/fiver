import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout for API calls (reduced for faster failure detection)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      // Use JWT token directly
      config.headers.Authorization = `Bearer ${token}`
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
    if (error.response?.status === 401) {
      // Get user role before clearing auth state
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

