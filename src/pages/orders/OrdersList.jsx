import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import localStorageService from '../../utils/localStorage'

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchOrders()
  }, [])
  
  const fetchOrders = async () => {
    try {
      const response = await localStorageService.orders.getAll()
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusBadge = (status) => {
    const variants = {
      'Pending payment': 'warning',
      'Payment pending verify': 'warning',
      Active: 'primary',
      Delivered: 'success',
      Completed: 'success',
      Dispute: 'danger',
      Cancelled: 'default',
    }
    return variants[status] || 'default'
  }
  
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <Card>
          <p className="text-center text-neutral-600 py-8">
            You don't have any orders yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-lg font-semibold text-primary-600 hover:underline"
                    >
                      {order.gigTitle || `Order #${order.id}`}
                    </Link>
                    <Badge variant={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    PKR {order.amount?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="secondary">View Order</Button>
                  </Link>
                  {order.status === 'Active' && (
                    <Link to={`/orders/${order.id}#chat`}>
                      <Button variant="ghost">Message</Button>
                    </Link>
                  )}
                  {['Active', 'Delivered'].includes(order.status) && (
                    <Button variant="danger" size="sm">
                      Raise Dispute
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  )
}

