import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import * as orderService from '../../services/orders'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'
import Skeleton from '../../components/ui/Skeleton'

export default function SellerOrders() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [completingOrderId, setCompletingOrderId] = useState(null)
  
  useEffect(() => {
    fetchOrders()
    // Real-time polling every 2 seconds
    const interval = setInterval(() => {
      fetchOrders()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  const fetchOrders = async () => {
    try {
      const response = await orderService.getSellerOrders()
      // Handle different response structures
      // Backend returns: { success: true, data: { orders: [...] } }
      const orders = response?.data?.orders || response?.orders || response?.data || []
      // Ensure it's an array
      const ordersArray = Array.isArray(orders) ? orders : []
      setOrders(ordersArray)
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Only show error on initial load
      if (orders.length === 0) {
        toast.error(error.message || 'Failed to fetch orders')
        setOrders([])
      }
      // Don't clear existing orders on refresh errors
    } finally {
      setLoading(false)
    }
  }
  
  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to mark this order as completed? This will allow the client to leave a review.')) {
      return
    }
    
    setCompletingOrderId(orderId)
    try {
      await orderService.completeOrder(orderId)
      toast.success('Order marked as completed! Client can now leave a review.')
      await fetchOrders() // Refresh orders immediately
    } catch (error) {
      console.error('Error completing order:', error)
      toast.error(error.message || 'Failed to complete order')
    } finally {
      setCompletingOrderId(null)
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

  const getStatusIcon = (status) => {
    const icons = {
      'Pending payment': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Payment pending verify': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Payment confirmed': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'Active': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'In progress': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      'Delivered': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      'Completed': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Dispute': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      'Cancelled': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    }
    return icons[status] || null
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                My Orders
              </h1>
              <p className="text-neutral-600 text-sm sm:text-base">
                Manage and track all your seller orders
              </p>
            </div>
            {orders.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg border border-primary-200">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-primary-700">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
            )}
          </div>
        </div>
      
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="180px" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-dashed border-neutral-200">
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No orders yet</h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                When clients place orders for your gigs, they will appear here for easy management and tracking.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const orderId = order._id || order.id
              const canComplete = order.status === 'Active' || order.status === 'In progress' || order.status === 'Delivered' || order.status === 'Payment confirmed'
              
              return (
                <Card key={orderId} className="hover:shadow-lg transition-all duration-300 border border-neutral-200 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/orders/${orderId}`}
                            className="text-lg font-bold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-2 block mb-2"
                          >
                            {order.gigTitle || `Order #${orderId.slice(-8)}`}
                          </Link>
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant={getStatusBadge(order.status)} size="sm" className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              <span className="hidden xs:inline">{order.status}</span>
                              <span className="xs:hidden">{order.status.split(' ')[0]}</span>
                            </Badge>
                            {order.withdrawalRequested && (
                              <Badge 
                                variant={order.withdrawalStatus === 'approved' ? 'success' : order.withdrawalStatus === 'pending' ? 'warning' : 'default'} 
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                {order.withdrawalStatus === 'approved' ? '✅ Withdrawal Approved' : 
                                 order.withdrawalStatus === 'pending' ? '⏳ Withdrawal Pending' : 
                                 order.withdrawalStatus === 'rejected' ? '❌ Withdrawal Rejected' : 
                                 'Withdrawal Requested'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-3 border-t border-neutral-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {order.buyerName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-600">
                            PKR {order.amount?.toLocaleString() || 'N/A'}
                          </span>
                          {canComplete && (
                            <Button
                              onClick={() => handleCompleteOrder(orderId)}
                              loading={completingOrderId === orderId}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm px-3 py-1.5 shadow-md"
                            >
                              Complete
                            </Button>
                          )}
                          {order.status === 'Completed' && (
                            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Completed
                            </div>
                          )}
                        </div>
                        {order.paymentScreenshot && (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <p className="text-xs font-medium text-neutral-700 mb-2">Payment Screenshot:</p>
                            <img
                              src={order.paymentScreenshot}
                              alt="Payment screenshot"
                              className="w-full h-32 object-contain rounded-md border border-neutral-200 bg-neutral-50"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-6 items-center">
                      <div className="col-span-12 md:col-span-6 lg:col-span-7">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/orders/${orderId}`}
                              className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors block mb-2 line-clamp-1"
                            >
                              {order.gigTitle || `Order #${orderId.slice(-8)}`}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <Badge variant={getStatusBadge(order.status)} className="flex items-center gap-1.5">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </Badge>
                              {order.withdrawalRequested && (
                                <Badge 
                                  variant={order.withdrawalStatus === 'approved' ? 'success' : order.withdrawalStatus === 'pending' ? 'warning' : 'default'} 
                                  className="flex items-center gap-1.5"
                                >
                                  {order.withdrawalStatus === 'approved' ? '✅ Withdrawal Approved' : 
                                   order.withdrawalStatus === 'pending' ? '⏳ Withdrawal Pending' : 
                                   order.withdrawalStatus === 'rejected' ? '❌ Withdrawal Rejected' : 
                                   'Withdrawal Requested'}
                                </Badge>
                              )}
                              <span className="text-sm text-neutral-500 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {order.buyerName}
                              </span>
                              <span className="text-sm text-neutral-500 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            {order.paymentScreenshot && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-neutral-700 mb-2">Payment Screenshot:</p>
                                <img
                                  src={order.paymentScreenshot}
                                  alt="Payment screenshot"
                                  className="w-full max-w-md h-32 object-contain rounded-md border border-neutral-200 bg-neutral-50"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-12 md:col-span-3 lg:col-span-2 text-center md:text-right">
                        <div className="text-sm text-neutral-600 mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-primary-600">
                          PKR {order.amount?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="col-span-12 md:col-span-3 lg:col-span-3 flex justify-end">
                        {canComplete && (
                          <Button
                            onClick={() => handleCompleteOrder(orderId)}
                            loading={completingOrderId === orderId}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Completed
                          </Button>
                        )}
                        {order.status === 'Completed' && (
                          <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </div>
                        )}
                        {!canComplete && order.status !== 'Completed' && (
                          <Link to={`/orders/${orderId}`}>
                            <Button variant="ghost" className="text-primary-600 hover:bg-primary-50">
                              View Details
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}


