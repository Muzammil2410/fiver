import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'
import api from '../services/api'
import Skeleton from '../components/ui/Skeleton'

export default function WithdrawalRequests() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestingId, setRequestingId] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchEligibleOrders()
    }
  }, [user])

  const fetchEligibleOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders/withdrawal/eligible')
      if (response.data.success) {
        setOrders(response.data.data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching eligible orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestWithdrawal = async (orderId) => {
    setRequestingId(orderId)
    try {
      const response = await api.post(`/orders/${orderId}/request-withdrawal`)
      if (response.data.success) {
        toast.success('Withdrawal request submitted successfully!')
        // Remove the order from the list
        setOrders(orders.filter(order => (order._id || order.id) !== orderId))
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      toast.error(error.response?.data?.message || 'Failed to request withdrawal')
    } finally {
      setRequestingId(null)
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Request Withdrawal
              </h1>
              <p className="text-sm sm:text-base text-neutral-600">
                Request withdrawal for your completed orders
              </p>
            </div>
            {orders.length > 0 && (
              <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm sm:text-base font-bold text-primary-700">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Available
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
          <Card className="border-2 border-dashed border-neutral-300 shadow-lg">
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">No orders available for withdrawal</h3>
              <p className="text-sm sm:text-base text-neutral-600 mb-6 max-w-md mx-auto">
                Completed orders that haven't requested withdrawal will appear here.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const orderId = order._id || order.id
              return (
                <Card key={orderId} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2">
                            {order.gigTitle || `Order #${orderId?.slice(-8)}`}
                          </h3>
                          <Badge variant="success" size="sm" className="mb-2">
                            Completed
                          </Badge>
                          <div className="space-y-1 text-sm text-neutral-600">
                            <p><span className="font-medium">Buyer:</span> {order.buyerName}</p>
                            <p><span className="font-medium">Completed:</span> {formatDate(order.completedAt || order.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-neutral-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                            <p className="text-2xl font-bold text-primary-600">
                              PKR {order.amount?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRequestWithdrawal(orderId)}
                          loading={requestingId === orderId}
                          disabled={requestingId !== null}
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg"
                        >
                          Request Withdrawal
                        </Button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-6 items-center">
                      <div className="col-span-12 lg:col-span-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-neutral-900 mb-1">
                              {order.gigTitle || `Order #${orderId?.slice(-8)}`}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {order.buyerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(order.completedAt || order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-12 lg:col-span-3 text-center lg:text-left">
                        <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                          PKR {order.amount?.toLocaleString() || '0'}
                        </p>
                        <Badge variant="success" size="sm" className="mt-2">
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="col-span-12 lg:col-span-3">
                        <Button
                          onClick={() => handleRequestWithdrawal(orderId)}
                          loading={requestingId === orderId}
                          disabled={requestingId !== null}
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg font-semibold"
                        >
                          Request Withdrawal
                        </Button>
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

