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
      gigId: order.gigId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      isPublic: reviewData.isPublic !== false,
    }
    
    // For now, store in localStorage (since there's no review API endpoint)
    // In the future, this would be: await api.post('/reviews', reviewPayload)
    const localStorageService = await import('../utils/localStorage')
    const result = await localStorageService.default.reviews.createWithOrder(orderId, order, reviewData)
    
    return result
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create review')
  }
}

// Get reviews by gig ID
export const getReviewsByGigId = async (gigId) => {
  try {
    // For now, use localStorage (since there's no review API endpoint)
    // In the future, this would be: await api.get(`/reviews/gig/${gigId}`)
    const localStorageService = await import('../utils/localStorage')
    return await localStorageService.default.reviews.getByGigId(gigId)
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews')
  }
}

// Get review by order ID
export const getReviewByOrderId = async (orderId) => {
  try {
    // For now, use localStorage (since there's no review API endpoint)
    const localStorageService = await import('../utils/localStorage')
    return await localStorageService.default.reviews.getByOrderId(orderId)
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch review')
  }
}



