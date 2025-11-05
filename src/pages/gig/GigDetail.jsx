import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PaymentUploadModal from '../../components/payments/PaymentUploadModal'
import ReviewList from '../../components/reviews/ReviewList'
import localStorageService from '../../utils/localStorage'
import { toast } from '../../utils/toast'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  
  useEffect(() => {
    fetchGig()
  }, [id])
  
  const fetchGig = async () => {
    try {
      const response = await localStorageService.gigs.getById(id)
      setGig(response.data)
    } catch (error) {
      console.error('Error fetching gig:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleOrder = async (pkg) => {
    setSelectedPackage(pkg)
    setShowOrderModal(true)
  }
  
  const handleConfirmOrder = async () => {
    try {
      const response = await localStorageService.orders.create({
        gigId: gig.id,
        package: selectedPackage?.name || 'standard',
      })
      setShowOrderModal(false)
      setShowPaymentModal(true)
      toast.success('Order created successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
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
        <div>Gig not found</div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          {gig.images && gig.images.length > 0 && (
            <Card>
              <div className="grid grid-cols-2 gap-2">
                {gig.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${gig.title} - Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            </Card>
          )}
          
          {/* Title & Info */}
          <Card>
            <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              {gig.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="font-semibold">{gig.rating.toFixed(1)}</span>
                  <span className="text-neutral-600">
                    ({gig.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
              {gig.deliveryTime && (
                <Badge variant="default">
                  {gig.deliveryTime} days delivery
                </Badge>
              )}
            </div>
            
            {/* Seller Info */}
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
              <Avatar
                src={gig.seller?.avatar}
                name={gig.seller?.name}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{gig.seller?.name}</h3>
                <p className="text-sm text-neutral-600">{gig.seller?.title}</p>
                {gig.seller?.level && (
                  <Badge variant="primary" size="sm" className="mt-1">
                    {gig.seller.level}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" onClick={() => navigate(`/seller/${gig.seller?.id}`)}>
                View Profile
              </Button>
            </div>
          </Card>
          
          {/* Description */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">About This Gig</h2>
            <p className="text-neutral-700 whitespace-pre-line">{gig.description}</p>
          </Card>
          
          {/* Requirements */}
          {gig.requirements && gig.requirements.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2">
                {gig.requirements.map((req, idx) => (
                  <li key={idx} className="text-neutral-700">{req}</li>
                ))}
              </ul>
            </Card>
          )}
          
          {/* Reviews */}
          <ReviewList gigId={id} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Select Package</h2>
            
            {gig.packages && gig.packages.length > 0 ? (
              <div className="space-y-3">
                {gig.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPackage?.name === pkg.name
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <span className="text-lg font-bold text-primary-600">
                        PKR {pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{pkg.description}</p>
                    <div className="text-sm space-y-1">
                      <p>Delivery: {pkg.deliveryTime} days</p>
                      <p>Revisions: {pkg.revisions}</p>
                    </div>
                    <Button
                      fullWidth
                      className="mt-3"
                      onClick={() => handleOrder(pkg)}
                    >
                      Order Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  PKR {gig.price?.toLocaleString() || 'N/A'}
                </div>
                <Button
                  fullWidth
                  onClick={() => handleOrder({ name: 'standard', price: gig.price })}
                >
                  Order Now
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Confirm Order</h2>
            <p className="mb-4">
              You are ordering: <strong>{selectedPackage?.name}</strong>
            </p>
            <p className="mb-4">
              Price: <strong>PKR {selectedPackage?.price?.toLocaleString()}</strong>
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmOrder}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Payment Upload Modal */}
      {showPaymentModal && (
        <PaymentUploadModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={null} // Pass order ID when available
          amount={selectedPackage?.price || gig.price}
        />
      )}
    </MainLayout>
  )
}

