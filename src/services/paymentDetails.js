import api from './api'

/**
 * Payment Details Service - Handles payment details API calls
 */

// Get payment details by user ID
export const getPaymentDetailsByUserId = async (userId) => {
  try {
    console.log('📡 API Call: GET /payment-details/user/' + userId)
    const response = await api.get(`/payment-details/user/${userId}`)
    console.log('📥 API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ API Error:', error)
    console.error('❌ Status:', error.response?.status)
    console.error('❌ Data:', error.response?.data)
    
    // If not found, return null instead of throwing
    if (error.response?.status === 404) {
      return { success: false, data: null, message: 'Payment details not found' }
    }
    
    // Network error or other issues
    if (!error.response) {
      console.error('❌ Network error - backend server might not be running')
      return { success: false, data: null, message: 'Backend server not reachable' }
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch payment details')
  }
}

// Save payment details
export const savePaymentDetails = async (paymentDetails) => {
  try {
    const response = await api.post('/payment-details', paymentDetails)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save payment details')
  }
}

