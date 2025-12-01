import api from './api'

/**
 * Chat Service - Handles all chat-related API calls
 */

// Get messages for an order
export const getMessages = async (orderId) => {
  try {
    const response = await api.get(`/chat/orders/${orderId}/messages`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch messages')
  }
}

// Create a new message
export const createMessage = async (orderId, messageData) => {
  try {
    const response = await api.post('/chat/messages', {
      orderId,
      ...messageData
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send message')
  }
}

