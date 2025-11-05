import api from './api'

/**
 * Fetch gigs with optional filters
 * @param {Object} params - Query parameters (q, category, minPrice, maxPrice, sort, etc.)
 * @returns {Promise} API response
 */
export const getGigs = async (params = {}) => {
  return api.get('/gigs', { params })
}

/**
 * Fetch single gig by ID
 * @param {string|number} id - Gig ID
 * @returns {Promise} API response
 */
export const getGig = async (id) => {
  return api.get(`/gigs/${id}`)
}

/**
 * Create a new gig
 * @param {Object} gigData - Gig data (title, description, price, etc.)
 * @returns {Promise} API response
 */
export const createGig = async (gigData) => {
  return api.post('/gigs', gigData)
}

/**
 * Update a gig
 * @param {string|number} id - Gig ID
 * @param {Object} gigData - Updated gig data
 * @returns {Promise} API response
 */
export const updateGig = async (id, gigData) => {
  return api.put(`/gigs/${id}`, gigData)
}

/**
 * Delete a gig
 * @param {string|number} id - Gig ID
 * @returns {Promise} API response
 */
export const deleteGig = async (id) => {
  return api.delete(`/gigs/${id}`)
}

