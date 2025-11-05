import api from './api'

/**
 * Fetch user's orders
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getOrders = async (params = {}) => {
  return api.get('/orders', { params })
}

/**
 * Fetch single order by ID
 * @param {string|number} id - Order ID
 * @returns {Promise} API response
 */
export const getOrder = async (id) => {
  return api.get(`/orders/${id}`)
}

/**
 * Create a new order
 * @param {Object} orderData - Order data (gigId, package, etc.)
 * @returns {Promise} API response
 */
export const createOrder = async (orderData) => {
  return api.post('/orders', orderData)
}

/**
 * Update order status
 * @param {string|number} id - Order ID
 * @param {Object} updateData - Update data
 * @returns {Promise} API response
 */
export const updateOrder = async (id, updateData) => {
  return api.put(`/orders/${id}`, updateData)
}

/**
 * Get order messages
 * @param {string|number} orderId - Order ID
 * @returns {Promise} API response
 */
export const getOrderMessages = async (orderId) => {
  return api.get(`/orders/${orderId}/messages`)
}

/**
 * Send message to order
 * @param {string|number} orderId - Order ID
 * @param {FormData} formData - Message data (text, attachments)
 * @returns {Promise} API response
 */
export const sendOrderMessage = async (orderId, formData) => {
  return api.post(`/orders/${orderId}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

