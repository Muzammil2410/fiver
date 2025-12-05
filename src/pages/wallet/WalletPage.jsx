import React, { useState, useEffect } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useWalletStore } from '../../store/useWalletStore'
import * as walletService from '../../services/wallet'
import { toast } from '../../utils/toast'

export default function WalletPage() {
  const [loading, setLoading] = useState(true)
  const wallet = useWalletStore()
  
  useEffect(() => {
    fetchWalletData()
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchWalletData()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  const fetchWalletData = async () => {
    try {
      const response = await walletService.getWallet()
      if (response.success && response.data) {
        wallet.setWalletData(response.data)
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      if (loading) {
        toast.error(error.message || 'Failed to load wallet data')
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Wallet</h1>
      
      {/* Balance Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="120px" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-neutral-600 mb-2">
              Available Balance
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-primary-600">
              PKR {wallet.balance.toLocaleString()}
            </p>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-neutral-600 mb-2">
              Pending Balance
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-warning-600">
              PKR {wallet.pendingBalance.toLocaleString()}
            </p>
          </Card>
          
          <Card className="p-4 sm:p-6 sm:col-span-2 md:col-span-1">
            <h3 className="text-xs sm:text-sm font-medium text-neutral-600 mb-2">
              Total Earned
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-success-600">
              PKR {wallet.totalEarned.toLocaleString()}
            </p>
          </Card>
        </div>
      )}
      
      {/* Transactions */}
      <Card>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Transaction History</h2>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="60px" />
            ))}
          </div>
        ) : wallet.transactions.length === 0 ? (
          <p className="text-center text-sm sm:text-base text-neutral-600 py-8 sm:py-12">
            No transactions yet. Approved withdrawal requests will appear here.
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">{tx.description}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={tx.type === 'incoming' ? 'success' : 'default'}
                          size="sm"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-sm">
                        {tx.type === 'incoming' ? '+' : '-'}PKR{' '}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            tx.status === 'Completed' ? 'success' : 'warning'
                          }
                          size="sm"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-neutral-900 mb-1">{tx.description}</p>
                      <p className="text-xs text-neutral-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={tx.type === 'incoming' ? 'success' : 'default'}
                        size="sm"
                      >
                        {tx.type}
                      </Badge>
                      <Badge
                        variant={
                          tx.status === 'Completed' ? 'success' : 'warning'
                        }
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-neutral-200">
                    <p className="text-lg font-bold text-primary-600 text-right">
                      {tx.type === 'incoming' ? '+' : '-'}PKR {tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </MainLayout>
  )
}

