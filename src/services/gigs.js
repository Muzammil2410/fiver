import api from './api'

/**
 * Gig Service - Handles all gig-related API calls
 */

// Create a new gig
export const createGig = async (gigData) => {
  try {
    const response = await api.post('/gigs', gigData)
    return response.data
  } catch (error) {
    // Re-throw error with proper message
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create gig'
    )
  }
}

// Get all gigs with optional filters
export const getAllGigs = async (params = {}) => {
  try {
    const response = await api.get('/gigs', { params })
    
    // Normalize response structure to handle different API response formats
    if (response.data?.success !== undefined) {
      // API returns { success: true, data: { gigs: [...] } }
      return response.data
    } else if (response.data?.data) {
      // API returns { data: { gigs: [...] } }
      return response.data
    } else if (Array.isArray(response.data)) {
      // API returns array directly
      return { 
        success: true,
        data: { 
          gigs: response.data,
          pagination: { hasMore: false }
        } 
      }
    }
    
    // Default: return response as is
    return response.data
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching gigs from API:', error)
    
    // Re-throw error so caller can handle it
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch gigs from server'
    )
  }
}

// Get single gig by ID
export const getGigById = async (id) => {
  try {
    const response = await api.get(`/gigs/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch gig')
  }
}

// Update gig
export const updateGig = async (id, gigData) => {
  try {
    const response = await api.put(`/gigs/${id}`, gigData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update gig')
  }
}

// Delete gig
export const deleteGig = async (id) => {
  try {
    const response = await api.delete(`/gigs/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete gig')
  }
}

// Toggle gig active status
export const toggleGigStatus = async (id) => {
  try {
    const response = await api.patch(`/gigs/${id}/toggle`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle gig status')
  }
}
