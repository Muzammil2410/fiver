import api from './api'

/**
 * Create payment record
 * @param {Object} paymentData - Payment data (orderId, method, transactionId, etc.)
 * @returns {Promise} API response
 */
export const createPayment = async (paymentData) => {
  return api.post('/payments', paymentData)
}

/**
 * Upload payment file
 * @param {File} file - Payment screenshot/image
 * @returns {Promise} API response with file URL
 */
export const uploadPaymentFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * Get payment status
 * @param {string|number} paymentId - Payment ID
 * @returns {Promise} API response
 */
export const getPayment = async (paymentId) => {
  return api.get(`/payments/${paymentId}`)
}

