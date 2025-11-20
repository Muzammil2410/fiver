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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>
      
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
          {orders.map((order) => (
            <Card key={order._id || order.id}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <Link
                      to={`/orders/${order._id || order.id}`}
                      className="text-lg font-semibold text-primary-600 hover:underline"
                    >
                      {order.gigTitle || `Order #${order._id || order.id}`}
                    </Link>
                    <Badge variant={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-600 mb-2">
                    <div>
                      <span className="font-medium">Buyer:</span> {order.buyerName}
                    </div>
                    <div>
                      <span className="font-medium">Package:</span> {order.package}
                    </div>
                    <div>
                      <span className="font-medium">Ordered:</span> {formatDate(order.createdAt)}
                    </div>
                    {order.paymentUploadedAt && (
                      <div>
                        <span className="font-medium">Payment Uploaded:</span> {formatDate(order.paymentUploadedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-primary-600">
                      PKR {order.amount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  
                  {order.paymentScreenshot && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Payment Screenshot:</p>
                      <img
                        src={order.paymentScreenshot}
                        alt="Payment screenshot"
                        className="w-full max-w-md h-48 object-contain rounded-md border border-neutral-200 bg-neutral-50"
                      />
                    </div>
                  )}
                </div>
                
                {/* Order Completed Button - Show for Active, In progress, or Delivered orders */}
                <div className="flex flex-col gap-2">
                  {(order.status === 'Active' || order.status === 'In progress' || order.status === 'Delivered' || order.status === 'Payment confirmed') && (
                    <Button
                      onClick={() => handleCompleteOrder(order._id || order.id)}
                      loading={completingOrderId === (order._id || order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                    >
                      ✓ Order Completed
                    </Button>
                  )}
                  {order.status === 'Completed' && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium text-center">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  )
}

