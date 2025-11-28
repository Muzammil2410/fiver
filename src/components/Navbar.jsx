import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import * as orderService from '../services/orders'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const notificationMenuRef = useRef(null)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const notifications = useNotificationStore((state) => state.notifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  
  const handleLogout = () => {
    const userRole = user?.role
    logout()
    setUserMenuOpen(false)
    
    // Redirect based on user role
    if (userRole === 'client') {
      navigate('/client-login')
    } else if (userRole === 'freelancer') {
      navigate('/seller-login')
    } else {
      navigate('/')
    }
  }
  
  const isActive = (path) => location.pathname === path
  
  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false)
      }
    }
    
    if (notificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationMenuOpen])
  
  // Poll for new orders if user is a seller
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'freelancer') return
    
    // Get the most recent notification time to check for new orders
    const getLastNotificationTime = () => {
      const notificationStore = useNotificationStore.getState()
      const orderNotifications = notificationStore.notifications
        .filter(n => n.type === 'order')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      if (orderNotifications.length > 0) {
        return new Date(orderNotifications[0].createdAt).getTime()
      }
      return Date.now() - 60000 // Check last minute if no notifications
    }
    
    let lastOrderCheck = getLastNotificationTime()
    
    const checkNewOrders = async () => {
      try {
        const response = await orderService.getSellerOrders()
        const orders = response.data?.orders || response.data?.data?.orders || []
        
        // Get seller's ID
        const sellerId = user?.id
        
        // Check for new orders since last check
        const newOrders = orders.filter(order => {
          const orderTime = new Date(order.createdAt || 0).getTime()
          return (order.sellerId === sellerId || String(order.sellerId) === String(sellerId)) && orderTime > lastOrderCheck
        })
        
        // Add notifications for new orders
        newOrders.forEach(order => {
          const notificationStore = useNotificationStore.getState()
          const existingNotification = notificationStore.notifications.find(
            n => n.orderId === (order._id || order.id) && n.type === 'order'
          )
          
          if (!existingNotification) {
            notificationStore.addNotification({
              id: `order-${order._id || order.id}-${Date.now()}`,
              type: 'order',
              message: `${order.buyerName || 'A client'} has placed an order for ${order.gigTitle || 'your gig'}`,
              clientName: order.buyerName || 'A client',
              gigTitle: order.gigTitle || 'your gig',
              orderId: order._id || order.id,
              read: false,
              createdAt: order.createdAt || new Date().toISOString(),
              redirectTo: '/seller/orders'
            })
            
            // Update last check time
            lastOrderCheck = Math.max(lastOrderCheck, new Date(order.createdAt || Date.now()).getTime())
          }
        })
      } catch (error) {
        // Silently fail - don't spam console
      }
    }
    
    // Check immediately
    checkNewOrders()
    
    // Poll every 3 seconds for new orders (real-time)
    const interval = setInterval(checkNewOrders, 3000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, user?.role])
  
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    setNotificationMenuOpen(false)
    if (notification.redirectTo) {
      navigate(notification.redirectTo)
    }
  }
  
  return (
    <nav
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-md border-b border-neutral-200"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Home">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-lg sm:text-xl font-display font-bold text-primary-600">
              BrandName
              <span className="text-primary-500">.</span>
            </span>
          </Link>
          
          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/seller-login">
                  <Button variant="ghost" className="hidden md:inline-flex">
                    Become a Seller
                  </Button>
                </Link>
                <Link to="/client-login">
                  <Button>Join</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Only show seller features for freelancers */}
                {user?.role === 'freelancer' && (
                  <>
                    {/* Notifications */}
                    <div className="relative" ref={notificationMenuRef}>
                      <button
                        type="button"
                        onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                        className="relative p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
                        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                      
                      {/* Notification Dropdown */}
                      {notificationMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 max-h-96 overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="font-semibold text-neutral-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="text-xs text-neutral-500">{unreadCount} unread</span>
                            )}
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-neutral-500 text-sm">
                                No notifications
                              </div>
                            ) : (
                              <div className="divide-y divide-neutral-100">
                                {notifications.map((notification) => (
                                  <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
                                      !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                        !notification.read ? 'bg-red-500' : 'bg-transparent'
                                      }`}></div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${
                                          !notification.read ? 'font-semibold text-neutral-900' : 'text-neutral-700'
                                        }`}>
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                          {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Wallet - Desktop */}
                    <div className="hidden md:flex items-center gap-2 text-sm text-neutral-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">PKR 0</span>
                    </div>
                  </>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar
                      src={user?.avatar}
                      name={user?.name || 'User'}
                      size="sm"
                    />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {/* Only show seller menu items for freelancers */}
                      {user?.role === 'freelancer' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/seller/orders"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/wallet"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Wallet
                          </Link>
                          <hr className="my-1" />
                        </>
                      )}
                      {user?.role === 'freelancer' && (
                        <>
                          <Link
                            to="/payment-details"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Payment Details
                          </Link>
                        </>
                      )}
                      {user?.role !== 'freelancer' && (
                        <>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            View Orders
                          </Link>
                          <Link
                            to="/profile-settings"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Profile Settings
                          </Link>
                        </>
                      )}
                      <hr className="my-1" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 text-neutral-600 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                {/* Only show seller menu items for freelancers */}
                {user?.role === 'freelancer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`block px-4 py-2 rounded-md ${
                        isActive('/dashboard')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className={`block px-4 py-2 rounded-md ${
                        isActive('/orders')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wallet"
                      className={`block px-4 py-2 rounded-md ${
                        isActive('/wallet')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wallet
                    </Link>
                  </>
                )}
                {/* Client menu items */}
                {user?.role === 'client' && (
                  <Link
                    to="/profile-settings"
                    className={`block px-4 py-2 rounded-md ${
                      isActive('/profile-settings')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/seller-login"
                  className="block px-4 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become a Seller
                </Link>
                <Link
                  to="/client-login"
                  className="block px-4 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

