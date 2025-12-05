import api from './api'

/**
 * Wallet Service - Handles all wallet-related API calls
 */

// Get wallet balance and transactions
export const getWallet = async () => {
  try {
    const response = await api.get('/wallet')
    return response.data
  } catch (error) {
    console.error('Wallet API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch wallet data'
    )
  }
}

