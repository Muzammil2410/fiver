import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import ToastContainer from './components/notifications/ToastContainer'
import UsernameModal from './components/UsernameModal'
import { subscribe, getToasts, removeToast } from './utils/toast'
import { useAuthStore } from './store/useAuthStore'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SellerLogin from './pages/SellerLogin'
import ClientLogin from './pages/ClientLogin'
import SellerSignup from './pages/SellerSignup'
import ClientSignup from './pages/ClientSignup'
import GigsList from './pages/GigsList'
import GigDetail from './pages/gig/GigDetail'
import CreateGig from './pages/CreateGig'
import OrdersList from './pages/orders/OrdersList'
import OrderPayment from './pages/orders/OrderPayment'
import SellerOrders from './pages/orders/SellerOrders'
import OrderDetail from './pages/orders/OrderDetail'
import WalletPage from './pages/wallet/WalletPage'
import SellerDashboard from './pages/dashboard/SellerDashboard'
import ClientDashboard from './pages/dashboard/ClientDashboard'
import AdminPanel from './pages/admin/AdminPanel'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import Projects from './pages/Projects'
import CreateProject from './pages/projects/CreateProject'
import Marketplace from './pages/Marketplace'
import SellerDashboardNew from './pages/SellerDashboard'
import Profile from './pages/Profile'
import PaymentDetails from './pages/PaymentDetails'
import ProfileSettings from './pages/ProfileSettings'
import SellerProfile from './pages/seller/SellerProfile'
import WithdrawalRequests from './pages/WithdrawalRequests'

function AppContent() {
  const location = useLocation()
  const [toasts, setToasts] = useState(getToasts())
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  useEffect(() => {
    const unsubscribe = subscribe((newToasts) => {
      setToasts(newToasts)
    })
    return unsubscribe
  }, [])
  
  // Check if freelancer needs to set username
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      user.role === 'freelancer' &&
      !user.username &&
      location.pathname !== '/client-login' &&
      location.pathname !== '/seller-login' &&
      location.pathname !== '/signup'
    ) {
      setShowUsernameModal(true)
    }
  }, [isAuthenticated, user, location.pathname])
  
  const handleUsernameComplete = () => {
    setShowUsernameModal(false)
  }
  
  return (
    <div className="App">
      <Routes>
          <Route path="/" element={<Home />} />
          {/* Legacy routes - keep for backward compatibility */}
          <Route path="/signup" element={<Signup />} />
          
          {/* Separate Seller and Client Login/Signup */}
          <Route path="/seller-login" element={<SellerLogin />} />
          <Route path="/client-login" element={<ClientLogin />} />
          <Route path="/seller-signup" element={<SellerSignup />} />
          <Route path="/client-signup" element={<ClientSignup />} />
          
          {/* Client Browse Gigs - Shows ALL gigs from ALL sellers */}
          <Route
            path="/gigs"
            element={
              <RequireAuth>
                <GigsList />
              </RequireAuth>
            }
          />
          <Route path="/gigs/:id" element={<GigDetail />} />
          
          {/* Seller View Their Own Gigs - Shows only seller's created gigs */}
          <Route
            path="/seller-gigs"
            element={
              <RequireAuth>
                <GigsList />
              </RequireAuth>
            }
          />
          
          <Route
            path="/create-gig"
            element={
              <RequireAuth>
                <CreateGig />
              </RequireAuth>
            }
          />
          
          <Route
            path="/projects"
            element={
              <RequireAuth>
                <Projects />
              </RequireAuth>
            }
          />
          
          <Route
            path="/projects/create"
            element={
              <RequireAuth>
                <CreateProject />
              </RequireAuth>
            }
          />
          
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrdersList />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/payment/:gigId"
            element={
              <RequireAuth>
                <OrderPayment />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <RequireAuth>
                <SellerOrders />
              </RequireAuth>
            }
          />
          
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <WalletPage />
              </RequireAuth>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <SellerDashboard />
              </RequireAuth>
            }
          />
          
          <Route
            path="/withdrawal-requests"
            element={
              <RequireAuth>
                <WithdrawalRequests />
              </RequireAuth>
            }
          />
          
          {/* New Marketplace and Seller routes */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/seller" element={<SellerDashboardNew />} />
          
          {/* Profile routes - works for both /seller/:id and /profile/:id */}
          <Route path="/seller/:id" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          
          {/* Seller Profile - Only for sellers */}
          <Route
            path="/seller/profile"
            element={
              <RequireAuth>
                <SellerProfile />
              </RequireAuth>
            }
          />
          
          {/* Payment Details - Only for sellers */}
          <Route
            path="/payment-details"
            element={
              <RequireAuth>
                <PaymentDetails />
              </RequireAuth>
            }
          />
          
          {/* Profile Settings - For clients */}
          <Route
            path="/profile-settings"
            element={
              <RequireAuth>
                <ProfileSettings />
              </RequireAuth>
            }
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPanel />
              </RequireAdmin>
            }
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <UsernameModal
        isOpen={showUsernameModal}
        onComplete={handleUsernameComplete}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

