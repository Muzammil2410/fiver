import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import localStorageService from '../../utils/localStorage'
import * as orderService from '../../services/orders'

export default function SellerDashboard() {
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
    // Real-time polling every 2 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchRecentOrders()
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const response = await localStorageService.dashboard.getSeller()
      setStats(response.data.stats || stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }
  
  const fetchRecentOrders = async () => {
    try {
      const response = await orderService.getSellerOrders()
      // Handle different response structures
      const orders = response?.data?.orders || response?.orders || response?.data || []
      // Ensure it's an array
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
      // Don't show error toast for background updates
      setRecentOrders([])
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Seller Dashboard</h1>
          <p className="text-neutral-600">Monitor your orders and earnings in real-time</p>
        </div>
        <Link to="/create-gig">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all">
            Create Gig
          </Button>
        </Link>
      </div>
      
      {/* Summary Cards - Beautiful Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Active Orders
            </h3>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-900">{stats.activeOrders}</p>
          <p className="text-xs text-blue-600 mt-2">Orders in progress</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Completed Orders
            </h3>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-900">{stats.completedOrders}</p>
          <p className="text-xs text-green-600 mt-2">Successfully delivered</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
              Earnings (Month)
            </h3>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-purple-900">
            PKR {stats.earnings.toLocaleString()}
          </p>
          <p className="text-xs text-purple-600 mt-2">This month's revenue</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
              Pending Withdrawals
            </h3>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-orange-900">
            PKR {stats.pendingWithdrawals.toLocaleString()}
          </p>
          <p className="text-xs text-orange-600 mt-2">Awaiting withdrawal</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
              Average Rating
            </h3>
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-yellow-900">
            {stats.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-yellow-600 mt-2">Out of 5.0 stars</p>
        </Card>
      </div>
      
      {/* Recent Orders - Beautiful Design */}
      <Card className="mb-6 shadow-lg border-2 border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Recent Orders</h2>
            <p className="text-sm text-neutral-600 mt-1">Latest orders from your clients</p>
          </div>
          <Link 
            to="/seller/orders" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-white via-neutral-50 to-white rounded-xl border-2 border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {order.gigTitle || `Order #${orderId?.slice(-6)}`}
                        </p>
                        <Badge variant={getStatusBadge(order.status)} size="sm">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {order.buyerName || 'Client'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="text-right">
                    <p className="font-bold text-2xl text-primary-600 mb-1">PKR {order.amount?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-neutral-500">Package: {order.package || 'Standard'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
      
      {/* Shortcuts - Beautiful Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link to="/gigs" className="group">
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
        
        <Link to="/wallet" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-green-900 mb-1">Wallet</h3>
              <p className="text-sm text-green-700">Manage earnings</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>
        </Link>
        
        <Link to="/analytics" className="group">
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-orange-900 mb-1">Analytics</h3>
              <p className="text-sm text-orange-700">View insights</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>
        </Link>
      </div>
    </MainLayout>
  )
}

