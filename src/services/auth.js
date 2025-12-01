import api from './api'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

// Get current user
export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData)
  return response.data
}

// Check username availability
export const checkUsernameAvailability = async (username) => {
  const response = await api.get(`/auth/username/${encodeURIComponent(username)}`)
  return response.data
}

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData)
  return response.data
}

