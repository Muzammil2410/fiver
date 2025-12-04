import api from './api'

/**
 * Order Service - Handles all order-related API calls
 */

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order')
  }
}

// Get all orders (filtered by user role)
export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders')
  }
}

// Get single order by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order')
  }
}

// Update order
export const updateOrder = async (id, orderData) => {
  try {
    const response = await api.put(`/orders/${id}`, orderData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order')
  }
}

// Get seller's orders
export const getSellerOrders = async () => {
  try {
    const response = await api.get('/orders/seller')
    // Normalize response structure
    if (response.data?.success !== undefined) {
      return response.data
    } else if (response.data?.data) {
      return response.data
    }
    return response.data
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch seller orders'
    )
  }
}

// Confirm payment (seller only)
export const confirmPayment = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}`, {
      status: 'Payment confirmed',
      paymentVerifiedAt: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to confirm payment')
  }
}

// Complete order (seller only) - marks order as completed and enables review
export const completeOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}`, {
      status: 'Completed',
      completedAt: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to complete order')
  }
}

// Confirm completion (client only) - client confirms that order is completed
export const confirmCompletion = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}`, {
      confirmCompletion: true
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to confirm completion')
  }
}