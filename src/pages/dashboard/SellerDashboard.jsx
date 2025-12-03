import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import localStorageService from '../../utils/localStorage'
import * as orderService from '../../services/orders'
import * as reviewService from '../../services/reviews'
import * as gigService from '../../services/gigs'
import { useAuthStore } from '../../store/useAuthStore'

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    earnings: 0,
    pendingWithdrawals: 0,
    averageRating: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  
  useEffect(() => {
    fetchDashboardData()
    fetchRecentOrders()
    fetchAverageRating()
    // Real-time polling every 2 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchRecentOrders()
      fetchAverageRating()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [user?.id])
  
  // Calculate real-time stats from orders
  const calculateStatsFromOrders = (orders) => {
    const activeStatuses = ['Active', 'In progress', 'Delivered', 'Payment confirmed']
    
    const activeOrders = orders.filter(order => 
      activeStatuses.includes(order.status)
    ).length
    
    const completedOrders = orders.filter(order => 
      order.status === 'Completed'
    ).length
    
    // Calculate earnings from completed orders this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyEarnings = orders
      .filter(order => {
        if (order.status !== 'Completed') return false
        const orderDate = new Date(order.completedAt || order.createdAt)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })
      .reduce((sum, order) => sum + (order.amount || 0), 0)
    
    // Calculate pending withdrawals (completed orders not yet withdrawn)
    const pendingWithdrawals = orders
      .filter(order => order.status === 'Completed')
      .reduce((sum, order) => sum + (order.amount || 0), 0)
    
    return {
      activeOrders,
      completedOrders,
      earnings: monthlyEarnings,
      pendingWithdrawals
    }
  }
  
  const fetchDashboardData = async () => {
    try {
      // Fetch orders to calculate real-time stats
      const ordersResponse = await orderService.getSellerOrders()
      const orders = ordersResponse?.data?.orders || ordersResponse?.orders || ordersResponse?.data || []
      const ordersArray = Array.isArray(orders) ? orders : []
      
      // Calculate stats from actual orders
      const calculatedStats = calculateStatsFromOrders(ordersArray)
      
      setStats(prevStats => ({
        ...prevStats,
        ...calculatedStats,
        // Keep averageRating from real-time fetch
        averageRating: prevStats.averageRating
      }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }
  
  // Fetch real-time average rating from all reviews for seller's gigs
  const fetchAverageRating = async () => {
    try {
      if (!user?.id) return
      
      // Get all seller's gigs
      const gigsResponse = await gigService.getAllGigs({ sellerId: user.id })
      const gigs = gigsResponse.data?.gigs || []
      
      if (gigs.length === 0) {
        setStats(prev => ({ ...prev, averageRating: 0 }))
        return
      }
      
      // Get all reviews for all seller's gigs
      const allReviews = []
      for (const gig of gigs) {
        const gigId = gig._id || gig.id
        if (gigId) {
          try {
            const reviewResponse = await reviewService.getReviewsByGigId(gigId)
            const reviews = reviewResponse.data?.reviews || []
            allReviews.push(...reviews)
          } catch (error) {
            // Silently continue if review fetch fails for a gig
          }
        }
      }
      
      // Calculate average rating from all reviews
      const averageRating = allReviews.length > 0
        ? allReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / allReviews.length
        : 0
      
      setStats(prev => ({ ...prev, averageRating }))
    } catch (error) {
      // Silently fail - don't break dashboard if rating fetch fails
    }
  }
  
  const fetchRecentOrders = async () => {
    try {
      const response = await orderService.getSellerOrders()
      const orders = response?.data?.orders || response?.orders || response?.data || []
      const ordersArray = Array.isArray(orders) ? orders : []
      
      // Get the 5 most recent orders
      const sortedOrders = ordersArray
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateB - dateA
        })
        .slice(0, 5)
      setRecentOrders(sortedOrders)
    } catch (error) {
      console.error('Error fetching recent orders:', error)
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
  
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Seller Dashboard</h1>
          <p className="text-sm sm:text-base text-neutral-600">Monitor your orders and earnings in real-time</p>
        </div>
        <Link to="/create-gig" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
            Create Gig
          </Button>
        </Link>
      </div>
      
      {/* Summary Cards - Beautiful Design with Real-time Updates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-2 border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                Active Orders
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-1 transition-all duration-300">
              {stats.activeOrders}
            </p>
            <p className="text-xs font-medium text-blue-700 mt-2">Orders in progress</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-2 border-green-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide">
                Completed Orders
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-extrabold text-green-900 mb-1 transition-all duration-300">
              {stats.completedOrders}
            </p>
            <p className="text-xs font-medium text-green-700 mt-2">Successfully delivered</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-2 border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                Earnings (Month)
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-purple-900 transition-all duration-300">
              PKR {stats.earnings.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-purple-700 mt-2">This month's revenue</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-2 border-orange-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">
                Pending Withdrawals
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-orange-900 transition-all duration-300">
              PKR {stats.pendingWithdrawals.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-orange-700 mt-2">Awaiting withdrawal</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-2 border-yellow-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">
                Average Rating
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-yellow-900 transition-all duration-300">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
              </p>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stats.averageRating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-yellow-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-xs font-medium text-yellow-700 mt-2">Out of 5.0 stars</p>
          </div>
        </Card>
      </div>
      
      {/* Recent Orders - Beautiful Design */}
      <Card className="mb-6 shadow-lg border-2 border-neutral-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Recent Orders</h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">Latest orders from your clients</p>
          </div>
          <Link 
            to="/seller/orders" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium">No recent orders</p>
            <p className="text-sm text-neutral-500 mt-2">Orders will appear here once clients place them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const orderId = order._id || order.id
              return (
                <Link
                  key={orderId}
                  to={`/orders/${orderId}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-white via-neutral-50 to-white rounded-xl border-2 border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                        <p className="font-bold text-base sm:text-lg text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                          {order.gigTitle || `Order #${orderId?.slice(-6)}`}
                        </p>
                        <Badge variant={getStatusBadge(order.status)} size="sm" className="self-start sm:self-center">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {order.buyerName || 'Client'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <p className="font-bold text-xl sm:text-2xl text-primary-600 mb-1">PKR {order.amount?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-neutral-500">Package: {order.package || 'Standard'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
      
      {/* Shortcuts - Beautiful Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Link to="/seller-gigs" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100 to-purple-50 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-indigo-900 mb-1">My Gigs</h3>
              <p className="text-sm text-indigo-700">Manage your services</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>
        </Link>
        
        <Link to="/seller/orders" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-blue-900 mb-1">Orders</h3>
              <p className="text-sm text-blue-700">View all orders</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>
        </Link>
      </div>
    </MainLayout>
  )
}

