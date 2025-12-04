import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { toast } from '../../utils/toast'
import api from '../../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [paymentDetails, setPaymentDetails] = useState([])
  const [paymentDetailsLoading, setPaymentDetailsLoading] = useState(false)
  const [pendingOrders, setPendingOrders] = useState([])
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false)
  const [verifyingOrderId, setVerifyingOrderId] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)
  
  // Admin's own payment details
  const [adminPaymentForm, setAdminPaymentForm] = useState({
    paymentMethod: '',
    accountNumber: '',
    accountHolderName: '',
    bankAccountName: '',
    bankName: '',
    branchCode: '',
    ibanNumber: '',
  })
  const [adminSavedDetails, setAdminSavedDetails] = useState(null)
  const [adminSaving, setAdminSaving] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  // Check if admin is logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('admin-token')
    const adminUser = localStorage.getItem('admin-user')
    
    if (!adminToken || !adminUser) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.get('/admin/dashboard-stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        navigate('/admin/login')
        toast.error('Session expired. Please login again.')
      } else {
        // For other errors, don't redirect - just show error
        console.error('Failed to fetch stats:', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const adminToken = localStorage.getItem('admin-token')
    if (adminToken) {
      fetchStats()
      // Refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const fetchPaymentDetails = async () => {
    setPaymentDetailsLoading(true)
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.get('/admin/payment-details')
      if (response.data.success) {
        setPaymentDetails(response.data.data.paymentDetails || [])
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        navigate('/admin/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch payment details')
      }
    } finally {
      setPaymentDetailsLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'payment-details') {
      fetchPaymentDetails()
      // Refresh every 30 seconds when on payment details section
      const interval = setInterval(fetchPaymentDetails, 30000)
      return () => clearInterval(interval)
    }
  }, [activeSection])

  const fetchPendingOrders = async () => {
    setPendingOrdersLoading(true)
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.get('/admin/orders/pending-verification')
      if (response.data.success) {
        setPendingOrders(response.data.data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        navigate('/admin/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch pending orders')
      }
    } finally {
      setPendingOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'orders') {
      fetchPendingOrders()
      // Refresh every 5 seconds when on orders section
      const interval = setInterval(fetchPendingOrders, 5000)
      return () => clearInterval(interval)
    }
  }, [activeSection])

  const fetchOrderHistory = useCallback(async () => {
    setOrderHistoryLoading(true)
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.get('/admin/orders/history')
      if (response.data.success) {
        setOrderHistory(response.data.data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching order history:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        navigate('/admin/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch order history')
      }
    } finally {
      setOrderHistoryLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (activeSection === 'order-history') {
      fetchOrderHistory()
      // Refresh every 30 seconds when on order history section
      const interval = setInterval(fetchOrderHistory, 30000)
      return () => clearInterval(interval)
    }
  }, [activeSection, fetchOrderHistory])

  const fetchClients = useCallback(async () => {
    setClientsLoading(true)
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.get('/admin/clients')
      if (response.data.success) {
        setClients(response.data.data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
        navigate('/admin/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch clients')
      }
    } finally {
      setClientsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (activeSection === 'clients') {
      fetchClients()
      // Refresh every 30 seconds when on clients section
      const interval = setInterval(fetchClients, 30000)
      return () => clearInterval(interval)
    }
  }, [activeSection, fetchClients])

  const handleVerifyPayment = async (orderId, verified) => {
    setVerifyingOrderId(orderId)
    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }
      
      const response = await api.post(`/admin/orders/${orderId}/verify-payment`, {
        verified
      })
      
      if (response.data.success) {
        if (verified) {
          toast.success('Payment verified! Order is now visible to seller.')
        } else {
          toast.info('Payment verification rejected.')
        }
        await fetchPendingOrders()
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error(error.response?.data?.message || 'Failed to verify payment')
    } finally {
      setVerifyingOrderId(null)
    }
  }

  // Load admin's own payment details
  const loadAdminPaymentDetails = async () => {
    setAdminLoading(true)
    try {
      const adminUser = JSON.parse(localStorage.getItem('admin-user') || '{}')
      const adminToken = localStorage.getItem('admin-token')
      if (adminUser._id || adminUser.id) {
        const userId = adminUser._id || adminUser.id
        // Use admin token for the API call
        const response = await api.get(`/payment-details/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        })
        if (response.data.success && response.data.data) {
          setAdminSavedDetails(response.data.data)
          setAdminPaymentForm({
            paymentMethod: response.data.data.paymentMethod || '',
            accountNumber: response.data.data.accountNumber || '',
            accountHolderName: response.data.data.accountHolderName || '',
            bankAccountName: response.data.data.bankAccountName || '',
            bankName: response.data.data.bankName || '',
            branchCode: response.data.data.branchCode || '',
            ibanNumber: response.data.data.ibanNumber || '',
          })
        }
      }
    } catch (error) {
      console.error('Error loading admin payment details:', error)
      // Not found is okay - admin hasn't set payment details yet
      if (error.response?.status !== 404) {
        toast.error('Failed to load payment details')
      }
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'my-payment-details') {
      loadAdminPaymentDetails()
    }
  }, [activeSection])

  const handleAdminPaymentInputChange = (e) => {
    const { name, value } = e.target
    setAdminPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    setAdminError('')
  }

  const handleAdminPaymentSave = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminSaving(true)

    // Validation
    if (!adminPaymentForm.paymentMethod) {
      setAdminError('Please select a payment method')
      setAdminSaving(false)
      return
    }

    if (!adminPaymentForm.accountNumber.trim()) {
      setAdminError('Account number is required')
      setAdminSaving(false)
      return
    }

    if (!adminPaymentForm.accountHolderName.trim()) {
      setAdminError('Account holder name is required')
      setAdminSaving(false)
      return
    }

    try {
      const adminToken = localStorage.getItem('admin-token')
      if (!adminToken) {
        setAdminError('Admin session expired. Please login again.')
        navigate('/admin/login')
        return
      }
      
      // Use admin token for the API call
      const response = await api.post('/payment-details', {
        paymentMethod: adminPaymentForm.paymentMethod.toLowerCase(),
        accountNumber: adminPaymentForm.accountNumber,
        accountHolderName: adminPaymentForm.accountHolderName,
        bankAccountName: adminPaymentForm.bankAccountName,
        bankName: adminPaymentForm.bankName,
        branchCode: adminPaymentForm.branchCode,
        ibanNumber: adminPaymentForm.ibanNumber,
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      })
      
      if (response.data.success) {
        toast.success('Payment details saved successfully!')
        await loadAdminPaymentDetails()
      } else {
        setAdminError(response.data.message || 'Failed to save payment details')
        toast.error('Failed to save payment details')
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || err.message || 'Failed to save payment details')
      toast.error('Failed to save payment details')
    } finally {
      setAdminSaving(false)
    }
  }

  const handleAdminPaymentEdit = () => {
    if (adminSavedDetails) {
      setAdminPaymentForm({
        paymentMethod: adminSavedDetails.paymentMethod || '',
        accountNumber: adminSavedDetails.accountNumber || '',
        accountHolderName: adminSavedDetails.accountHolderName || '',
        bankAccountName: adminSavedDetails.bankAccountName || '',
        bankName: adminSavedDetails.bankName || '',
        branchCode: adminSavedDetails.branchCode || '',
        ibanNumber: adminSavedDetails.ibanNumber || '',
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <p className="text-neutral-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'sellers', label: 'Sellers', icon: '💼' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'order-history', label: 'Order History', icon: '📋' },
    { id: 'gigs', label: 'Gigs', icon: '🎯' },
    { id: 'my-payment-details', label: 'My Payment Details', icon: '💰' },
    { id: 'payment-details', label: 'Payment Details', icon: '💳' },
  ]

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card className="sticky top-4 shadow-lg">
            <div className="p-4 sm:p-5 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-700">Admin Panel</h2>
              <p className="text-xs sm:text-sm text-primary-600 mt-1">Control Center</p>
            </div>
            <nav className="space-y-1 p-2 sm:p-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md transform scale-[1.02]'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{section.icon}</span>
                  <span className="text-sm sm:text-base">{section.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center gap-3 text-danger-600 hover:bg-danger-50 hover:shadow-sm mt-4 border-t border-neutral-200 pt-4"
              >
                <span className="text-lg sm:text-xl">🚪</span>
                <span className="text-sm sm:text-base">Logout</span>
              </button>
            </nav>
          </Card>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeSection === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Overview and statistics
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-neutral-100 rounded-lg">
                  <p className="text-xs sm:text-sm text-neutral-600">
                    <span className="font-medium">Updated:</span> {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
                        <span className="text-2xl sm:text-3xl">👥</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-1 font-medium">Total Clients</p>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                      {stats?.totalClients || 0}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Registered clients
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md">
                        <span className="text-2xl sm:text-3xl">💼</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-1 font-medium">Total Sellers</p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                      {stats?.totalSellers || 0}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Registered sellers
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md">
                        <span className="text-2xl sm:text-3xl">📦</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-1 font-medium">Total Orders</p>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                      {stats?.totalOrders || 0}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Orders created
                    </p>
                  </div>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md">
                        <span className="text-2xl sm:text-3xl">🎯</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-1 font-medium">Total Gigs</p>
                    <p className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
                      {stats?.totalGigs || 0}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Gigs created by sellers
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'clients' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Clients
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Manage and view all registered clients
                  </p>
                </div>
                <Button
                  onClick={fetchClients}
                  disabled={clientsLoading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {clientsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>

              {clientsLoading && clients.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-neutral-600 font-medium">Loading clients...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : !clientsLoading && clients.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
                          No clients found
                        </p>
                        <p className="text-sm text-neutral-500">
                          Clients will appear here once they register
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-900">
                            Total Clients
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            All registered clients in the system
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                            {clients.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-neutral-700 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-neutral-700 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-neutral-700 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-neutral-700 uppercase tracking-wider">
                              Registered
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                          {clients.map((client, index) => {
                            const clientId = client._id || client.id
                            const formatDate = (date) => {
                              if (!date) return 'N/A'
                              return new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            }

                            return (
                              <tr 
                                key={clientId} 
                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150 ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                                }`}
                              >
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {client.avatar ? (
                                      <img
                                        src={client.avatar}
                                        alt={client.name}
                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full mr-3 border-2 border-neutral-200 shadow-sm"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3 shadow-md">
                                        <span className="text-white font-bold text-sm sm:text-base">
                                          {client.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-sm sm:text-base font-semibold text-neutral-900">
                                      {client.name || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm sm:text-base text-neutral-900 font-medium">
                                    {client.email || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm sm:text-base text-neutral-600">
                                    {client.phone || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm sm:text-base text-neutral-600">
                                    {formatDate(client.createdAt)}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeSection === 'sellers' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Sellers
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  View all registered sellers
                </p>
              </div>
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                <div className="p-8 sm:p-12">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💼</div>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        {stats?.totalSellers || 0}
                      </p>
                      <p className="text-base sm:text-lg text-neutral-600 font-medium">
                        Total Sellers Registered
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Orders Pending Verification
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Review and verify payment screenshots
                  </p>
                </div>
                <Button
                  onClick={fetchPendingOrders}
                  disabled={pendingOrdersLoading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {pendingOrdersLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>

              {pendingOrdersLoading && pendingOrders.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-neutral-600 font-medium">Loading pending orders...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : !pendingOrdersLoading && pendingOrders.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
                          No orders pending verification
                        </p>
                        <p className="text-sm text-neutral-500">
                          All orders have been verified
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-500">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-900">
                            Pending Verification
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            Orders waiting for payment verification
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                            {pendingOrders.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {pendingOrders.map((order) => (
                      <Card key={order._id || order.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-3">
                                {order.gigTitle || 'Order'}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500">👤</span>
                                  <span className="font-medium text-neutral-700">Buyer:</span>
                                  <span className="text-neutral-900">{order.buyerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500">💼</span>
                                  <span className="font-medium text-neutral-700">Seller:</span>
                                  <span className="text-neutral-900">{order.sellerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500">💰</span>
                                  <span className="font-medium text-neutral-700">Amount:</span>
                                  <span className="text-primary-600 font-bold">PKR {order.amount?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500">📦</span>
                                  <span className="font-medium text-neutral-700">Package:</span>
                                  <span className="text-neutral-900">{order.package || 'Standard'}</span>
                                </div>
                                {order.paymentUploadedAt && (
                                  <div className="flex items-center gap-2 sm:col-span-2">
                                    <span className="text-neutral-500">📅</span>
                                    <span className="font-medium text-neutral-700">Payment Uploaded:</span>
                                    <span className="text-neutral-600">{new Date(order.paymentUploadedAt).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-lg text-xs sm:text-sm font-semibold shadow-sm border border-yellow-200">
                                ⏳ Pending Verification
                              </span>
                            </div>
                          </div>

                          {order.requirements && (
                            <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200">
                              <p className="text-xs sm:text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                <span>📝</span>
                                Requirements:
                              </p>
                              <p className="text-sm sm:text-base text-neutral-800 leading-relaxed">{order.requirements}</p>
                            </div>
                          )}

                          {order.paymentScreenshot && (
                            <div className="mb-4">
                              <p className="text-sm sm:text-base font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                                <span>📸</span>
                                Payment Screenshot:
                              </p>
                              <div className="border-2 border-neutral-200 rounded-xl overflow-hidden shadow-md bg-neutral-50">
                                <img
                                  src={order.paymentScreenshot}
                                  alt="Payment screenshot"
                                  className="w-full max-w-full sm:max-w-md h-auto object-contain mx-auto"
                                  style={{ maxHeight: '400px' }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-neutral-200">
                            <Button
                              onClick={() => handleVerifyPayment(order._id || order.id, true)}
                              loading={verifyingOrderId === (order._id || order.id)}
                              disabled={verifyingOrderId !== null}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all"
                            >
                              ✅ Verify Payment
                            </Button>
                            <Button
                              onClick={() => handleVerifyPayment(order._id || order.id, false)}
                              variant="secondary"
                              loading={verifyingOrderId === (order._id || order.id)}
                              disabled={verifyingOrderId !== null}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all"
                            >
                              ❌ Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'order-history' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Order History
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Track completed orders and confirmations
                  </p>
                </div>
                <Button
                  onClick={fetchOrderHistory}
                  disabled={orderHistoryLoading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {orderHistoryLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>

              {orderHistoryLoading && orderHistory.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-neutral-600 font-medium">Loading order history...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : !orderHistoryLoading && orderHistory.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
                          No order history available
                        </p>
                        <p className="text-sm text-neutral-500">
                          Orders that have been completed or confirmed will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-900">
                            Total Orders
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            Orders with completion or confirmation status
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                            {orderHistory.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {orderHistory.map((order) => {
                      const orderId = order._id || order.id
                      const formatDate = (date) => {
                        if (!date) return 'N/A'
                        return new Date(date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }

                      return (
                        <Card key={orderId} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500">
                          <div className="p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-3">
                                  {order.gigTitle || 'Order'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-500">👤</span>
                                      <span className="font-medium text-neutral-700">Buyer:</span>
                                      <span className="text-neutral-900">{order.buyerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-500">💼</span>
                                      <span className="font-medium text-neutral-700">Seller:</span>
                                      <span className="text-neutral-900">{order.sellerName}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-500">💰</span>
                                      <span className="font-medium text-neutral-700">Amount:</span>
                                      <span className="font-bold text-primary-600">PKR {order.amount?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-500">📦</span>
                                      <span className="font-medium text-neutral-700">Package:</span>
                                      <span className="text-neutral-900">{order.package || 'Standard'}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:col-span-2">
                                    <span className="text-neutral-500">📅</span>
                                    <span className="font-medium text-neutral-700">Order Created:</span>
                                    <span className="text-neutral-600">{formatDate(order.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 sm:col-span-2">
                                    <span className="text-neutral-500">📊</span>
                                    <span className="font-medium text-neutral-700">Status:</span>
                                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-semibold">{order.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Completion and Confirmation Status */}
                            <div className="mt-4 pt-4 border-t-2 border-neutral-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Seller Completion */}
                                <div className={`p-4 sm:p-5 rounded-xl shadow-md transition-all duration-200 ${
                                  order.sellerCompleted 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
                                    : 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200'
                                }`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    {order.sellerCompleted ? (
                                      <span className="text-2xl">✅</span>
                                    ) : (
                                      <span className="text-2xl text-neutral-400">⏳</span>
                                    )}
                                    <h4 className="font-bold text-neutral-900 text-base sm:text-lg">Seller Completion</h4>
                                  </div>
                                  {order.sellerCompleted ? (
                                    <div className="space-y-2 text-sm">
                                      <p className="text-green-800 font-medium">
                                        <span className="font-semibold">Completed by:</span> {order.sellerName}
                                      </p>
                                      <p className="text-green-700">
                                        <span className="font-semibold">Completed at:</span> {formatDate(order.sellerCompletedAt)}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-neutral-600 text-sm font-medium">Not completed yet</p>
                                  )}
                                </div>

                                {/* Client Confirmation */}
                                <div className={`p-4 sm:p-5 rounded-xl shadow-md transition-all duration-200 ${
                                  order.clientConfirmed 
                                    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300' 
                                    : 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200'
                                }`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    {order.clientConfirmed ? (
                                      <span className="text-2xl">✅</span>
                                    ) : (
                                      <span className="text-2xl text-neutral-400">⏳</span>
                                    )}
                                    <h4 className="font-bold text-neutral-900 text-base sm:text-lg">Client Confirmation</h4>
                                  </div>
                                  {order.clientConfirmed ? (
                                    <div className="space-y-2 text-sm">
                                      <p className="text-blue-800 font-medium">
                                        <span className="font-semibold">Confirmed by:</span> {order.buyerName}
                                      </p>
                                      <p className="text-blue-700">
                                        <span className="font-semibold">Confirmed at:</span> {formatDate(order.clientConfirmedAt)}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-neutral-600 text-sm font-medium">Not confirmed yet</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'gigs' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Gigs
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Overview of all gigs in the platform
                </p>
              </div>
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
                <div className="p-8 sm:p-12">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        {stats?.totalGigs || 0}
                      </p>
                      <p className="text-base sm:text-lg text-neutral-600 font-medium">
                        Total Gigs Created by Sellers
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'my-payment-details' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">My Payment Details</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Details Form */}
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-neutral-900">Payment Information</h2>
                    </div>
                    
                    <form onSubmit={handleAdminPaymentSave} className="space-y-5">
                      {/* Payment Method Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Payment Method *
                        </label>
                        <select
                          name="paymentMethod"
                          value={adminPaymentForm.paymentMethod}
                          onChange={handleAdminPaymentInputChange}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-white"
                          required
                        >
                          <option value="">Select Payment Method</option>
                          <option value="jazzcash">JazzCash</option>
                          <option value="easypaisa">EasyPaisa</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>

                      {/* Account Number */}
                      <Input
                        label="Account Number *"
                        name="accountNumber"
                        value={adminPaymentForm.accountNumber}
                        onChange={handleAdminPaymentInputChange}
                        placeholder="Enter account number"
                        required
                        className="text-base"
                      />

                      {/* Account Holder Name */}
                      <Input
                        label="Account Holder Name *"
                        name="accountHolderName"
                        value={adminPaymentForm.accountHolderName}
                        onChange={handleAdminPaymentInputChange}
                        placeholder="Enter account holder name"
                        required
                        className="text-base"
                      />

                      {/* Bank Account Name */}
                      <Input
                        label="Bank Account Name"
                        name="bankAccountName"
                        value={adminPaymentForm.bankAccountName}
                        onChange={handleAdminPaymentInputChange}
                        placeholder="Enter bank account name"
                        className="text-base"
                      />

                      {/* Bank Name */}
                      <Input
                        label="Bank Name"
                        name="bankName"
                        value={adminPaymentForm.bankName}
                        onChange={handleAdminPaymentInputChange}
                        placeholder="Enter bank name"
                        className="text-base"
                      />

                      {/* Branch Code and IBAN in a row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                          label="Branch Code"
                          name="branchCode"
                          value={adminPaymentForm.branchCode}
                          onChange={handleAdminPaymentInputChange}
                          placeholder="Enter branch code"
                          className="text-base"
                        />

                        <Input
                          label="IBAN Number"
                          name="ibanNumber"
                          value={adminPaymentForm.ibanNumber}
                          onChange={handleAdminPaymentInputChange}
                          placeholder="Enter IBAN number"
                          className="text-base"
                        />
                      </div>

                      {adminError && (
                        <div className="text-danger-600 text-sm bg-danger-50 p-4 rounded-lg border border-danger-200" role="alert">
                          {adminError}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" loading={adminSaving} className="flex-1 py-3 text-base font-semibold">
                          Save Payment Details
                        </Button>
                        {adminSavedDetails && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAdminPaymentEdit}
                            className="py-3 text-base font-semibold sm:w-auto"
                          >
                            Load Saved Details
                          </Button>
                        )}
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Saved Details Display */}
                {adminSavedDetails && (
                  <div className="lg:col-span-1">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-success-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-neutral-900">Saved Details</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                            Payment Method
                          </h3>
                          <p className="text-lg font-bold text-neutral-900">
                            {adminSavedDetails.paymentMethod?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                            Account Number
                          </h3>
                          <p className="text-lg font-bold text-neutral-900 break-all">
                            {adminSavedDetails.accountNumber}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                            Account Holder
                          </h3>
                          <p className="text-lg font-bold text-neutral-900">
                            {adminSavedDetails.accountHolderName}
                          </p>
                        </div>

                        {adminSavedDetails.bankAccountName && (
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                              Bank Account Name
                            </h3>
                            <p className="text-lg font-bold text-neutral-900">
                              {adminSavedDetails.bankAccountName}
                            </p>
                          </div>
                        )}

                        {adminSavedDetails.bankName && (
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                              Bank Name
                            </h3>
                            <p className="text-lg font-bold text-neutral-900">
                              {adminSavedDetails.bankName}
                            </p>
                          </div>
                        )}

                        {adminSavedDetails.branchCode && (
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                              Branch Code
                            </h3>
                            <p className="text-lg font-bold text-neutral-900">
                              {adminSavedDetails.branchCode}
                            </p>
                          </div>
                        )}

                        {adminSavedDetails.ibanNumber && (
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                              IBAN Number
                            </h3>
                            <p className="text-lg font-bold text-neutral-900 break-all">
                              {adminSavedDetails.ibanNumber}
                            </p>
                          </div>
                        )}

                        {adminSavedDetails.updatedAt && (
                          <div className="pt-4 mt-4 border-t border-neutral-200">
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                              Last updated
                            </p>
                            <p className="text-sm text-neutral-700 font-medium">
                              {new Date(adminSavedDetails.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'payment-details' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Payment Details
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    View all seller payment information
                  </p>
                </div>
                <Button
                  onClick={fetchPaymentDetails}
                  disabled={paymentDetailsLoading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {paymentDetailsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              </div>

              {paymentDetailsLoading ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-neutral-600 font-medium">Loading payment details...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : paymentDetails.length === 0 ? (
                <Card className="shadow-lg">
                  <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-6xl mb-4">💳</div>
                        <p className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
                          No payment details found
                        </p>
                        <p className="text-sm text-neutral-500">
                          Sellers need to set their payment details at /payment-details
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-900">
                            Total Payment Details
                          </p>
                          <p className="text-xs text-neutral-600 mt-1">
                            All seller payment information
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                            {paymentDetails.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {paymentDetails.map((payment, index) => (
                      <Card key={payment._id || index} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-2">
                                {payment.seller?.name || 'Unknown Seller'}
                              </h3>
                              <p className="text-sm sm:text-base text-neutral-600 mb-1">
                                {payment.seller?.email || 'N/A'}
                              </p>
                              {payment.seller?.phone && (
                                <p className="text-sm text-neutral-600">
                                  Phone: {payment.seller.phone}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                {payment.paymentMethod?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t-2 border-neutral-200">
                            <div className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Account Number</p>
                              <p className="text-sm sm:text-base font-bold text-neutral-900 break-all">
                                {payment.accountNumber || 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Account Holder Name</p>
                              <p className="text-sm sm:text-base font-bold text-neutral-900">
                                {payment.accountHolderName || 'N/A'}
                              </p>
                            </div>
                            {payment.bankName && (
                              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Bank Name</p>
                                <p className="text-sm sm:text-base font-bold text-neutral-900">
                                  {payment.bankName}
                                </p>
                              </div>
                            )}
                            {payment.branchCode && (
                              <div className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Branch Code</p>
                                <p className="text-sm sm:text-base font-bold text-neutral-900">
                                  {payment.branchCode}
                                </p>
                              </div>
                            )}
                            {payment.ibanNumber && (
                              <div className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border border-neutral-200 sm:col-span-2">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">IBAN Number</p>
                                <p className="text-sm sm:text-base font-bold text-neutral-900 break-all">
                                  {payment.ibanNumber}
                                </p>
                              </div>
                            )}
                          </div>

                          {payment.updatedAt && (
                            <div className="mt-4 pt-4 border-t-2 border-neutral-200">
                              <p className="text-xs font-medium text-neutral-500 flex items-center gap-2">
                                <span>🕒</span>
                                Last updated: <span className="font-semibold text-neutral-700">{new Date(payment.updatedAt).toLocaleString()}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  )
}

