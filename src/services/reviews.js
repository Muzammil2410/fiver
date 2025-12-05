import api from './api'
import * as orderService from './orders'

/**
 * Review Service - Handles all review-related API calls
 * Uses real-time order data from API
 */

// Create a new review
export const createReview = async (orderId, reviewData) => {
  try {
    // First, fetch the order from API to get real-time data
    const orderResponse = await orderService.getOrderById(orderId)
    const order = orderResponse.data
    
    if (!order) {
      throw new Error('Order not found')
    }
    
    if (!order.gigId) {
      throw new Error('Gig ID not found in order')
    }
    
    // Create review data with order information
    const reviewPayload = {
      orderId: orderId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      isPublic: reviewData.isPublic !== false,
    }
    
    // Store review in database via API
    const response = await api.post('/reviews', reviewPayload)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create review')
  }
}

// Get reviews by gig ID (public reviews - no auth required)
export const getReviewsByGigId = async (gigId) => {
  try {
    // Fetch reviews from database API
    const response = await api.get(`/reviews/gig/${gigId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews')
  }
}

// Get review by order ID
export const getReviewByOrderId = async (orderId) => {
  try {
    // Fetch review from database API
    const response = await api.get(`/reviews/order/${orderId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch review')
  }
}




