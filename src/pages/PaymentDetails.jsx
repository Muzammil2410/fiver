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
    bankName: '',
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
          bankName: formData.bankName,
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
        bankName: '',
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
        bankName: savedDetails.bankName || '',
        branchCode: savedDetails.branchCode || '',
        ibanNumber: savedDetails.ibanNumber || '',
      })
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Payment Details
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600">
            Manage your payment information for withdrawals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Payment Details Form - Takes 3 columns on large screens */}
          <div className="lg:col-span-3">
            <Card className="p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-primary-500">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600"
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
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Payment Information</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">Fill in your payment details below</p>
                </div>
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

                {/* Bank Name */}
                <Input
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
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
              <Card className="p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-success-500 bg-gradient-to-br from-success-50/50 to-white">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-success-600"
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
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Saved Details</h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">Your current payment information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                      Payment Method
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-primary-600">
                      {savedDetails.paymentMethod?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || savedDetails.paymentMethod}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                      Account Number
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-neutral-900 break-all">
                      {savedDetails.accountNumber}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                      Account Holder
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-neutral-900">
                      {savedDetails.accountHolderName}
                    </p>
                  </div>

                  {savedDetails.bankName && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                        Bank Name
                      </h3>
                      <p className="text-lg sm:text-xl font-bold text-neutral-900">
                        {savedDetails.bankName}
                      </p>
                    </div>
                  )}

                  {savedDetails.branchCode && (
                    <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                        Branch Code
                      </h3>
                      <p className="text-lg sm:text-xl font-bold text-neutral-900">
                        {savedDetails.branchCode}
                      </p>
                    </div>
                  )}

                  {savedDetails.ibanNumber && (
                    <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-xl border border-neutral-200 shadow-sm sm:col-span-2">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
                        IBAN Number
                      </h3>
                      <p className="text-base sm:text-lg font-bold text-neutral-900 break-all">
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
