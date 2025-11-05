import React, { useState, useEffect } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import WithdrawModal from '../../components/wallet/WithdrawModal'
import localStorageService from '../../utils/localStorage'
import { useWalletStore } from '../../store/useWalletStore'

export default function WalletPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const wallet = useWalletStore()
  
  useEffect(() => {
    fetchWalletData()
  }, [])
  
  const fetchWalletData = async () => {
    try {
      const response = await localStorageService.wallet.get()
      wallet.setWalletData(response.data)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    }
  }
  
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Available Balance
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            PKR {wallet.balance.toLocaleString()}
          </p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Pending Balance
          </h3>
          <p className="text-3xl font-bold text-warning-600">
            PKR {wallet.pendingBalance.toLocaleString()}
          </p>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">
            Total Earned
          </h3>
          <p className="text-3xl font-bold text-success-600">
            PKR {wallet.totalEarned.toLocaleString()}
          </p>
        </Card>
      </div>
      
      {/* Withdraw Button */}
      <div className="mb-6">
        <Button onClick={() => setShowWithdrawModal(true)}>
          Request Withdrawal
        </Button>
      </div>
      
      {/* Transactions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
        {wallet.transactions.length === 0 ? (
          <p className="text-center text-neutral-600 py-8">
            No transactions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-neutral-100">
                    <td className="py-3 px-4 text-sm">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{tx.description}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={tx.type === 'incoming' ? 'success' : 'default'}
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {tx.type === 'incoming' ? '+' : '-'}PKR{' '}
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          tx.status === 'Completed' ? 'success' : 'warning'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={wallet.balance}
        onSuccess={fetchWalletData}
      />
    </MainLayout>
  )
}

