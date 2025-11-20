import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ReviewForm from '../../components/reviews/ReviewForm'
import * as orderService from '../../services/orders'
import { useAuthStore } from '../../store/useAuthStore'
import * as reviewService from '../../services/reviews'
import Skeleton from '../../components/ui/Skeleton'

export default function OrdersList() {
  const user = useAuthStore((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState({}) // Store reviews by orderId
  const [showReviewForOrder, setShowReviewForOrder] = useState(null)
  
  useEffect(() => {
    if (user?.id) {
      fetchOrders()
      // Poll for real-time updates every 2 seconds
      const interval = setInterval(() => {
        fetchOrders()
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [user])
  
  useEffect(() => {
    // Check reviews for completed orders
    orders.forEach(async (order) => {
      if (order.status === 'Completed' && !reviews[order.id || order._id]) {
        try {
          const reviewResponse = await reviewService.getReviewByOrderId(order.id || order._id)
          if (reviewResponse.data) {
            setReviews(prev => ({
              ...prev,
              [order.id || order._id]: reviewResponse.data
            }))
          }
        } catch (error) {
          console.error('Error checking review:', error)
        }
      }
    })
  }, [orders])
  
  const fetchOrders = async () => {
    try {
      const response = await orderService.getAllOrders({ role: 'buyer' })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Fallback to empty array if API fails
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleReviewSuccess = (orderId) => {
    setShowReviewForOrder(null)
    fetchOrders()
  }
  
  const getStatusBadge = (status) => {
    const variants = {
      'Pending payment': 'warning',
      'Payment pending verify': 'warning',
      'Payment confirmed': 'success',
      'Active': 'primary',
      'In progress': 'primary',
      'Delivered': 'success',
      'Completed': 'success',
      'Dispute': 'danger',
      'Cancelled': 'default',
    }
    return variants[status] || 'default'
  }
  
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="150px" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <p className="text-center text-neutral-600 py-8">
            You don't have any orders yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order._id || order.id
            const hasReview = reviews[orderId]
            const isCompleted = order.status === 'Completed'
            const showReview = showReviewForOrder === orderId && !hasReview
            
            return (
              <div key={orderId} className="space-y-3">
                <Card>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Link
                          to={`/orders/${orderId}`}
                          className="text-lg font-semibold text-primary-600 hover:underline"
                        >
                          {order.gigTitle || `Order #${orderId}`}
                        </Link>
                        <Badge variant={getStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        PKR {order.amount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    {isCompleted && !hasReview && !showReview && (
                      <Button
                        onClick={() => setShowReviewForOrder(orderId)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Leave Review
                      </Button>
                    )}
                    {isCompleted && hasReview && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                        ✓ Review Submitted
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Review Form - Show when order is completed and no review exists */}
                {showReview && (
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">Leave a Review</h3>
                        <p className="text-sm text-neutral-600">Share your experience with this seller</p>
                      </div>
                    </div>
                    <ReviewForm orderId={orderId} onSuccess={() => handleReviewSuccess(orderId)} />
                    <Button
                      variant="ghost"
                      onClick={() => setShowReviewForOrder(null)}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      )}
    </MainLayout>
  )
}

