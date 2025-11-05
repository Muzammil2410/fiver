import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import localStorageService from '../../utils/localStorage'

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    earnings: 0,
    pendingWithdrawals: 0,
    averageRating: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [earningsData, setEarningsData] = useState([])
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const response = await localStorageService.dashboard.getSeller()
      setStats(response.data.stats || stats)
      setRecentOrders(response.data.recentOrders || [])
      setEarningsData(response.data.earningsChart || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link to="/create-gig">
          <Button>Create Gig</Button>
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Active Orders
          </h3>
          <p className="text-2xl font-bold">{stats.activeOrders}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Completed Orders
          </h3>
          <p className="text-2xl font-bold">{stats.completedOrders}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Earnings (Month)
          </h3>
          <p className="text-2xl font-bold text-success-600">
            PKR {stats.earnings.toLocaleString()}
          </p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Pending Withdrawals
          </h3>
          <p className="text-2xl font-bold text-warning-600">
            PKR {stats.pendingWithdrawals.toLocaleString()}
          </p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Average Rating
          </h3>
          <p className="text-2xl font-bold">
            {stats.averageRating.toFixed(1)} ⭐
          </p>
        </Card>
      </div>
      
      {/* Chart */}
      {earningsData.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Earnings Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
      
      {/* Recent Orders */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-neutral-600">No recent orders</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded"
              >
                <div>
                  <p className="font-medium">{order.gigTitle}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">PKR {order.amount.toLocaleString()}</p>
                  <p className="text-sm text-neutral-600">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/gigs">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">My Gigs</h3>
          </Card>
        </Link>
        <Link to="/orders">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">Orders</h3>
          </Card>
        </Link>
        <Link to="/wallet">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">Wallet</h3>
          </Card>
        </Link>
        <Link to="/analytics">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold">Analytics</h3>
          </Card>
        </Link>
      </div>
    </MainLayout>
  )
}

