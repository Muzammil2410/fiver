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
import GigsList from './pages/GigsList'
import GigDetail from './pages/gig/GigDetail'
import CreateGig from './pages/CreateGig'
import OrdersList from './pages/orders/OrdersList'
import WalletPage from './pages/wallet/WalletPage'
import SellerDashboard from './pages/dashboard/SellerDashboard'
import ClientDashboard from './pages/dashboard/ClientDashboard'
import AdminPanel from './pages/admin/AdminPanel'
import Projects from './pages/Projects'
import CreateProject from './pages/projects/CreateProject'

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
      location.pathname !== '/login' &&
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/gigs"
            element={
              <RequireAuth>
                <GigsList />
              </RequireAuth>
            }
          />
          <Route path="/gigs/:id" element={<GigDetail />} />
          
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

