import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotificationStore } from '../../store/useNotificationStore'
import { toast } from '../../utils/toast'
import * as orderService from '../../services/orders'
import * as gigService from '../../services/gigs'
import * as paymentDetailsService from '../../services/paymentDetails'

export default function OrderPayment() {
  const { gigId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [gig, setGig] = useState(null)
  const [sellerPaymentDetails, setSellerPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState(null)
  const [requirements, setRequirements] = useState('')
  const [orderCreated, setOrderCreated] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [error, setError] = useState('')
  
  // Get package from location state
  const selectedPackage = location.state?.package || null
  const orderAmount = selectedPackage?.price || gig?.price || 0

  useEffect(() => {
    fetchGigAndPaymentDetails()
  }, [gigId])

  const loadSellerPaymentDetails = (sellerId, sellerName = null) => {
    if (!sellerId) {
      console.warn('⚠️ No seller ID provided')
      return
    }
    
    // Convert sellerId to string for consistent comparison
    const sellerIdStr = String(sellerId).trim()
    console.log('🔍 Looking for payment details for seller ID:', sellerIdStr)
    
    // FIRST: Check auth-storage to see what user IDs exist (to understand the ID format)
    let authStorageData = null
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        authStorageData = JSON.parse(authStorage)
        console.log('👤 Auth storage users:', authStorageData?.state?.user)
        console.log('🆔 User ID from auth storage:', authStorageData?.state?.user?.id)
      }
    } catch (e) {
      console.error('Error reading auth storage:', e)
    }
    
    // Collect ALL localStorage keys for debugging
    console.log('🔑 Scanning ALL localStorage keys...')
    const allLocalStorageKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      allLocalStorageKeys.push(localStorage.key(i))
    }
    console.log('📋 Total localStorage keys:', allLocalStorageKeys.length)
    console.log('📋 All localStorage keys:', allLocalStorageKeys)
    
    // Collect all payment-details keys and their data
    const allPaymentDetails = []
    const allKeys = []
    
    // Search all localStorage keys that start with "payment-details-"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('payment-details-')) {
        allKeys.push(key)
        try {
          const storedData = localStorage.getItem(key)
          if (storedData) {
            const paymentDetails = JSON.parse(storedData)
            allPaymentDetails.push({ key, data: paymentDetails })
            
            // Extract ID from key
            const keyId = key.replace('payment-details-', '').trim()
            
            console.log(`  🔍 Checking key: ${key}`)
            console.log(`     Key ID: ${keyId}`)
            console.log(`     Data userId: ${paymentDetails.userId}`)
            console.log(`     Has paymentMethod: ${!!paymentDetails.paymentMethod}`)
            
            // Match 1: Exact key match
            if (keyId === sellerIdStr) {
              if (paymentDetails.paymentMethod) {
                console.log('✅ ✅ ✅ FOUND by exact key match:', key)
                setSellerPaymentDetails(paymentDetails)
                return
              }
            }
            
            // Match 2: userId field in data matches sellerId
            if (paymentDetails.userId) {
              const dataUserId = String(paymentDetails.userId).trim()
              if (dataUserId === sellerIdStr) {
                if (paymentDetails.paymentMethod) {
                  console.log('✅ ✅ ✅ FOUND by userId field match:', key, 'userId:', dataUserId)
                  setSellerPaymentDetails(paymentDetails)
                  return
                }
              }
            }
            
            // Match 3: Try numeric comparison (in case one is number and one is string)
            if (!isNaN(sellerIdStr) && !isNaN(keyId)) {
              if (Number(sellerIdStr) === Number(keyId)) {
                if (paymentDetails.paymentMethod) {
                  console.log('✅ ✅ ✅ FOUND by numeric key match:', key)
                  setSellerPaymentDetails(paymentDetails)
                  return
                }
              }
            }
            
            // Match 4: Try numeric comparison with userId field
            if (paymentDetails.userId && !isNaN(sellerIdStr) && !isNaN(String(paymentDetails.userId))) {
              if (Number(sellerIdStr) === Number(paymentDetails.userId)) {
                if (paymentDetails.paymentMethod) {
                  console.log('✅ ✅ ✅ FOUND by numeric userId match:', key)
                  setSellerPaymentDetails(paymentDetails)
                  return
                }
              }
            }
          }
        } catch (err) {
          console.error('Error parsing payment details from key:', key, err)
        }
      }
    }
    
    // Log all found payment details for debugging
    console.log('📋 All payment-details keys found:', allKeys)
    console.log('📦 All payment details data:', allPaymentDetails.map(pd => ({
      key: pd.key,
      userId: pd.data?.userId,
      hasPaymentMethod: !!pd.data?.paymentMethod,
      paymentMethod: pd.data?.paymentMethod
    })))
    
    // LAST RESORT: If seller has only one gig and we find ANY payment details, use them
    // This handles the case where seller ID format doesn't match
    if (allPaymentDetails.length === 1 && allPaymentDetails[0].data.paymentMethod) {
      console.log('⚠️ Using single payment details found (ID mismatch, but only one seller exists)')
      setSellerPaymentDetails(allPaymentDetails[0].data)
      return
    }
    
    // ULTIMATE FALLBACK: If multiple payment details exist, try to match by checking
    // if any of the stored user IDs match any pattern with the seller ID
    if (allPaymentDetails.length > 0) {
      // Try to find the most recent payment details (by updatedAt)
      const sortedByDate = allPaymentDetails
        .filter(pd => pd.data.paymentMethod)
        .sort((a, b) => {
          const dateA = new Date(a.data.updatedAt || 0)
          const dateB = new Date(b.data.updatedAt || 0)
          return dateB - dateA
        })
      
      if (sortedByDate.length > 0) {
        console.log('⚠️ Using most recent payment details as fallback (ID mismatch)')
        console.log('💡 This is a workaround - seller ID from gig does not match payment details user ID')
        setSellerPaymentDetails(sortedByDate[0].data)
        return
      }
    }
    
    console.log('❌ No payment details found for seller ID:', sellerIdStr)
    console.log('💡 Available payment details user IDs:', allPaymentDetails.map(pd => pd.data?.userId).filter(Boolean))
    console.log('💡 Seller ID from gig:', sellerIdStr)
    console.log('💡 Make sure:')
    console.log('   1. The seller has saved their payment details at /payment-details')
    console.log('   2. The seller ID in the gig matches their user ID when they saved payment details')
    console.log('   3. Check the console above to see what payment details exist')
    
    setSellerPaymentDetails(null)
  }

  const fetchGigAndPaymentDetails = async () => {
    try {
      // Fetch gig details
      const gigResponse = await gigService.getGigById(gigId)
      const gigData = gigResponse.data
      setGig(gigData)
      
      // Get seller ID from multiple possible locations - try all possible formats
      const sellerId = gigData.sellerId || gigData.seller?.id || gigData.sellerId?.toString()
      const sellerName = gigData.seller?.name
      
      console.log('🔍 Fetching payment details for seller')
      console.log('📦 Gig data:', gigData)
      console.log('👤 Seller info:', gigData.seller)
      console.log('🆔 Seller ID from gig:', sellerId)
      console.log('👤 Seller Name:', sellerName)
      
      if (sellerId) {
        // PRIMARY: Fetch from backend API (real-time data)
        console.log('🌐 Fetching payment details from backend API for seller ID:', sellerId)
        console.log('🌐 API URL will be: /api/payment-details/user/' + sellerId)
        
        try {
          const paymentResponse = await paymentDetailsService.getPaymentDetailsByUserId(sellerId)
          console.log('📥 Backend API response:', paymentResponse)
          
          if (paymentResponse && paymentResponse.success && paymentResponse.data) {
            if (paymentResponse.data.paymentMethod) {
              console.log('✅ ✅ ✅ Found payment details from backend API!')
              console.log('💳 Payment method:', paymentResponse.data.paymentMethod)
              setSellerPaymentDetails(paymentResponse.data)
            } else {
              console.log('⚠️ Backend returned data but no paymentMethod field')
              setSellerPaymentDetails(null)
            }
          } else {
            console.log('⚠️ Backend API returned no payment details (404 or empty)')
            console.log('💡 Seller needs to save payment details at /payment-details')
            setSellerPaymentDetails(null)
          }
        } catch (apiError) {
          console.error('❌ Backend API error:', apiError)
          console.error('❌ Error details:', apiError.message)
          console.error('❌ Error response:', apiError.response?.data)
          console.log('⚠️ Make sure backend server is running on port 5000')
          setSellerPaymentDetails(null)
        }
      } else {
        console.warn('⚠️ No seller ID found in gig data')
        console.warn('📦 Full gig data structure:', JSON.stringify(gigData, null, 2))
        setSellerPaymentDetails(null)
      }
    } catch (error) {
      console.error('Error fetching gig:', error)
      toast.error('Failed to load gig details')
      navigate('/gigs')
    } finally {
      setLoading(false)
    }
  }

  // Refresh payment details periodically to get real-time updates from backend
  useEffect(() => {
    if (!gig) return
    
    const sellerId = gig.sellerId || gig.seller?.id
    if (sellerId) {
      // Refresh payment details every 3 seconds from backend API (real-time)
      const interval = setInterval(async () => {
        try {
          const paymentResponse = await paymentDetailsService.getPaymentDetailsByUserId(sellerId)
          if (paymentResponse.success && paymentResponse.data && paymentResponse.data.paymentMethod) {
            setSellerPaymentDetails(paymentResponse.data)
          }
        } catch (error) {
          // Silently fail on refresh
        }
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [gig])

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }
      
      // Compress and convert to base64
      const reader = new FileReader()
      reader.onloadend = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height
              height = MAX_HEIGHT
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          let quality = 0.7
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          let sizeInMB = compressedBase64.length / (1024 * 1024)
          
          while (sizeInMB > 10 && quality > 0.3) {
            quality -= 0.1
            compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            sizeInMB = compressedBase64.length / (1024 * 1024)
          }
          
          setPaymentScreenshot(compressedBase64)
          setError('')
        }
        img.onerror = () => {
          setError('Failed to process image')
        }
        img.src = event.target.result
      }
      reader.onerror = () => {
        setError('Failed to read image file')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!paymentScreenshot) {
      setError('Please attach payment screenshot')
      return
    }
    
    if (!user) {
      setError('You must be logged in to place an order')
      return
    }
    
    setSubmitting(true)
    
    try {
      const orderData = {
        gigId: gig._id || gig.id,
        gigTitle: gig.title,
        sellerId: gig.sellerId || gig.seller?.id,
        sellerName: gig.seller?.name || 'Seller',
        buyerName: user.name,
        package: selectedPackage?.name || 'standard',
        amount: orderAmount,
        paymentScreenshot: paymentScreenshot,
        requirements: requirements.trim(),
        deliveryTime: selectedPackage?.deliveryTime || gig.deliveryTime || 0,
      }
      
      const response = await orderService.createOrder(orderData)
      
      // Create notification for seller when order is placed
      // The notification will be picked up by the real-time polling in Navbar
      // But we can also create it here for immediate feedback
      if (response?.data && orderData.sellerId) {
        const order = response.data.data || response.data
        const notificationStore = useNotificationStore.getState()
        notificationStore.addNotification({
          id: `order-${order._id || order.id || Date.now()}-${Date.now()}`,
          type: 'order',
          message: `${orderData.buyerName || user?.name || 'A client'} has placed an order for ${orderData.gigTitle || gig?.title || 'your gig'}`,
          clientName: orderData.buyerName || user?.name || 'A client',
          gigTitle: orderData.gigTitle || gig?.title || 'your gig',
          orderId: order._id || order.id,
          read: false,
          createdAt: new Date().toISOString(),
          redirectTo: '/seller/orders'
        })
      }
      
      toast.success('Order placed successfully!')
      setCreatedOrder(response.data?.data || response.data)
      setOrderCreated(true)
    } catch (err) {
      setError(err.message || 'Failed to place order')
      toast.error('Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">Loading...</div>
      </MainLayout>
    )
  }

  if (!gig) {
    return (
      <MainLayout>
        <Card>
          <p>Gig not found</p>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Order</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Gig</p>
                  <p className="font-semibold">{gig.title}</p>
                </div>
                {selectedPackage && (
                  <>
                    <div>
                      <p className="text-sm text-neutral-600">Package</p>
                      <p className="font-semibold">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Description</p>
                      <p className="text-sm">{selectedPackage.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Delivery Time</p>
                      <p className="font-semibold">{selectedPackage.deliveryTime} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Revisions</p>
                      <p className="font-semibold">{selectedPackage.revisions}</p>
                    </div>
                  </>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total Amount</p>
                    <p className="text-2xl font-bold text-primary-600">
                      PKR {orderAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Screenshot Upload */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Complete Your Order</h2>
              {orderCreated ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Order Placed Successfully!</h3>
                    <p className="text-neutral-600 mb-6">Your order has been submitted and is waiting for seller confirmation.</p>
                  </div>
                  
                  {createdOrder && (
                    <div className="bg-neutral-50 rounded-lg p-6 mb-6 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-600 mb-1">Order Created:</p>
                          <p className="font-semibold">
                            {new Date(createdOrder.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {selectedPackage?.deliveryTime && (
                          <div>
                            <p className="text-neutral-600 mb-1">Expected Completion:</p>
                            <p className="font-semibold">
                              {new Date(new Date(createdOrder.createdAt).getTime() + (selectedPackage.deliveryTime * 24 * 60 * 60 * 1000)).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">({selectedPackage.deliveryTime} days from order date)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button onClick={() => navigate('/orders')} className="w-full md:w-auto">
                    View Orders
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <Textarea
                    label="Tell us about your requirements *"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                    placeholder="Describe what you need for this order. Be as detailed as possible..."
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Payment Screenshot *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="block w-full text-sm text-neutral-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        file:cursor-pointer
                        cursor-pointer"
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload a screenshot of your payment transaction. Max size: 5MB
                    </p>
                    {paymentScreenshot && (
                      <div className="mt-4">
                        <p className="text-sm text-neutral-600 mb-2">Preview:</p>
                        <img
                          src={paymentScreenshot}
                          alt="Payment screenshot preview"
                          className="w-full max-w-md h-64 object-contain rounded-md border border-neutral-200 shadow-sm bg-neutral-50"
                        />
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-danger-600 text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                      Submit Order
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column - Seller Payment Details */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Seller Payment Details</h2>
                <button
                  type="button"
                  onClick={async () => {
                    const sellerId = gig?.sellerId || gig?.seller?.id
                    if (sellerId) {
                      try {
                        setSellerPaymentDetails(null)
                        const paymentResponse = await paymentDetailsService.getPaymentDetailsByUserId(sellerId)
                        if (paymentResponse.success && paymentResponse.data && paymentResponse.data.paymentMethod) {
                          setSellerPaymentDetails(paymentResponse.data)
                          toast.success('Payment details refreshed')
                        } else {
                          toast.error('Payment details not found')
                        }
                      } catch (error) {
                        toast.error('Failed to refresh payment details')
                      }
                    }
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  title="Refresh payment details"
                >
                  🔄 Refresh
                </button>
              </div>
              {sellerPaymentDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Payment Method</p>
                    <p className="text-base font-semibold capitalize">
                      {sellerPaymentDetails.paymentMethod?.replace(/-/g, ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Account Number</p>
                    <p className="text-base font-semibold">
                      {sellerPaymentDetails.accountNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Account Holder Name</p>
                    <p className="text-base font-semibold">
                      {sellerPaymentDetails.accountHolderName || 'N/A'}
                    </p>
                  </div>
                  {sellerPaymentDetails.branchCode && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Branch Code</p>
                      <p className="text-base font-semibold">
                        {sellerPaymentDetails.branchCode}
                      </p>
                    </div>
                  )}
                  {sellerPaymentDetails.ibanNumber && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700">IBAN Number</p>
                      <p className="text-base font-semibold break-all">
                        {sellerPaymentDetails.ibanNumber}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-neutral-500">
                      Please transfer the exact amount to the seller's account and upload the payment screenshot.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 text-sm">
                    Seller has not provided payment details yet.
                  </p>
                  <p className="text-neutral-500 text-xs mt-2">
                    Please contact the seller for payment information.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      const sellerId = gig?.sellerId || gig?.seller?.id
                      if (sellerId) {
                        loadSellerPaymentDetails(sellerId)
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

