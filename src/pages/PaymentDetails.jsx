import React, { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../utils/toast'
import * as paymentDetailsService from '../services/paymentDetails'

export default function PaymentDetails() {
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    paymentMethod: '',
    accountNumber: '',
    accountHolderName: '',
    branchCode: '',
    ibanNumber: '',
  })
  const [savedDetails, setSavedDetails] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadPaymentDetails()
    }
  }, [user])

  const loadPaymentDetails = async () => {
    try {
      // Try to load from backend API first
      if (user?.id) {
        try {
          const response = await paymentDetailsService.getPaymentDetailsByUserId(user.id)
          if (response.success && response.data) {
            setSavedDetails(response.data)
            // Also save to localStorage for offline access
            localStorage.setItem(
              `payment-details-${user.id}`,
              JSON.stringify(response.data)
            )
            return
          }
        } catch (apiError) {
          console.log('Backend payment details not found, trying localStorage...')
        }
      }
      
      // Fallback to localStorage
      const paymentDetails = JSON.parse(
        localStorage.getItem(`payment-details-${user?.id}`) || 'null'
      )
      if (paymentDetails) {
        setSavedDetails(paymentDetails)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validation
    if (!formData.paymentMethod) {
      setError('Please select a payment method')
      setSaving(false)
      return
    }

    if (!formData.accountNumber.trim()) {
      setError('Account number is required')
      setSaving(false)
      return
    }

    if (!formData.accountHolderName.trim()) {
      setError('Account holder name is required')
      setSaving(false)
      return
    }

    try {
      const paymentDetails = {
        ...formData,
        userId: user?.id,
        updatedAt: new Date().toISOString(),
      }

      // Save to localStorage (for backward compatibility)
      localStorage.setItem(
        `payment-details-${user?.id}`,
        JSON.stringify(paymentDetails)
      )

      // Also save to backend API (for real-time access across sessions)
      try {
        await paymentDetailsService.savePaymentDetails({
          paymentMethod: formData.paymentMethod,
          accountNumber: formData.accountNumber,
          accountHolderName: formData.accountHolderName,
          branchCode: formData.branchCode,
          ibanNumber: formData.ibanNumber,
        })
        console.log('✅ Payment details saved to backend')
      } catch (apiError) {
        console.warn('⚠️ Failed to save to backend, but saved to localStorage:', apiError)
        // Continue even if backend save fails
      }

      setSavedDetails(paymentDetails)
      toast.success('Payment details saved successfully!')
      
      // Clear form after saving
      setFormData({
        paymentMethod: '',
        accountNumber: '',
        accountHolderName: '',
        branchCode: '',
        ibanNumber: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to save payment details')
      toast.error('Failed to save payment details')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    // Pre-fill form with saved details for editing
    if (savedDetails) {
      setFormData({
        paymentMethod: savedDetails.paymentMethod || '',
        accountNumber: savedDetails.accountNumber || '',
        accountHolderName: savedDetails.accountHolderName || '',
        branchCode: savedDetails.branchCode || '',
        ibanNumber: savedDetails.ibanNumber || '',
      })
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">Payment Details</h1>
          <p className="text-neutral-600 text-base md:text-lg">Manage your payment information for withdrawals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment Details Form - Takes 3 columns on large screens */}
          <div className="lg:col-span-3">
            <Card className="p-6 md:p-8 shadow-lg">
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
              
              <form onSubmit={handleSave} className="space-y-5">
                {/* Payment Method Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base bg-white"
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                {/* Account Number */}
                <Input
                  label="Account Number *"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  required
                  className="text-base"
                />

                {/* Account Holder Name */}
                <Input
                  label="Account Holder Name *"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                  required
                  className="text-base"
                />

                {/* Branch Code and IBAN in a row on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Branch Code */}
                  <Input
                    label="Branch Code"
                    name="branchCode"
                    value={formData.branchCode}
                    onChange={handleInputChange}
                    placeholder="Enter branch code"
                    className="text-base"
                  />

                  {/* IBAN Number */}
                  <Input
                    label="IBAN Number"
                    name="ibanNumber"
                    value={formData.ibanNumber}
                    onChange={handleInputChange}
                    placeholder="Enter IBAN number"
                    className="text-base"
                  />
                </div>

                {error && (
                  <div className="text-danger-600 text-sm bg-danger-50 p-4 rounded-lg border border-danger-200" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" loading={saving} className="flex-1 py-3 text-base font-semibold">
                    Save Payment Details
                  </Button>
                  {savedDetails && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleEdit}
                      className="py-3 text-base font-semibold sm:w-auto"
                    >
                      Load Saved Details
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Saved Details Display - Expanded to the right */}
          {savedDetails && (
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 shadow-lg">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                      Payment Method
                    </h3>
                    <p className="text-xl font-bold text-neutral-900">
                      {savedDetails.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                      Account Number
                    </h3>
                    <p className="text-xl font-bold text-neutral-900 break-all">
                      {savedDetails.accountNumber}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                      Account Holder
                    </h3>
                    <p className="text-xl font-bold text-neutral-900">
                      {savedDetails.accountHolderName}
                    </p>
                  </div>

                  {savedDetails.branchCode && (
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        Branch Code
                      </h3>
                      <p className="text-xl font-bold text-neutral-900">
                        {savedDetails.branchCode}
                      </p>
                    </div>
                  )}

                  {savedDetails.ibanNumber && (
                    <div className="md:col-span-2">
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        IBAN Number
                      </h3>
                      <p className="text-lg font-bold text-neutral-900 break-all">
                        {savedDetails.ibanNumber}
                      </p>
                    </div>
                  )}
                </div>

                {savedDetails.updatedAt && (
                  <div className="pt-6 mt-6 border-t border-neutral-200">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                      Last updated
                    </p>
                    <p className="text-base text-neutral-700 font-medium">
                      {new Date(savedDetails.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
