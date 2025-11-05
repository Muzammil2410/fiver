import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_BASE || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
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
      // Clear auth state on 401
      useAuthStore.getState().logout()
      window.location.href = '/login'
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

