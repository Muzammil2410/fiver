import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { toast } from '../../utils/toast'
import api from '../../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  // Check if admin is logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('admin-token')
    const adminUser = localStorage.getItem('admin-user')
    
    if (!adminToken || !adminUser) {
      navigate('/admin/login')
    }
  }, [navigate])

  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('admin-token')
      const response = await api.get('/admin/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      })
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
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

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
    { id: 'gigs', label: 'Gigs', icon: '🎯' },
  ]

  return (
    <MainLayout>
      <div className="flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <Card>
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-primary-600">Admin Panel</h2>
            </div>
            <nav className="space-y-1 p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 text-danger-600 hover:bg-danger-50 mt-4"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </Card>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-neutral-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <span className="text-3xl">👥</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">Total Clients</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {stats?.totalClients || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Registered clients
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <span className="text-3xl">💼</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">Total Sellers</p>
                    <p className="text-4xl font-bold text-green-600">
                      {stats?.totalSellers || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Registered sellers
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <span className="text-3xl">📦</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {stats?.totalOrders || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Orders created
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <span className="text-3xl">🎯</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">Total Gigs</p>
                    <p className="text-4xl font-bold text-orange-600">
                      {stats?.totalGigs || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Gigs created by sellers
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'clients' && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Clients</h1>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-4xl font-bold text-blue-600 mb-2">
                        {stats?.totalClients || 0}
                      </p>
                      <p className="text-lg text-neutral-600">
                        Total Clients Registered
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'sellers' && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Sellers</h1>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💼</div>
                      <p className="text-4xl font-bold text-green-600 mb-2">
                        {stats?.totalSellers || 0}
                      </p>
                      <p className="text-lg text-neutral-600">
                        Total Sellers Registered
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Orders</h1>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-4xl font-bold text-purple-600 mb-2">
                        {stats?.totalOrders || 0}
                      </p>
                      <p className="text-lg text-neutral-600">
                        Total Orders Created
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'gigs' && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Gigs</h1>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-4xl font-bold text-orange-600 mb-2">
                        {stats?.totalGigs || 0}
                      </p>
                      <p className="text-lg text-neutral-600">
                        Total Gigs Created by Sellers
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  )
}

