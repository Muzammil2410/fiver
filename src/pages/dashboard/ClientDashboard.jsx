import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import localStorageService from '../../utils/localStorage'

export default function ClientDashboard() {
  const [projects, setProjects] = useState([])
  const [orders, setOrders] = useState([])
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const [projectsRes, ordersRes] = await Promise.all([
        localStorageService.projects.getAll(),
        localStorageService.orders.getAll(),
      ])
      setProjects(projectsRes.data.projects || [])
      setOrders(ordersRes.data.orders || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }
  
  const pendingDeliverables = orders.filter(
    (o) => ['Active', 'Delivered'].includes(o.status)
  ).length
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <Link to="/projects/create">
          <Button>Post a Project</Button>
        </Link>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Posted Projects
          </h3>
          <p className="text-2xl font-bold">{projects.length}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Active Orders
          </h3>
          <p className="text-2xl font-bold">{orders.filter((o) => o.status === 'Active').length}</p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Pending Deliverables
          </h3>
          <p className="text-2xl font-bold">{pendingDeliverables}</p>
        </Card>
      </div>
      
      {/* Projects */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">My Projects</h2>
        {projects.length === 0 ? (
          <p className="text-neutral-600">No projects posted yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded"
              >
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-neutral-600">
                    Budget: PKR {project.budgetMin} - PKR {project.budgetMax}
                  </p>
                </div>
                <Badge variant="default">{project.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Recent Orders */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-neutral-600">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded hover:bg-neutral-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{order.gigTitle}</h3>
                  <p className="text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">PKR {order.amount.toLocaleString()}</p>
                  <Badge variant="default" size="sm">
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </MainLayout>
  )
}

