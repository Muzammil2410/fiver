import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import localStorageService from '../../utils/localStorage'
import { toast } from '../../utils/toast'

export default function PaymentUploadModal({ isOpen, onClose, orderId, amount }) {
  const [formData, setFormData] = useState({
    paymentMethod: '',
    transactionId: '',
    amount: amount || '',
    notes: '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const paymentMethods = [
    'JazzCash',
    'Easypaisa',
    'Bank Transfer',
    'USDT',
  ]
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      
      setFile(selectedFile)
      setError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.paymentMethod) {
      setError('Please select a payment method')
      return
    }
    
    if (!formData.transactionId.trim()) {
      setError('Transaction ID is required')
      return
    }
    
    if (!file) {
      setError('Please upload a payment screenshot')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload file first (simulated)
      const uploadResponse = await localStorageService.payments.uploadFile(file)
      
      // Create payment record
      await localStorageService.payments.create({
        orderId,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        amount: parseFloat(formData.amount),
        imageUrl: uploadResponse.data.url,
        notes: formData.notes,
        status: 'pending',
      })
      
      // Success - show toast and close
      toast.success('Payment uploaded successfully!')
      onClose()
      // Reset form
      setFormData({
        paymentMethod: '',
        transactionId: '',
        amount: amount || '',
        notes: '',
      })
      setFile(null)
      setPreview(null)
    } catch (err) {
      setError(err.message || 'Failed to submit payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Payment Proof"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Payment Method *
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          disabled
        />
        
        <Input
          label="Transaction ID *"
          value={formData.transactionId}
          onChange={(e) =>
            setFormData({ ...formData, transactionId: e.target.value })
          }
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Payment Screenshot *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className="mt-2 text-sm text-danger-600 hover:text-danger-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-neutral-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Textarea
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
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
            Submit Payment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

