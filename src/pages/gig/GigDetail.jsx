import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Tag from '../../components/ui/Tag'
import Select from '../../components/ui/Select'
import PaymentUploadModal from '../../components/payments/PaymentUploadModal'
import ReviewList from '../../components/reviews/ReviewList'
import * as gigService from '../../services/gigs'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'
import { cropImageForFace } from '../../utils/imageCropper'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [error, setError] = useState('')
  
  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryTime: '',
    category: '',
    skills: [],
    coverImage: '',
    images: [],
    packages: [],
    requirements: [],
  })
  const [skillInput, setSkillInput] = useState('')
  
  useEffect(() => {
    fetchGig()
  }, [id])
  
  useEffect(() => {
    if (gig && user) {
      // Check if current user is the seller
      const isSeller = gig.seller?.id === user.id || gig.sellerId === user.id
      setIsEditing(isSeller)
      
      if (isSeller) {
        // Pre-fill form with gig data
        setFormData({
          title: gig.title || '',
          description: gig.description || '',
          price: gig.price?.toString() || '',
          deliveryTime: gig.deliveryTime?.toString() || '',
          category: gig.category || '',
          skills: gig.skills || [],
          coverImage: gig.coverImage || gig.image || '',
          images: gig.images || [],
          packages: gig.packages && gig.packages.length > 0 
            ? gig.packages.map(pkg => ({
                name: pkg.name,
                price: pkg.price?.toString() || '',
                description: pkg.description || '',
                deliveryTime: pkg.deliveryTime?.toString() || '',
                revisions: pkg.revisions?.toString() || '',
              }))
            : [
                { name: 'Basic', price: '', description: '', deliveryTime: '', revisions: '' },
                { name: 'Standard', price: '', description: '', deliveryTime: '', revisions: '' },
                { name: 'Premium', price: '', description: '', deliveryTime: '', revisions: '' },
              ],
          requirements: gig.requirements || [],
        })
      }
    }
  }, [gig, user])
  
  const fetchGig = async () => {
    try {
      const response = await gigService.getGigById(id)
      setGig(response.data)
    } catch (error) {
      console.error('Error fetching gig:', error)
      toast.error(error.message || 'Failed to fetch gig')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      })
      setSkillInput('')
    }
  }
  
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }
  
  const handlePackageChange = (index, field, value) => {
    const updatedPackages = [...formData.packages]
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      packages: updatedPackages,
    })
  }
  
  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements]
    updatedRequirements[index] = value
    setFormData({
      ...formData,
      requirements: updatedRequirements,
    })
  }
  
  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    })
  }
  
  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    })
  }
  
  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    
    if (!formData.title.trim()) {
      setError('Title is required')
      setSaving(false)
      return
    }
    
    try {
      // Process packages
      const processedPackages = formData.packages
        .filter(
          (pkg) =>
            pkg.price &&
            pkg.description.trim() &&
            pkg.deliveryTime &&
            pkg.revisions
        )
        .map((pkg) => ({
          name: pkg.name,
          price: parseInt(pkg.price),
          description: pkg.description.trim(),
          deliveryTime: parseInt(pkg.deliveryTime),
          revisions: parseInt(pkg.revisions),
        }))
      
      const processedRequirements = formData.requirements.filter((req) => req.trim())
      
      const updatedGig = {
        title: formData.title,
        description: formData.description,
        price: processedPackages.length > 0 ? processedPackages[0].price : parseInt(formData.price) || 0,
        deliveryTime: processedPackages.length > 0 ? processedPackages[0].deliveryTime : parseInt(formData.deliveryTime) || 0,
        category: formData.category,
        skills: formData.skills,
        coverImage: formData.coverImage,
        image: formData.coverImage, // Also set image for compatibility
        images: formData.images,
        packages: processedPackages,
        requirements: processedRequirements,
      }
      
      await gigService.updateGig(id, updatedGig)
      toast.success('Gig updated successfully!')
      
      // Refresh gig data
      await fetchGig()
    } catch (err) {
      setError(err.message || 'Failed to update gig')
      toast.error('Failed to update gig')
    } finally {
      setSaving(false)
    }
  }
  
  const handleOrder = async (pkg) => {
    setSelectedPackage(pkg)
    setShowOrderModal(true)
  }
  
  const handleConfirmOrder = () => {
    // Navigate to payment page with package details
    navigate(`/orders/payment/${gig._id || gig.id}`, {
      state: {
        package: selectedPackage,
        gig: gig
      }
    })
    setShowOrderModal(false)
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
  
  // If seller is editing, show edit form
  if (isEditing) {
    return (
      <MainLayout>
        <Card className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Gig</h1>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel Editing
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div>
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Title *"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                
                <Textarea
                  label="Description *"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  required
                />
                
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Cover Image (Background Picture) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Image size must be less than 5MB')
                            return
                          }
                          if (!file.type.startsWith('image/')) {
                            setError('Please upload a valid image file')
                            return
                          }
                          // Process image with face detection and cropping
                          const reader = new FileReader()
                          reader.onloadend = async (event) => {
                            try {
                              setError('Processing image and detecting face...')
                              
                              // Use face detection and cropping utility
                              const croppedImage = await cropImageForFace(
                                event.target.result,
                                1200, // maxWidth
                                800,  // maxHeight
                                0.7    // quality
                              )
                              
                              // Check final size
                              const sizeInMB = croppedImage.length / (1024 * 1024)
                              console.log(`📸 Processed image size: ${sizeInMB.toFixed(2)} MB`)
                              
                              // Final check - if still too large, show error
                              if (sizeInMB > 15) {
                                setError(`Image is still too large (${sizeInMB.toFixed(2)} MB) after processing. Please use a smaller image.`)
                                return
                              }
                              
                              setFormData({
                                ...formData,
                                coverImage: croppedImage,
                              })
                              setError('')
                              toast.success('Image processed successfully! Face is now properly visible.')
                            } catch (err) {
                              console.error('Image processing error:', err)
                              setError('Failed to process image: ' + err.message)
                            }
                          }
                          reader.onerror = () => {
                            setError('Failed to read image file')
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="block w-full text-sm text-neutral-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        file:cursor-pointer
                        cursor-pointer"
                    />
                  </div>
                  {formData.coverImage && (
                    <div className="mt-4">
                      <p className="text-sm text-neutral-600 mb-2">Preview:</p>
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-md border border-neutral-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Base price/delivery */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Base Price (PKR) - Optional"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Fallback if packages not set"
                  />
                  <Input
                    label="Base Delivery Time (days) - Optional"
                    type="number"
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryTime: e.target.value })
                    }
                    placeholder="Fallback if packages not set"
                  />
                </div>
                
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Select category"
                  required
                  options={[
                    { value: '', label: 'Select category' },
                    { value: 'social-media-management', label: 'Social Media Management' },
                    { value: 'video-editing', label: 'Video Editing' },
                    { value: 'logo-designing', label: 'Logo Designing' },
                    { value: 'seo-expert', label: 'SEO Expert' },
                    { value: 'website-development', label: 'Website Development' },
                    { value: 'web-designer', label: 'Web Designer' },
                    { value: 'wordpress-developer', label: 'WordPress Developer' },
                  ]}
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                      placeholder="Add skill and press Enter"
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Tag key={skill} onRemove={() => handleRemoveSkill(skill)}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
                
                {/* Packages Section */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Package Configuration</h2>
                  <div className="space-y-6">
                    {formData.packages.map((pkg, index) => (
                      <Card key={index} className="p-4 bg-neutral-50">
                        <h3 className="text-lg font-semibold mb-4 text-primary-600">
                          {pkg.name} Package
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Price (PKR) *"
                            type="number"
                            value={pkg.price}
                            onChange={(e) =>
                              handlePackageChange(index, 'price', e.target.value)
                            }
                            placeholder="e.g., 3000"
                            required
                          />
                          <Input
                            label="Delivery Time (days) *"
                            type="number"
                            value={pkg.deliveryTime}
                            onChange={(e) =>
                              handlePackageChange(index, 'deliveryTime', e.target.value)
                            }
                            placeholder="e.g., 5"
                            required
                          />
                          <Input
                            label="Number of Revisions *"
                            type="number"
                            value={pkg.revisions}
                            onChange={(e) =>
                              handlePackageChange(index, 'revisions', e.target.value)
                            }
                            placeholder="e.g., 2"
                            required
                          />
                          <div className="md:col-span-2">
                            <Textarea
                              label="Description *"
                              value={pkg.description}
                              onChange={(e) =>
                                handlePackageChange(index, 'description', e.target.value)
                              }
                              placeholder="Describe what's included in this package"
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Requirements Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Requirements</h2>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addRequirement}
                    >
                      Add Requirement
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder="Enter requirement"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeRequirement(index)}
                          className="text-danger-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {formData.requirements.length === 0 && (
                      <p className="text-sm text-neutral-500 italic">
                        No requirements added yet.
                      </p>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="text-danger-600 text-sm" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" loading={saving} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="space-y-4">
                  {/* Cover Image Preview */}
                  {formData.coverImage && (
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold">{formData.title || 'Gig Title'}</h3>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-3">
                      {formData.description || 'Gig description will appear here...'}
                    </p>
                  </div>
                  
                  {/* Price Preview */}
                  {formData.packages.length > 0 && formData.packages[0].price && (
                    <div>
                      <p className="text-sm text-neutral-600">Starting from</p>
                      <p className="text-xl font-bold text-primary-600">
                        PKR {parseInt(formData.packages[0].price || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Packages Preview */}
                  {formData.packages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Packages:</p>
                      {formData.packages.map((pkg, idx) => (
                        <div key={idx} className="p-2 bg-neutral-50 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{pkg.name}</span>
                            {pkg.price && (
                              <span className="text-primary-600">
                                PKR {parseInt(pkg.price || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Skills Preview */}
                  {formData.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge key={skill} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </MainLayout>
    )
  }
  
  // Read-only view for clients
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
          orderId={null}
          amount={selectedPackage?.price || gig.price}
        />
      )}
    </MainLayout>
  )
}
