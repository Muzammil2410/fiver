import React, { useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import RequireAdmin from '../../components/RequireAdmin'

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('payments')
  
  const sections = [
    { id: 'payments', label: 'Payments to Verify' },
    { id: 'withdrawals', label: 'Withdraw Requests' },
    { id: 'users', label: 'Users' },
    { id: 'orders', label: 'Orders' },
    { id: 'projects', label: 'Projects' },
    { id: 'categories', label: 'Categories & Skills' },
    { id: 'cms', label: 'CMS' },
  ]
  
  return (
    <RequireAdmin>
      <MainLayout>
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {activeSection === 'payments' && <PaymentsQueue />}
            {activeSection === 'withdrawals' && <WithdrawRequests />}
            {activeSection === 'categories' && <CategoriesManager />}
            {activeSection === 'cms' && <CMSManager />}
          </main>
        </div>
      </MainLayout>
    </RequireAdmin>
  )
}

function PaymentsQueue() {
  const [payments, setPayments] = useState([])
  
  const handleApprove = async (id) => {
    // API call to approve payment
    console.log('Approve payment:', id)
  }
  
  const handleReject = async (id) => {
    // API call to reject payment
    console.log('Reject payment:', id)
  }
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Payments to Verify</h2>
      <div className="space-y-4">
        {payments.length === 0 ? (
          <p className="text-neutral-600">No pending payments</p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {payment.screenshot && (
                  <img
                    src={payment.screenshot}
                    alt="Payment proof"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">Order #{payment.orderId}</p>
                  <p className="text-sm text-neutral-600">
                    Buyer: {payment.buyerName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Method: {payment.method} | TX ID: {payment.transactionId}
                  </p>
                  <p className="font-semibold">PKR {payment.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleApprove(payment.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReject(payment.id)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

function WithdrawRequests() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Withdraw Requests</h2>
      <p className="text-neutral-600">Withdraw requests will appear here</p>
    </Card>
  )
}

function CategoriesManager() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Categories & Skills</h2>
      <p className="text-neutral-600">Category and skill management UI</p>
    </Card>
  )
}

function CMSManager() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">CMS</h2>
      <p className="text-neutral-600">Content management for About, Terms, etc.</p>
    </Card>
  )
}

