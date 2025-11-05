import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import localStorageService from '../../utils/localStorage'
import { toast } from '../../utils/toast'

export default function WithdrawModal({ isOpen, onClose, availableBalance, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    accountNumber: '',
    accountHolderName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const methods = ['Bank', 'JazzCash', 'Easypaisa']
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const amount = parseFloat(formData.amount)
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amount > availableBalance) {
      setError('Amount cannot exceed available balance')
      return
    }
    
    if (!formData.method) {
      setError('Please select a withdrawal method')
      return
    }
    
    if (!formData.accountNumber || !formData.accountHolderName) {
      setError('Please provide account details')
      return
    }
    
    setLoading(true)
    
    try {
      await localStorageService.withdrawals.create({
        amount,
        method: formData.method,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        status: 'pending',
      })
      
      toast.success('Withdrawal request submitted successfully!')
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        amount: '',
        method: '',
        accountNumber: '',
        accountHolderName: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal request')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Withdrawal"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600 mb-2">
            Available Balance: PKR {availableBalance.toLocaleString()}
          </p>
          <Input
            label="Amount *"
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="Enter amount"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Withdrawal Method *
          </label>
          <select
            value={formData.method}
            onChange={(e) =>
              setFormData({ ...formData, method: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select method</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Account Number *"
          value={formData.accountNumber}
          onChange={(e) =>
            setFormData({ ...formData, accountNumber: e.target.value })
          }
          required
        />
        
        <Input
          label="Account Holder Name *"
          value={formData.accountHolderName}
          onChange={(e) =>
            setFormData({ ...formData, accountHolderName: e.target.value })
          }
          required
        />
        
        {error && (
          <div className="text-danger-600 text-sm" role="alert">
            {error}
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  )
}

