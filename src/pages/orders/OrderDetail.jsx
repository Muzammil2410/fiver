import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ReviewForm from '../../components/reviews/ReviewForm'
import ChatWindow from '../../components/chat/ChatWindow'
import * as orderService from '../../services/orders'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'
import * as reviewService from '../../services/reviews'
import Skeleton from '../../components/ui/Skeleton'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [confirmingCompletion, setConfirmingCompletion] = useState(false)
  const [existingReview, setExistingReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  useEffect(() => {
    fetchOrder()
    // Real-time polling every 2 seconds
    const interval = setInterval(() => {
      fetchOrder()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [id])
  
  useEffect(() => {
    if (order && order.status === 'Completed' && (!user?.role || user?.role === 'client')) {
      // Only check review if client has confirmed completion
      if (order.clientConfirmedCompletionAt) {
        checkReview()
      } else {
        setShowReviewForm(false)
      }
    }
  }, [order, user])
  
  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderById(id)
      setOrder(response.data)
      
      // Check if review exists and show form if order is completed
      if (response.data.status === 'Completed') {
        await checkReview()
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error(error.message || 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }
  
  const checkReview = async () => {
    try {
      const reviewResponse = await reviewService.getReviewByOrderId(id)
      if (reviewResponse.data) {
        setExistingReview(reviewResponse.data)
        setShowReviewForm(false)
      } else {
        setShowReviewForm(true)
      }
    } catch (error) {
      console.error('Error checking review:', error)
    }
  }
  
  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    checkReview()
  }
  
  const handleConfirmPayment = async () => {
    if (!window.confirm('Are you sure you want to confirm this payment? This will change the order status to "Payment confirmed".')) {
      return
    }
    
    setConfirming(true)
    try {
      await orderService.updateOrder(id, {
        status: 'Payment confirmed',
        paymentVerifiedAt: new Date().toISOString()
      })
      toast.success('Payment confirmed successfully!')
      await fetchOrder() // Refresh order data
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast.error(error.message || 'Failed to confirm payment')
    } finally {
      setConfirming(false)
    }
  }
  
  const handleConfirmCompletion = async () => {
    if (!window.confirm('Are you sure you want to confirm this order as completed? You will then be able to leave a review.')) {
      return
    }
    
    setConfirmingCompletion(true)
    try {
      await orderService.confirmCompletion(id)
      toast.success('Order completion confirmed! You can now leave a review.')
      await fetchOrder() // Refresh order data
    } catch (error) {
      console.error('Error confirming completion:', error)
      toast.error(error.message || 'Failed to confirm completion')
    } finally {
      setConfirmingCompletion(false)
    }
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const calculateCompletionDate = () => {
    if (!order || !order.deliveryTime) return null
    const orderDate = new Date(order.createdAt)
    const completionDate = new Date(orderDate.getTime() + (order.deliveryTime * 24 * 60 * 60 * 1000))
    return completionDate
  }
  
  if (loading) {
    return (
      <MainLayout>
        <Skeleton variant="rectangular" height="400px" />
      </MainLayout>
    )
  }
  
  if (!order) {
    return (
      <MainLayout>
        <Card>
          <p>Order not found</p>
        </Card>
      </MainLayout>
    )
  }
  
  const isSeller = user?.id === order.sellerId || user?.id === String(order.sellerId)
  const completionDate = calculateCompletionDate()
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{order.gigTitle}</h2>
                <Badge variant={getStatusBadge(order.status)} size="lg">
                  {order.status}
                </Badge>
              </div>
              {isSeller && order.status === 'Payment pending verify' && (
                <Button
                  onClick={handleConfirmPayment}
                  loading={confirming}
                  className="bg-success-600 hover:bg-success-700"
                >
                  Confirm Payment
                </Button>
              )}
            </div>
          </Card>
          
          {/* Order Information */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Order ID</p>
                <p className="font-semibold">{order._id || order.id}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Package</p>
                <p className="font-semibold capitalize">{order.package}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Amount</p>
                <p className="text-lg font-bold text-primary-600">
                  PKR {order.amount?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Order Created</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              {completionDate && (
                <div>
                  <p className="text-sm text-neutral-600">Expected Completion</p>
                  <p className="font-semibold">{formatDate(completionDate.toISOString())}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    ({order.deliveryTime} days from order date)
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Client Requirements - Only visible to seller */}
          {isSeller && order.requirements && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Client Requirements</h2>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-neutral-700 whitespace-pre-line">
                  {order.requirements}
                </p>
              </div>
            </Card>
          )}
          
          {/* Payment Screenshot - Only visible to seller */}
          {isSeller && order.paymentScreenshot && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Payment Screenshot</h2>
              <div className="bg-neutral-50 rounded-lg p-4">
                <img
                  src={order.paymentScreenshot}
                  alt="Payment screenshot"
                  className="w-full max-w-2xl h-auto rounded-md border border-neutral-200"
                />
              </div>
              {order.paymentUploadedAt && (
                <p className="text-sm text-neutral-500 mt-2">
                  Uploaded: {formatDate(order.paymentUploadedAt)}
                </p>
              )}
            </Card>
          )}
          
          {/* Buyer/Seller Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isSeller ? 'Buyer Information' : 'Seller Information'}
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-neutral-600">Name</p>
                <p className="font-semibold">
                  {isSeller ? order.buyerName : order.sellerName}
                </p>
              </div>
            </div>
          </Card>
          
          {/* Confirm Completion Button - Show when order is completed but not confirmed by client */}
          {!isSeller && order.status === 'Completed' && !order.clientConfirmedCompletionAt && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-neutral-900">Confirm Order Completion</h2>
                  <p className="text-sm text-neutral-600">Please confirm that the work has been completed to your satisfaction. After confirmation, you'll be able to leave a review.</p>
                </div>
              </div>
              <Button
                onClick={handleConfirmCompletion}
                loading={confirmingCompletion}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Completion
              </Button>
            </Card>
          )}
          
          {/* Review Form - Show when order is completed, confirmed by client, and no review exists */}
          {!isSeller && order.status === 'Completed' && order.clientConfirmedCompletionAt && showReviewForm && !existingReview && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Leave a Review</h2>
                  <p className="text-sm text-neutral-600">Share your experience with this seller</p>
                </div>
              </div>
              <ReviewForm orderId={id} onSuccess={handleReviewSuccess} />
            </Card>
          )}
          
          {/* Leave Review Button - Show when order is confirmed but review form is not shown */}
          {!isSeller && order.status === 'Completed' && order.clientConfirmedCompletionAt && !showReviewForm && !existingReview && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Ready to Leave a Review?</h2>
                    <p className="text-sm text-neutral-600">Share your experience with this seller</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Leave Review
                </Button>
              </div>
            </Card>
          )}
          
          {/* Review Submitted Message */}
          {!isSeller && order.status === 'Completed' && existingReview && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Review Submitted</h2>
                  <p className="text-sm text-green-700">Thank you for your feedback!</p>
                  <div className="mt-2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < existingReview.rating ? 'text-yellow-500' : 'text-neutral-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Chat Window - Available for both buyer and seller */}
          {order && (order.status !== 'Cancelled') && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Order Chat</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Communicate with {isSeller ? 'the buyer' : 'the seller'} about this order
              </p>
              <ChatWindow orderId={order._id || order.id} />
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

