import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  
  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }
  
  const isActive = (path) => location.pathname === path
  
  return (
    <nav
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-md border-b border-neutral-200"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Home">
            <svg
              className="w-8 h-8 text-primary-600"
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
            <span className="text-xl font-display font-bold text-primary-600">
              BrandName
              <span className="text-primary-500">.</span>
            </span>
          </Link>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/signup?role=freelancer">
                  <Button variant="ghost" className="hidden md:inline-flex">
                    Become a Seller
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/signup?role=client">
                  <Button>Join</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Only show seller features for freelancers */}
                {user?.role === 'freelancer' && (
                  <>
                    {/* Notifications */}
                    <button
                      type="button"
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
                        <Badge
                          variant="danger"
                          size="sm"
                          className="absolute -top-1 -right-1"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </button>
                    
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                            to="/orders"
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
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
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
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/signup?role=freelancer"
                  className="block px-4 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become a Seller
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup?role=client"
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

